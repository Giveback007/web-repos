import { stateManagerReactLinker, StateManager } from "@giveback007/browser-utils";
import { days, debounceTimeOut, equal, getDayStartEnd, hrs, objKeys, wait, wks } from "@giveback007/util-lib";
import { arrToDict, Dict, min } from "@giveback007/util-lib";
import type { AlertProps } from "my-alyce-component-lib";
import { Action } from "./actions";
import { Auth } from "./auth";
import { GoogleApis } from "./google-api";
import { genSyncObj, initOnlineState, syncOnlineState } from "./util/sync.util";
import type { Memory } from "./util/utils";

export type GpActions = typeof set.gamepadActions[any];

type User = {
    email: string;
    name: string;
    imgUrl: string;
}

/** const settings */
export const set = {
    /** Minimum time for review */
    minTime: 3500,

    // -- Score is the multiplier of timing on success -- //
    /** Minimum score */
    minScore: 0.01,
    /** Score divide on fail */
    scoreDivide: 2,
    /** Starting score for a memory */
    baseScore: 2,


    // -- Ease is the number added to the score on success -- //
    /** Starting ease for a memory */
    baseEase: 0.5,
    /** Minimum ease setting */
    minEase: 0.1,
    /** Ease add on success */
    easeAdd: 0.1,
    /** Ease subtract on fail */
    easeSub: 0.8,

    syncFileName: 'SyncData_V1.json',

    gamepadActions: ['down','left','right','exit','confirm']
} as const;

// -- STORE -- //
export type State = ReturnType<typeof timeFromMem> & {
    isLoading: boolean;
    user: User | null | 'loading';
    alert: AlertProps | null;
    /** 
     * not-read: no syncing will be done
     * initialize: do first sync
     */
    syncStatus: 'not-ready' | 'initialize' | 'syncing' | 'ready',
    syncUpdatedOn: number;
    syncState: {
        id: string;
        memorize: Memory[];
        deleted: { id: string, date: number }[];
        notIntroduced: Memory[];
    } | null;
    
    /** List of memories not introduced yet */
    notIntroduced: Memory[];

    /** List of memories to pratice */
    memorize: Memory[];

    /** List of deleted id's */
    deleted: { id: string, date: number }[];

    /** On memorize array change create memoryDict  */
    memoryDict: Dict<Memory>;

    /** Array of ids for ready to review, sorted by highest score */
    readyQnA: string[];
    forReview: string[];
    forLearn: string[];
    difficult: string[];
    practiceReady: string[];

    practice: string[];
    
    gamepadIsOn: boolean;
    gamepadBindings: Dict<{ [k in string]?: GpActions | null } | undefined>;
    gamepadBindingMode: boolean;
}

export const store = new StateManager<State>({
    isLoading: true,
    user: null,
    alert: null,
    syncStatus: 'not-ready',
    syncUpdatedOn: 0,
    syncState: null,

    notIntroduced: [],
    memorize: [],
    deleted: [],

    memoryDict: {},
    nextIncomingId: null,
    readyQnA: [],
    forReview: [],
    forLearn: [],
    difficult: [],
    practiceReady: [],

    practice: [],
    
    nReadyIn5min: 0,
    nReadyIn30min: 0,
    nReadyToday: 0,
    nReadyTomorrow: 0,
    nReadyThisWeek: 0,
    nReadyNextWeek: 0,
    tNow: Date.now(),

    gamepadIsOn: false,
    gamepadBindings: {},
    gamepadBindingMode: false,
}, {
    id: 'memory-helper-v2', // this has to be user-based
    useKeys: ['memorize', 'notIntroduced', 'deleted', "gamepadBindings"],
});

export const link = stateManagerReactLinker(store);

// -- EFFECTS -- //
// TODO: this should be `Middleware`
store.stateSub('memorize', s => {
    // make sure to always sort by reviewOn
    const memorize = s.memorize.sort((a, b) => a.reviewOn - b.reviewOn);
    const memoryDict = arrToDict(memorize, 'id');
    const notIntroduced = s.notIntroduced.filter(x => !memoryDict[x.id]);
    
    store.setState({ memoryDict, notIntroduced, memorize, ...timeFromMem(memorize) });
}, true);

export function timeFromMem(memorize: Memory[]) {
    const dNow = new Date()
    const tNow = dNow.getTime();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const { end: todaysEnd } = getDayStartEnd(dNow);
    const { end: tmrsEnd } = getDayStartEnd(tomorrow);
    
    const readyQnA: string[] = [];
    let nReadyIn5min =      0; const min5   = tNow + min(5);
    let nReadyIn30min =     0; const min30  = tNow + min(30);
    let nReadyToday =       0; const dys1   = todaysEnd.getTime() + hrs(1.99);
    let nReadyTomorrow =    0; const dys2   = tmrsEnd.getTime() + hrs(1.99);
    let nReadyThisWeek =    0; const wks1   = tNow + wks(1);
    let nReadyNextWeek =    0; const wks2   = tNow + wks(2);
    let nextIncomingId: null | string = null;

    /** Because memorize is sorted by `reviewOn`: */
    for (const { id, reviewOn: rw } of memorize) {
        if (rw < tNow) {
            readyQnA.push(id);
            nReadyToday++;

            continue;
        }
        
        if (!nextIncomingId) nextIncomingId = id;

        if (rw < dys1) {
            nReadyToday++;
            if (rw < min5)
                nReadyIn5min++;
            else if (rw < min30)
                nReadyIn30min++;
        } else if (rw < dys2) {
            nReadyTomorrow++;
        } else if (rw < wks1) {
            nReadyThisWeek++;
        } else if (rw < wks2) {
            nReadyNextWeek++;
        }
        else break;
    }

    return {
        nextIncomingId,
        readyQnA,
        nReadyIn5min,
        nReadyIn30min,
        nReadyToday,
        nReadyTomorrow,
        nReadyThisWeek,
        nReadyNextWeek,
        tNow
    }
}

// https://developers.google.com/drive/api/v3/reference/files/watch
store.stateSub(['deleted', 'memorize', 'notIntroduced'], async (s) => {
    if (!s.syncState || !s.user) return;
    
    await wait(0);
    store.setState({ syncState: { ...genSyncObj(s), id: s.syncState.id } });
});

const debounce = debounceTimeOut();
store.stateSub(['syncState'], (s, prev) => {
    if (!(s.syncStatus === 'ready' || s.syncStatus === 'syncing')) return;
    if (equal(genSyncObj(s), prev?.syncState && genSyncObj(prev))) return;

    store.setState({ syncStatus: 'syncing' });
    return debounce(async () => {
        await syncOnlineState(prev?.syncState || s.syncState);
        store.setState({ syncStatus: 'ready' });
    }, 1500);
})

// 1
store.stateSub(['syncStatus'], async (s) => {
    const { syncStatus } = s;
    
    if (syncStatus === 'initialize') {
        const api = new GoogleApis();
        const { files } = await api.searchJSON({ name: set.syncFileName, appDataFolder: true });

        // const { files: f2 } = await api.searchJSON({ appDataFolder: true });
        // log('ALL-FILES:', f2.length, f2);
        // await Promise.all(f2.map(({ id }) => api.deleteFile(id)));
        // return log('DONE!')

        if (!files[0]) {
            const syncState = await initOnlineState();
            store.setState({ syncState, syncStatus: 'ready' });
        } else {
            const id = files[0].id;
            const syncState = { ...await api.readJSONFile(id), id };
            
            // const token = (await auth.google).currentUser.get().getAuthResponse().access_token;
            // const data = await api.readJSONFile(files[0].id);
            // log({ id: files[0].id, data, token});
            
            await store.setState({ syncState, syncStatus: 'ready' });
        }
    }
});

export const auth = new Auth({ GOOGLE_CLIENT_ID });
store.actionSub([
    Action.loginSuccess,
    Action.logOut,
], async (a) => {
    switch (a.type) {
        case 'LOGIN_SUCCESS':
            const cr = (await auth.google).currentUser
            const pr = cr.get().getBasicProfile();

            if (!cr.get().hasGrantedScopes('https://www.googleapis.com/auth/drive.appdata')) {
                store.setState({
                    alert: {
                        type: 'warning',
                        title: 'Access Needed To Syncing Across Devices... ',
                        style: { position: 'fixed', top: 5, right: 5, zIndex: 9999 },
                        onClose: () => store.setState({ alert: null }),
                    }
                });

                try {
                    await cr.get().grant({
                        scope: 'https://www.googleapis.com/auth/drive.appdata'
                    });
                } catch {
                    return store.setState({
                        alert: {
                            type: 'danger',
                            title: "Failed To Receive Syncing Access",
                            onClose: () => store.setState({ alert: null }),
                            timeoutMs: 5000,
                            style: { position: 'fixed', top: 5, right: 5, zIndex: 9999 }
                        }
                    })
                }
            }
            
            return store.setState({
                syncStatus: 'initialize',
                user: {
                    email: pr.getEmail(),
                    name: pr.getName(),
                    imgUrl: pr.getImageUrl(),
                },
                alert: {
                    type: 'info',
                    title: 'Logged In',
                    onClose: () => store.setState({ alert: null }),
                    timeoutMs: 5000,
                    style: { position: 'fixed', top: 5, right: 5, zIndex: 9999 }
                }
            });
        case 'LOGOUT':
            await auth.singOut('google');
            return store.setState({
                user: null,
                alert: {
                    type: 'info',
                    title: 'Logged Out',
                    onClose: () => store.setState({ alert: null }),
                    timeoutMs: 7500,
                    style: { position: 'fixed', top: 5, right: 5, zIndex: 9999 }
                }
            });
        default:
            console.log(a);
            throw new Error('Not Implemented');
    }
});

store.stateSub(['memoryDict', 'readyQnA', 'memorize'], (s) => {

    const { readyQnA, memoryDict: dict, practice } = s;
    const now = Date.now();
    
    const obj = {
        forReview:      [] as string[],
        forLearn:       [] as string[],
        difficult:      [] as string[],
        practiceReady:  [] as string[],
        practice,
    };

    const nonReview: string[] = [];

    readyQnA.sort((a, b) => dict[b].score - dict[a].score).forEach(id => {
        const mem = dict[id];

        if (mem.timing > days(2))
            obj.forReview.push(id);
        else
            nonReview.push(id);
    });

    practice.forEach(id =>
        dict[id].reviewOn <= now && obj.practiceReady.push(id));

    if (nonReview.length && !obj.forReview.length && !obj.practiceReady.length) {
        const id = nonReview.shift() as string;

        practice.push(id);
        obj.practiceReady.push(id);
    }
    
    const practiceSet = new Set(practice);
    nonReview.forEach(id => {
        if (practiceSet.has(id)) return;
        obj[dict[id].score < set.baseScore ? 'difficult' : 'forLearn'].push(id)
    });

    store.setState(obj);
})


const keyMap: Map<GpActions, () => any> = new Map(([
    [ 'confirm', 'ArrowDown' ],
    [ 'exit', 'KeyX' ],

    [ 'down', 'ArrowDown' ],
    [ 'left', 'ArrowLeft' ],
    [ 'right', 'ArrowRight' ],
] as const).map(([btn, key]) => [btn, () => dispatchEvent(new KeyboardEvent("keydown", { key }))] as const));


store.actionSub('gamepad', ({ data: { id, btn } }: { type: string, data: { id: string; btn: string } }) => {
    const { gamepadBindings, gamepadBindingMode } = store.getState();
    if (gamepadBindingMode) return;

    const action = gamepadBindings[id]?.[btn];
    if (!action) return log(btn);

    keyMap.get(action)?.();
});

export function bindGpButton(id: string, btn: string, action: GpActions) {
    const { gamepadBindings } = store.getState();
    const obj = gamepadBindings[id] || {};
    Object.entries(obj).forEach(([_btn, _action]) =>
        _action === action && (obj[_btn] = null)
    );

    store.setState({ gamepadBindings: {
        ...gamepadBindings,
        [id]: {...obj, [btn]: action}
    } });
}
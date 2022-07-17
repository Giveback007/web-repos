import { stateManagerReactLinker, StateManager } from "@giveback007/browser-utils";
import { debounceTimeOut, equal, wait, wks } from "@giveback007/util-lib";
import { arrToDict, Dict, dys, min } from "@giveback007/util-lib";
import type { AlertProps } from "my-alyce-component-lib";
import { Action } from "./actions";
import { Auth } from "./auth";
import { GoogleApis } from "./google-api";
import { genSyncObj, initOnlineState, syncOnlineState } from "./util/sync.util";
import type { Memory } from "./util/utils";

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
    minScore: 1.1,
    /** Score divide on fail */
    scoreDivide: 2,
    /** Starting score for a memory */
    baseScore: 1.5,


    // -- Ease is the number added to the score on success -- //
    /** Starting ease for a memory */
    baseEase: 0.5,
    /** Minimum ease setting */
    minEase: 0.1,
    /** Ease add on success */
    easeAdd: 0.1,
    /** Ease subtract on fail */
    easeSub: 0.3,

    syncFileName: 'SyncData_V1.json',
} as const;

// -- STORE -- //
export type State = {
    isLoading: boolean;
    user: User | null | 'loading';
    alert: AlertProps | null;
    /** 
     * not-read: no syncing will be done
     * initialize: do first sync
     */
    syncStatus: 'not-ready' | 'initialize' | 'syncing' | 'ready',
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

    /** The id of item to be added to readyQnA */
    nextIncomingId: string | null;

    // -- TIME STATE -- //
    nReadyIn5min: number,
    nReadyToday: number,
    nReadyTomorrow: number,
    nReadyThisWeek: number,

    tNow: number;
}

export const store = new StateManager<State>({
    isLoading: true,
    user: null,
    alert: null,
    syncStatus: 'not-ready',
    syncState: null,

    notIntroduced: [],
    memorize: [],
    deleted: [],

    memoryDict: {},
    readyQnA: [],
    nextIncomingId: null,
    
    nReadyIn5min: 0,
    nReadyToday: 0,
    nReadyTomorrow: 0,
    nReadyThisWeek: 0,
    tNow: Date.now(),
}, {
    id: 'memory-helper-v2', // this has to be user-based
    useKeys: ['memorize', 'notIntroduced', 'deleted'],
});

export const link = stateManagerReactLinker(store);

// -- EFFECTS -- //
// TODO: this should be `Middleware`
store.stateSub('memorize', s => {
    const memorize = s.memorize.sort((a, b) => a.reviewOn - b.reviewOn);
    const memoryDict = arrToDict(memorize, 'id');
    
    store.setState({ memoryDict, memorize, ...timeFromMem(memorize) });
}, true);

export function timeFromMem(memorize: Memory[]) {
    const dNow = new Date()
    const tNow = dNow.getTime();
    
    const readyQnA: string[] = [];
    let nReadyIn5min =      0; const min5 = tNow + min(5);
    let nReadyToday =       0; const dys1 = tNow + dys(1);
    let nReadyTomorrow =    0; const dys2 = tNow + dys(2);
    let nReadyThisWeek =    0; const wks1 = tNow + wks(1);
    let nextIncomingId: null | string = null;

    /** Because memorize is sorted by `reviewOn`: */
    for (const { id, reviewOn: rw } of memorize) {
        if (rw < tNow) {
            readyQnA.push(id);
            continue;
        }
        
        if (!nextIncomingId) nextIncomingId = id;
        if (rw < min5) nReadyIn5min++;

        if (rw < dys1) nReadyToday++;
        if (rw < dys2) nReadyTomorrow++;
        if (rw < wks1) nReadyThisWeek++;
        else break;
    }

    return {
        nextIncomingId,
        readyQnA,
        nReadyIn5min,
        nReadyToday,
        nReadyTomorrow,
        nReadyThisWeek,
        tNow
    }
}


// https://developers.google.com/drive/api/v3/reference/files/watch


store.stateSub(['deleted', 'memorize', 'notIntroduced'], async (s) => {
    if (!s.syncState) return;
    
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
            // log({ id: files[0].id, data: x, token})
            
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
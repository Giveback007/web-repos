import { stateManagerReactLinker, StateManager } from "@giveback007/browser-utils";
import { isType, wks } from "@giveback007/util-lib";
import { arrToDict, Dict, dys, min, objVals, rand, sec } from "@giveback007/util-lib";
import type { AlertProps } from "my-alyce-component-lib";
import { Action } from "./actions";
import { Auth } from "./auth";
import { arrRmIdx, calcMem, Memory } from "./utils";

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
} as const;

// -- STORE -- //
export type State = {
    isLoading: boolean;
    user: User | null | 'loading';
    alert: AlertProps | null;
    
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
    id: 'memory-helper-v2',
    useKeys: ['memorize', 'notIntroduced'],
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

// -- STORE UTILS -- //
export function addQnA({ q, a, immediate }: { q: string; a: string; immediate: boolean; }) {
    const key = immediate ? 'memorize' : 'notIntroduced';
    const mem = new Memory(q, a);

    store.setState({ [key]: [...store.getState()[key], mem ] });
}

export function updateMem(id: string, success: boolean) {
    const dict = {...store.getState().memoryDict};
    const mem = calcMem({...dict[id]}, success);

    dict[id] = mem;
    const memorize = objVals(dict);
    store.setState({ memorize });
}

export function deleteMem(id: string) {
    const { memoryDict, deleted: del } = store.getState();
    const dict = { ...memoryDict};

    delete dict[id];

    const deleted = [...del];
    deleted.push({ id, date: Date.now() })

    const memorize = objVals(dict);
    store.setState({ memorize, deleted });
}

export function importMems(mems: Memory[]) {
    const dict = arrToDict(store.getState().memorize, 'id');
    mems.forEach(m => dict[m.id] = m);

    store.setState({ memorize: objVals(dict) });
}

export function learnNewWord() {
    const { notIntroduced: ni, memorize } = store.getState();
    const idx = rand(0, ni.length - 1);
    const mem = ni[idx];
    const notIntroduced = arrRmIdx(ni, idx);
    
    store.setState({ notIntroduced, memorize: [...memorize, mem] });
    return mem.id;
}

/** Take a list of   */
export function importWords(imp: {
    memorize: Memory[];
    notIntroduced: Memory[]
} | [string, string][]) {
    if (isType(imp, 'array')) 
        return imp.forEach(([q, a]) => addQnA({ q, a, immediate: false }));

    const { memorize, notIntroduced } = store.getState();
    const meDict = arrToDict(memorize, 'id');
    const niDict = arrToDict(notIntroduced, 'id');

    imp.memorize.forEach(x => meDict[x.id] = x);
    imp.notIntroduced.forEach(x => niDict[x.id] = x);

    store.setState({
        memorize: objVals(meDict),
        notIntroduced: objVals(niDict),
    });
}

export const auth = new Auth({ GOOGLE_CLIENT_ID });

store.actionSub([
    Action.loginSuccess,
    Action.logOut,
], async (a) => {
    switch (a.type) {
        case 'LOGIN_SUCCESS':
            const pr = (await auth.google).currentUser.get().getBasicProfile();
            
            return store.setState({
                user: {
                    email: pr.getEmail(),
                    name: pr.getName(),
                    imgUrl: pr.getImageUrl(),
                },
                alert: {
                    type: 'info',
                    title: 'Logged In',
                    onClose: () => store.setState({ alert: null }),
                    timeoutMs: 7500,
                    style: { position: 'fixed', top: 75, right: 5, zIndex: 1100 }
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
                    style: { position: 'fixed', top: 5, right: 5 }
                }
            });
        default:
            console.log(a);
            throw new Error('Not Implemented');
    }
});
import { stateManagerReactLinker, StateManager } from "@giveback007/browser-utils";
import { wks } from "@giveback007/util-lib";
import { arrToDict, Dict, dys, min, objVals, rand, sec } from "@giveback007/util-lib";
import { arrRmIdx, calcMem, Memory } from "./utils";

/** const settings */
export const set = {
    /** Minimum time for review */
    minTime: sec(3),


    // -- Score is the multiplier of timing on success -- //
    /** Minimum score */
    minScore: 1.1,
    /** Score divide on fail */
    scoreDivide: 3,
    /** Starting score for a memory */
    baseScore: 1.5,


    // -- Ease is the number added to the score on success -- //
    /** Starting ease for a memory */
    baseEase: 0.5,
    /** Minimum ease setting */
    minEase: 0.05,
    /** Ease add on success */
    easeAdd: 0.15,
    /** Ease subtract on fail */
    easeSub: 0.35,
} as const;

// -- STORE -- //
export type State = {
    /** List of memories not introduced yet */
    notIntroduced: Memory[];

    /** List of memories to pratice */
    memorize: Memory[];

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
    notIntroduced: [],
    memorize: [],
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
    const tNow = Date.now();
    
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

        if      (rw < dys1) nReadyToday++;
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
    const dict = {...store.getState().memoryDict};
    delete dict[id];

    const memorize = objVals(dict);
    store.setState({ memorize });
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
export function importWords(obj: {
    memorize: Memory[];
    notIntroduced: Memory[]
}) {
    const { memorize, notIntroduced } = store.getState();
    const meDict = arrToDict(memorize, 'id');
    const niDict = arrToDict(notIntroduced, 'id');

    obj.memorize.forEach(x => meDict[x.id] = x);
    obj.notIntroduced.forEach(x => niDict[x.id] = x);

    store.setState({
        memorize: objVals(meDict),
        notIntroduced: objVals(niDict),
    });
}

import { stateManagerReactLinker, StateManager } from "@giveback007/browser-utils";
import { objKeys } from "@giveback007/util-lib";
// import { StateManager } from "@giveback007/browser-utils/src/state-manager";
import { arrToDict, Dict, dys, hrs, min, objVals, rand, sec } from "@giveback007/util-lib";
import { arrRmIdx, calcMem, Memory } from "./utils";

/** const settings */
export const set = {
    /** Score to add on success */
    scoreAdd: 0.2,
    /** Score to subtract on fail */
    scoreSub: -0.35,
    /** Minimum score */
    minScore: 1.15,
    /** Time set on fail */
    timeOnFail: sec(3),
    /** (timing < n) -> "review mode" meaning diffrent timing on success */
    reviewModeTiming: min(5),
    /** Review multiplier */
    reviewMultiplier: 1.45,
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
    nReadyIn1min: number,
    nReadyIn5min: number,
    nReadyIn1hrs: number,
    nReadyIn1dys: number,
    tNow: number;
}

export const store = new StateManager<State>({
    notIntroduced: [],
    memorize: [],
    memoryDict: {},
    readyQnA: [],
    nextIncomingId: null,
    
    nReadyIn1min: 0,
    nReadyIn5min: 0,
    nReadyIn1hrs: 0,
    nReadyIn1dys: 0,
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
    let nReadyIn1min = 0;   const min1 = tNow + min(1);
    let nReadyIn5min = 0;   const min5 = tNow + min(5);
    let nReadyIn1hrs = 0;   const hrs1 = tNow + hrs(1);
    let nReadyIn1dys = 0;   const dys1 = tNow + dys(1);
    let nextIncomingId: null | string = null;

    /** Becouse memorize is sorted by `reviewOn`: */
    for (const { id, reviewOn: rw } of memorize) {
        if (rw < tNow) {
            readyQnA.push(id);
            continue;
        }
        
        if (!nextIncomingId) nextIncomingId = id;

        if (rw < min1) nReadyIn1min++;
        else if (rw < min5) nReadyIn5min++;
        else if (rw < hrs1) nReadyIn1hrs++;
        else if (rw < dys1) nReadyIn1dys++;
        else break;
    }

    return {
        nextIncomingId,
        readyQnA,
        nReadyIn1min,
        nReadyIn5min,
        nReadyIn1hrs,
        nReadyIn1dys,
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

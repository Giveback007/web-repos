import { arrToDict, isType, objVals, rand } from "@giveback007/util-lib";
import { store } from "../store";
import { arrRmIdx, calcMem, Memory } from "./utils";

// -- STORE UTILS -- //
export function addQnA({ q, a, immediate }: { q: string; a: string; immediate: boolean; }) {
    const key = immediate ? 'memorize' : 'notIntroduced';
    const mem = new Memory(q, a);

    store.setState({ [key]: [...store.getState()[key], mem ] });
}

export function updateMem(id: string, success: boolean) {
    const { memoryDict, practice } = store.getState()
    const dict = {...memoryDict};
    const mem: Memory = calcMem({...dict[id]}, success);
    mem.updatedOn = Date.now();

    dict[id] = mem;
    const memorize = objVals(dict);
    const prct = new Set(practice);
    prct.add(id);
    store.setState({ memorize, practice: [...prct.values()] });
}

export function deleteMem(id: string | 'DELETE-ALL') {
    const { memoryDict, deleted: del, notIntroduced } = store.getState();
    const dict = { ...memoryDict};
    const now = Date.now();

    const toDel: string[] = [];
    if (id === 'DELETE-ALL') {
        toDel.push(...objVals(dict).map(({id}) => id));
        notIntroduced.map(({ id }) => ({id, date: now}));
        store.setState({ notIntroduced: [] });
    } else toDel.push(id);

    const deleted = [...del];
    toDel.forEach(id => {
        delete dict[id];
        deleted.push({ id, date: now })
    });

    const memorize = objVals(dict);
    store.setState({ memorize, deleted, alert: {
        type: 'info',
        title: id === 'DELETE-ALL' ? 'All Items Deleted' : 'Deleted 1 Item',
        style: { position: 'fixed', top: 5, right: 5, zIndex: 9999 },
        timeoutMs: 5000
    } });
}

export function importMems(mems: Memory[]) {
    const dict = arrToDict(store.getState().memorize, 'id');
    mems.forEach(m => dict[m.id] = m);

    store.setState({ memorize: objVals(dict) });
}

export async function learnNewWord() {
    const { notIntroduced: ni, memorize } = store.getState();
    if (!ni.length) return null;
    
    const idx = rand(0, ni.length - 1);
    const mem = ni[idx];
    const notIntroduced = arrRmIdx(ni, idx);
    
    await store.setState({ notIntroduced, memorize: [...memorize, mem] });
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
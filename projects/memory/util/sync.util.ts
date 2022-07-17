import { equal } from "@giveback007/util-lib";
import { GoogleApis } from "../google-api";
import { set, State, store } from "../store";
import { Memory, objToFormData } from "./utils";

export function genSyncObj(s = store.getState()) {
    const { deleted, memorize, notIntroduced } = s;
    return { deleted, memorize, notIntroduced };
}

export const syncOnlineState = async (prevSyncState: State['syncState']) => {
    const s = store.getState();
    const { syncState } = s;

    if (!syncState)
        throw new Error('syncState is not assigned a value.');

    const { deleted: syDel, memorize: syMem, notIntroduced: syNot } = syncState;
    const { deleted: stDel, memorize: stMem, notIntroduced: stNot } = s;

    const syMemMap = genMap(syMem);
    const stMemMap = genMap(stMem);

    const syNotMap = genMap(syNot);
    const stNotMap = genMap(stNot);

    const delMems = genMap([...syDel, ...stDel]);
    delMems.forEach(({ id }) =>
        [syMemMap, stMemMap, syNotMap, stNotMap].forEach(map => map.has(id) && map.delete(id)));
    
    const deleted = [...delMems.values()].sort((a, b) => a.date - b.date);
    const memorize = merge(syMemMap, stMemMap);
    const notIntroduced = merge(syNotMap, stNotMap);

    const newSyncState = { id: syncState.id, deleted, memorize, notIntroduced };
    await store.setState({ deleted, memorize, notIntroduced });

    if (!equal(prevSyncState, newSyncState)) {
        const api = new GoogleApis();
        await api.updateFile(syncState.id, newSyncState);
    }
}

/** Creates a new file to store app state. */
export async function initOnlineState() {
    const api = new GoogleApis();
    const obj = genSyncObj();

    try {
        const { id } = await api.uploadFile(objToFormData(obj, set.syncFileName, 'appDataFolder'));
        if (!id) throw new Error('Failed to sync data.');
        return {...obj, id, updatedOn: Date.now()};
    } catch(err) {
        console.log(err);
        store.setState({ syncStatus: 'not-ready', alert: {
            type: 'danger',
            title: "Failed To Sync Data",
            style: { position: 'fixed', top: 5, right: 5, zIndex: 9999 },
            onClose: () => store.setState({ alert: null }),
        } });

        throw new Error('Failed To Init Sync Data');
    }
}

const genMap = <T extends { id: string }>(o: T[]) => new Map(o.map(x => [x.id, x]));
const merge = <T extends Map<string, Memory>>(map1: T, map2: T) => {
    const arr: Memory[] = [];
    new Set([...map1.keys(), ...map2.keys()]).forEach(id => {
        const mem = (() => {
            const mem1 = map1.get(id);
            const mem2 = map2.get(id);
            if (!mem1 || !mem2) return mem2 || mem1 as Memory;
            if (equal(mem1, mem2)) return mem2 as Memory;

            mem1.updatedOn = mem1.updatedOn || mem1.timeCreated;
            mem2.updatedOn = mem2.updatedOn || mem2.timeCreated;

            return mem1.updatedOn > mem2.updatedOn ? mem1 : mem2;
        })();

        arr.push(mem);
    });

    return arr.sort((a, b) => a.timeCreated - b.timeCreated);
}
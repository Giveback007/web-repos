import { StateManager, stateManagerReactLinker } from "@giveback007/browser-utils";
import { isType, min } from "@giveback007/util-lib";
import type { TextItems } from "../utils/utils";
import type { AllActions } from "./actions";

/** App constants `read only`  */
export const cst = {
    /** The time that the app loaded */
    appStartTime: Date.now()
} as const;

export type State = {
    items: TextItems;
    selectedItem: number;
    currentItemReading: { text: string; id: string; } | null;
    /** Flag to indicate if should ding */
    doDingForTime: boolean;
    didFinish: boolean;


    // SETTINGS //
    doScramble: boolean;
    doSpeak: boolean;

    // TODO
    autoNext: boolean;

    // -- MODALS -- //
    /** Modal to add text to parse into list */
    addTextModal: boolean;
    /** Modal to set max time per item */
    maxTimeModal: boolean;
    /** Modal to take total time and divide that by total items */
    totalTimeModal: boolean;

    // TODO: move times into StateManager
    /** Time to be spent on reviewing each item */
    timePerItem: number;
    /** Time a selected item started (if no item is selected `appLoadTime` is used) */
    startTime: number;
    /** Time now */
    timeNow: number;

    currentUser: null | gapi.auth2.BasicProfile | 'loading';
}

export const store = new StateManager<State, AllActions>({
    items: [],
    selectedItem: -1,
    currentItemReading: null,
    doDingForTime: false,
    didFinish: false,
    doScramble: true,
    doSpeak: false,
    autoNext: false,
    timePerItem: min(2),
    addTextModal: false,
    maxTimeModal: false,
    totalTimeModal: false,
    startTime: cst.appStartTime,
    timeNow: cst.appStartTime,
    currentUser: null,
}, {
    id: 'ListMem-v1',
    useKeys: ['items', 'timePerItem', 'autoNext']
});

export const link = stateManagerReactLinker(store);

export const nextItem = (i?: number) => {
    const { selectedItem, items } = store.getState();
    const maxIdx = items.length - 1;

    const nextIdx = isType(i, 'number') ? i : selectedItem + 1 > maxIdx ? 0 : selectedItem + 1;
    store.setState({ selectedItem: nextIdx, didFinish: false });
}

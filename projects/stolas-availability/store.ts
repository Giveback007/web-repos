import { StateManager, stateManagerReactLinker } from "@giveback007/browser-utils/src";
import { arrToDict, Dict } from "@giveback007/util-lib";
const dtStart = new Date();

export const set = {
    dtStart,
    eventColorMap: ['red', 'yellow', 'orange', 'green'],
    nowYM: { y: dtStart.getFullYear(), m: dtStart.getMonth(), d: dtStart.getDate() },
}

export type State = {
    uploadTime: null | number;
    rooms: Room[];
    roomDict: Dict<Room>;
    selectedRoom: null | string;
    /** 0 is current month */
    selectedMonth: number;
}

export const store = new StateManager<State>({
    uploadTime: null,
    selectedRoom: null,
    roomDict: {},
    selectedMonth: 0,
    rooms: [],
}, {
    id: 'Stolas-Availability-v4',
    useKeys: ['rooms', 'uploadTime'],
});

export const link = stateManagerReactLinker(store);

store.stateSub('rooms', ({ rooms }) => {
    const roomDict = arrToDict(rooms, 'roomName');
    store.setState({ roomDict });
})

import { StateManager, stateManagerReactLinker } from "@giveback007/browser-utils/src";
import { arrToDict, Dict, objKeys } from "@giveback007/util-lib";
const dtStart = new Date();

// 0 - closed
// 1 - tentative ("verbally committed but hasn't actually committed")
// 2 - pending ("already committed but hasn't paid")
// 3 - paid

export const set = {
    dtStart,
    eventColorMap: ['#fa0223', '#f5e905', '#fa9b02', '#13bd3d'],
    nowYM: { y: dtStart.getFullYear(), m: dtStart.getMonth(), d: dtStart.getDate() },
}

export type State = {
    uploadTime: null | number;
    rooms: Room[];
    roomDict: Dict<Room> | null;
    selectedRoom: null | string;
    /** 0 is current month */
    selectedMonth: number;
    roomTypes: Dict<Room[]> | null;
}

export const store = new StateManager<State>({
    uploadTime: null,
    selectedRoom: null,
    roomDict: null,
    selectedMonth: 0,
    rooms: [],
    roomTypes: null,
}, {
    id: 'Stolas-Availability-v5',
    useKeys: ['rooms', 'uploadTime'],
});

export const link = stateManagerReactLinker(store);

store.stateSub('rooms', ({ rooms }) => {
    const roomDict: Dict<Room> = {}; // arrToDict(rooms, 'roomName')
    const roomTypes: Dict<Room[]> = {};

    rooms.forEach((room) => {
        const { roomName, roomType } = room;
        roomDict[roomName] = room;

        if (!roomTypes[roomType]) roomTypes[roomType] = [];
        roomTypes[roomType].push(room);
    });

    objKeys(roomTypes).forEach(roomType => {
        roomTypes[roomType] = roomTypes[roomType].sort((a, b) => {
            if (a.roomName < b.roomName) return -1;
            if (a.roomName > b.roomName) return 1;
            return 0;
        });
    });

    store.setState({ roomDict, roomTypes });
});

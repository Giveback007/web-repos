import { StateManager, stateManagerReactLinker } from "@giveback007/browser-utils/src";
import { Dict, objKeys } from "@giveback007/util-lib";
import type { AlertProps } from "my-alyce-component-lib";
import { Action, AllActions } from "./actions";
import { Auth } from "./auth";
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

export const auth = new Auth({ GOOGLE_CLIENT_ID });

export type State = {
    rooms: Room[];
    roomDict: Dict<Room> | null;
    selectedRoom: null | string;
    /** 0 is current month */
    selectedMonth: number;
    roomTypes: Dict<Room[]> | null;
    user: User | null | 'loading';
    isLoading: boolean;
    googleSheetId: string | null;
    alert: AlertProps | null;
}

export const store = new StateManager<State, AllActions>({
    selectedRoom: null,
    roomDict: null,
    selectedMonth: 0,
    rooms: [],
    roomTypes: null,
    user: null,
    isLoading: true,
    googleSheetId: null,
    alert: null,
}, {
    id: 'Stolas-Availability-v5',
    useKeys: ['googleSheetId'],
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
        roomTypes[roomType] = roomTypes[roomType].sort((a, b) =>
            a.roomName < b.roomName ? -1 : a.roomName > b.roomName ? 1 : 0);
    });

    store.setState({ roomDict, roomTypes });
});

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
                googleSheetId: null,
                rooms: [],
                selectedMonth: 0,
                selectedRoom: null,
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

// store.stateSub(true, s => console.log('alert', s.alert));

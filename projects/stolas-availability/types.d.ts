type Reservation = {
    roomName: string | number;
    roomType: string;
    fromDate: number;
    toDate: number;
    /**
     * 0: closed
     * 1: // yellow
     * 2: // orange
     * 3: paid
     */
    status: '0' | '1' | '2' | '3';
    guestName?: string;
    guestNickName?: string;
}

type Room = {
    roomType: string;
    roomName: string;
    reservations: Reservation[];
}

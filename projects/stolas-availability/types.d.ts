type Reservation = {
    roomName: string | number;
    roomType: string;
    /** check in date */
    fromDate: number;
    /** check out date */
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
    /** total amount of days in reservation */
    days: number;
}

type Room = {
    roomType: string;
    roomName: string;
    reservations: Reservation[];
}

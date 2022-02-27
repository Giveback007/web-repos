type Reservation = {
    fromDate: Date;
    toDate: Date;
    status: '0' | '1' | '2' | '3';
    guestName?: string;
    guestNickName?: string;
}

type Room = {
    roomType: string;
    roomName: string;
    reservations: Reservation[];
}
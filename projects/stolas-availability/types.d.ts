type Reservation = {
    roomName: string | number;
    roomType: string;
    /** check in date */
    fromDate: number;
    /** check out date */
    toDate: number;
    /**
     * 0: [red]     closed
     * 
     * 1: [yellow]  tentative ("verbally committed but hasn't actually committed")
     * 
     * 2: [orange]  pending ("already committed but hasn't paid")
     * 
     * 3: [green]   paid
     */
    status: '0' | '1' | '2' | '3';
    guestName?: string;
    guestNickName?: string;
    /** total amount of days in reservation */
    days: number;
    /** XL row number key */
    row: string;
    /** XL col character key */
    col: string;
}

type Room = {
    roomType: string;
    roomName: string;
    reservations: Reservation[];
}

type User = {
    email: string;
    name: string;
    imgUrl: string;
}

// type GDriveFile = {
//     kind: string;
//     id: string;
//     name: string;
//     mimeType: string;
// }

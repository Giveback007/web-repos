import { days, hours, min, minAppend, msToHrs, msToMin, msToSec } from '@giveback007/util-lib';
import { read, utils } from 'xlsx';

/** Returns a tuple with `[Room[], RoomTypeDict]` */
export function readXL(file: File): Promise<Room[]> {
    const getTime = (str: string) => {
        const [y, d, m] = str.split('-').map(s => Number(s));
        // TODO: check here if invalid date
        return new Date(y, m - 1, d, 12, 30).getTime();
    }

    const reader = new FileReader();

    return new Promise(res => {
        reader.onload = (e) => {
            const result = e.target?.result;
            if (!result) return
            const { SheetNames, Sheets } = read(result, { type: 'binary' });
            const data = SheetNames.map(name => {
                const x: string[][] = utils.sheet_to_json(Sheets[name], { header: 1 });
                x.shift();

                return x;
            });

            
            const roomArr = data.map(sheet => sheet.filter(a => a.length).map((roomArr) => {
                const [roomType, roomName, ...reservationsStrings] = roomArr;

                const room = {
                    roomType,
                    roomName,
                    reservations: reservationsStrings.map(s => s && s.trim()).filter(s => s).map((str) => {
                        const [fromStr, toStr, status, guestName, guestNickName] = str.split('|').map(s => s.trim());
                        const fromDate = getTime(fromStr);
                        const toDate = getTime(toStr);

                        return {
                            fromDate, toDate, status, guestName,
                            guestNickName, roomName, roomType,
                            days: Math.round((toDate - fromDate) / days(1)),
                        };
                    }).sort((a, b) => a.fromDate - b.fromDate)
                } as Room;

                return room;
            }));

            res(roomArr.flat());
        }
        
        reader.readAsBinaryString(file);
    });
}

export const capFirst = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1);

const month = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
export const genDateStr = (dt: Date) => {
    const f = (n: number) => minAppend(n, 2, '0')

    const y = dt.getFullYear();
    const m = dt.getMonth();
    const d = dt.getDate();
    
    const cy = new Date().getFullYear();
    return `${capFirst(month[m])} ${f(d)}${(y !== cy) ? `, ${y}` : ''}`;
}

export const genSimplifiedTime = (date: number, showTime = true) => {
    const dt = new Date(date);
    const dif = Date.now() - date;

    const getDate = (dt: Date) => {
        const dateStr = genDateStr(dt);

        if (!dateStr) throw new Error('Invalid Date');
        if (!showTime) return dateStr;

        let h = dt.getHours();
        const meridiem: 'AM' | 'PM' = h < 12 ? 'AM' : 'PM';
        h = h < 13 ? h : h - 12;

        return dateStr + ` ${h}:${minAppend(dt.getMinutes(), 2, '0')} ${meridiem}`;
    }

    if (dif < 0) return getDate(dt);

    else if (dif < min(1)) {
        const s = Math.ceil(msToSec(dif));
        return `${s} Sec${s > 1 ? 's' : ''} Ago`;
    } else if (dif < hours(1)) {
        const m = Math.round(msToMin(dif));
        return `${m} Min${m > 1 ? 's' : ''} Ago`;
    } else if (dif < hours(24)) {
        const h = Math.round(msToHrs(dif));
        return `${h} Hour${h > 1 ? 's' : ''} Ago`;
    } else return getDate(dt);
}

export const strFromRes = (re: Reservation, showTime?: boolean) =>
    (re.status === "0" ? 'Closed' : `${re.guestName ?? ''}${re.guestNickName ? ` (${re.guestNickName})` : ''}`)
    +
    (showTime ? ` | From: ${new Date(re.fromDate).toLocaleDateString()} | To: ${new Date(re.toDate).toLocaleDateString()}` : '');

export function fillTimeGaps(arr: { start: number; end: number }[]) {
    const fillers: typeof arr = [];
    arr.forEach((x, i) => {
        const next = arr[i + 1];
        if (!next || x.end >= next.start) return;

        fillers.push({ start: x.end, end: next.start });
    });

    return fillers;
}

export function stringToColor(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++)
      hash = str.charCodeAt(i) + ((hash << 5) - hash);

    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      color += ('00' + value.toString(16)).substr(-2);
    }

    return color;
}

export function getRoomTypeColor(roomType: string) {
    roomType = roomType.toLocaleLowerCase();
    const typesToColor = {
        premium: '#324ea8',
        deluxe: '#32a8a4',
        quality: '#32a836',
        standard: '#a8a632',
    }

    return typesToColor[roomType] ? typesToColor[roomType] : stringToColor(roomType);

}
import { clone, days, hours, min, minAppend, msToHrs, msToMin, msToSec, sec } from '@giveback007/util-lib';
import { read, utils } from 'xlsx';
import { GFile, GoogleApis } from './google-api';
import { store } from './store';

/** Returns a tuple with `[Room[], RoomTypeDict]` */
export function readXL(file: File): Promise<Room[]> {
    const getTime = (str: string) => {
        const [y, d, m] = str.split('-').map(s => Number(s));
        // TODO: check here if invalid date
        return new Date(y, m - 1, d, 12, 30).getTime();
    }

    const reader = new FileReader();

    return new Promise((res, rej) => {
        reader.onload = (e) => {
            const result = e.target?.result;
            if (!result) return

            const { SheetNames, Sheets } = read(result, { type: 'binary' });

            const data = SheetNames.map(name => {
                
                const x: string[][] = utils.sheet_to_json(Sheets[name], { header: 1, blankrows: true, defval: '' });
                if (
                    x[0][0].toLocaleLowerCase().trim() !== "room type"
                    ||
                    x[0][1].toLocaleLowerCase().trim() !== "room"
                ) {
                    rej();
                    throw new Error('Sheet Is Incorrect Format');
                }
                
                const y = x.map((row, rI) => row.map((col, cI) => {
                    if (cI < 2 || !col) return String(col);

                    const r = rI + 1;
                    const c = cI;

                    return `${numXLCol(c)} | ${r} | ${col}`;
                }).filter(x => x)).filter(arr => arr.length);
                
                y.shift();
                return y;
            });

            
            const roomArr = data.map(sheet => sheet.filter(a => a.length).map((roomArr) => {
                const [roomType, roomName, ...reservationsStrings] = roomArr;

                const room = {
                    roomType,
                    roomName,
                    reservations: reservationsStrings.map(s => s && s.trim()).filter(s => s).map((str) => {
                        const [col, row, fromStr, toStr, status, guestName, guestNickName] = str.split('|').map(s => s.trim());
                        const fromDate = getTime(fromStr);
                        const toDate = getTime(toStr);

                        return {
                            fromDate, toDate, status, guestName,
                            guestNickName, roomName, roomType, row, col,
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
    };

    return typesToColor[roomType] ? typesToColor[roomType] : stringToColor(roomType);

}

/** Take the column index (start from 0) and turn into XL format column-key  */
export function numXLCol(num: number) {
    let s = '', t: number, n = num + 1;
  
    while (n > 0) {
      t = (n - 1) % 26;
      s = String.fromCharCode(65 + t) + s;
      n = (n - t) / 26 | 0;
    }

    return s;
}

export async function getRoomsFromGSheets(id: string) {
    let rooms: Room[] = [];

    try {
        const file = await new GoogleApis().downloadXL(id);
        rooms = await readXL(file);
    } catch {
        store.setState({alert: {
            type: 'danger',
            title: 'XL In Incorrect Format',
            text: "Couldn't Parse The Sheet",
            timeoutMs: 7500,
            onClose: () => store.setState({ alert: null }),
            style: { position: 'fixed', top: 75, right: 5, zIndex: 1100 }
        }})
        return { isSuccess: false } as const
    }

    return { isSuccess: true, rooms } as const;
}
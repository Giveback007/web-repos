import { hours, isType, min, minAppend, msToHrs, msToMin, msToSec } from '@giveback007/util-lib';
import { read, utils } from 'xlsx';

export function readXL(file: File): Promise<Room[]> {
    const toDateObj = (str: string) => {
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
                
                return {
                    roomType, roomName,
                    reservations: reservationsStrings.map(s => s && s.trim()).filter(s => s).map((str) => {
                        const [fromStr, toStr, status, guestName, guestNickName] = str.split('|').map(s => s.trim());
                        return {
                            fromDate: toDateObj(fromStr),
                            toDate: toDateObj(toStr),   
                            status, guestName, guestNickName,
                            roomName, roomType
                        };
                    })
                } as Room;
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

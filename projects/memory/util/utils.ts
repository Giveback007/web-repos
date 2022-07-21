import {
    arrGen, days, hours,
    min, msToDys, msToHrs,
    msToMin, msToSec, msToWks,
    uuid, weeks
} from "@giveback007/util-lib";
import { set, store } from "../store";


export class Memory {

    /** Multiplier for timing */
    score: number = set.baseScore;

    /** Timing/interval added to review after last review */
    timing: number = set.minTime;

    /** Next time this word will be reviewed */
    reviewOn: number = Date.now() - 1000;

    /** Adds to score on success */
    ease: number = set.baseEase;

    updatedOn: number;

    readonly timeCreated: number;
    readonly id: string = uuid();

    constructor(
        public question: string,
        public answer: string
    ) {
        const now = Date.now();

        this.timeCreated = now;
        this.updatedOn = now;
    }
};

// ------------------------ //
const strMin = (str: string | number, len: number, char = '0') =>
    (arrGen(len, char).join() + str).slice(-len);

const capFirst = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1)

const month = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
export const genDateStr = (ms: number, format: 'default' | 'fitbit' = 'default') => {
    const dt = new Date(ms);
    if (!dt) {
        console.error({ ms, dt })
        return null;
    }

    const f = (n: number) => strMin(n, 2, '0')

    const y = dt.getFullYear();
    const m = dt.getMonth();
    const d = dt.getDate();

    // '2021-10-16' format
    if (format === 'fitbit'){
        return `${y}-${f(m + 1)}-${f(d)}`;
    } 

    // 'October 16' format
    else {
        const cy = new Date().getFullYear()
        return `${capFirst(month[m])} ${f(d)}${(y != cy) ? `, ${y}` : ''}`;
    }
}

export const genSimplifiedTime = (ms: number, from: number = Date.now()) => {
    const dt = new Date(ms);
    if (!dt) return null;
    const now = new Date(from);
    const dif = Math.floor(dt.getTime() - now.getTime());

    const getDate = (dt: Date) =>
        dt.toLocaleDateString();
    
    if (dif < 0) return getDate(dt);

    else if (dif < min(1)) {
        const s = Math.ceil(msToSec(dif));
        return `${s}s`;
    } else if (dif < hours(1)) {
        const m = Math.round(msToMin(dif));
        return `${m}m`//${m > 1 ? 's' : ''}`;
    } else if (dif < days(1)) {
        const h = Math.round(msToHrs(dif));
        return `${h}h`//${h > 1 ? 's' : ''}`;
    } else if (dif < weeks(1)) {
        const d = Math.round(msToDys(dif));
        return `${d} day${d > 1 ? 's' : ''}`;
    } else if (dif < weeks(4)) {
        const w = Math.round(msToWks(dif));
        return `${w} week${w > 1 ? 's' : ''}`;
    } else if (dif < weeks(52)) {
        const d = msToDys(dif);
        const m = (d / (364.25 / 12)).toFixed(1);
        return `${m} month${Number(m) > 1 ? 's' : ''}`;
    } else {
        const d = msToDys(dif);
        const y = (d / 364.25).toFixed(1);
        return `${y} year${Number(y) > 1 ? 's' : ''}`;
    }
    
    // return getDate(dt);
}

export function calcMem(mem: Memory, success: boolean) {
    let ease = mem.ease || set.baseEase;
    let score = mem.score || set.baseScore;
    let timing = mem.timing || set.minTime;

    ease = success ? ease + set.easeAdd : ease - set.easeSub;
    if (ease < set.minEase) ease = set.minEase;
    
    score = success ? score + ease : score / set.scoreDivide;
    if (score < set.minScore) score = set.minScore;
    
    const oldTiming = timing;
    timing = success ? timing * score + 1500 : set.minTime;

    if (timing < set.minTime)
        timing = set.minTime;
    else if (timing > days(2))
        timing = oldTiming * Math.min(score, 2);
    else if (timing > hours(3))
        timing = oldTiming * Math.min(score, 3);

    const now = new Date();
    let onDate = new Date(Date.now() + timing);

    // if review is not today
    if (timing > hours(1) && now.toDateString() !== onDate.toDateString()) {
        // if date is on another date use 2am of that day
        const y = onDate.getFullYear();
        const m = onDate.getMonth();
        const d = onDate.getDate();
        onDate = new Date(y, m, d, 2)
    }
    
    return { ...mem, score, timing, reviewOn: onDate.getTime(), ease };
}

export function arrRmIdx<T>(arr: T[], idx: number) {
    const newArr = [...arr];
    newArr.splice(idx, 1);

    return newArr;
}

export const objToFormData = <T extends Object>(obj: T, fileName: string, folder?: string) => {
    const file = new Blob([JSON.stringify(obj)], { type: 'application/json' });
    const metadata = {
        name: fileName, // Filename at Google Drive
        mimeType: 'application/json', // mimeType at Google Drive
    };

    if (folder) (metadata as any).parents = [folder];

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
    form.append('file', file);

    return form;
}

export const isTxtInput = (x: any) => 
    x instanceof HTMLElement && (x.tagName === 'INPUT' || x.tagName === 'TEXTAREA');
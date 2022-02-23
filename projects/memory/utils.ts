import { arrGen, days, hours, min, msToDys, msToHrs, msToMin, msToSec, msToWks, uuid, weeks } from "@giveback007/util-lib";
import { set } from "./store";


export class Memory {

    /**
     * Multiplier for timing
     */
    score: number;

    /** Timing/interval added to review after last review */
    timing: number;

    /** Next time this word will be reviewed */
    reviewOn: number;

    readonly timeCreated: number;

    readonly id: string;

    constructor(
        public question: string,
        public answer: string
    ) {
        this.id = uuid();
        this.timeCreated = Date.now();
        this.score = set.minScore;
        this.timing = set.timeOnFail;
        this.reviewOn = this.timeCreated + set.timeOnFail;
    }
};

// /** Generate html from a string */
// export const makeHTML = (html) =>
//     new DOMParser().parseFromString(html, "text/html").body.childNodes;

// /** Replace the inner contents of parent node */
// export const replaceHTML = (parent, html) =>
//     parent.replaceChildren(...makeHTML(html));

// /** Append to parent node */
// export const addHTML = (parent, html) => 
//     parent.append(...makeHTML(html));


// export const elm = (id) => {
//     const el = document.getElementById(id);
//     if (!el) console.error('!el:', { id });
    
//     return el;
// }

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
        dt.toLocaleDateString('us-en');
    
    if (dif < 0) return getDate(dt);

    else if (dif < min(1)) {
        const s = Math.ceil(msToSec(dif));
        return `${s} seconds`;
    } else if (dif < hours(1)) {
        const m = Math.round(msToMin(dif));
        return `${m} minute${m > 1 ? 's' : ''}`;
    } else if (dif < days(1)) {
        const h = Math.round(msToHrs(dif));
        return `${h} hour${h > 1 ? 's' : ''}`;
    } else if (dif < weeks(1)) {
        const d = Math.round(msToDys(dif));
        return `${d} day${d > 1 ? 's' : ''}`;
    } else if (dif < weeks(52)) {
        const w = Math.round(msToWks(dif));
        return `${w} weeks${w > 1 ? 's' : ''}`
    }
    
    return getDate(dt);
}

export function calcMem(mem: Memory, success: boolean) {
    const isInReview = mem.timing < set.reviewModeTiming;

    const tryScore = mem.score + (success ? set.scoreAdd : set.scoreSub);
    const score = tryScore < set.minScore ? set.minScore : tryScore;
    
    const timing = Math.floor(isInReview ?
            (success ? mem.timing * set.reviewMultiplier : set.timeOnFail)
            :
            (success ? mem.timing * mem.score : set.timeOnFail)
    );
    const reviewOn = Math.floor(Date.now() + timing);
    
    return { ...mem, score, timing, reviewOn };
}

export function arrRmIdx<T>(arr: T[], idx: number) {
    const newArr = [...arr];
    newArr.splice(idx, 1);

    return newArr;
}

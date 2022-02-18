import React from "react";
import { minAppend, msToTime, objExtract } from "@giveback007/util-lib";
import { link } from "../store/store";

export const Timer = link(
    s => objExtract(s, ['timeNow', 'startTime', 'timePerItem', 'selectedItem', 'didFinish']),
    (p: {
        timePerItem: number;
        startTime: number;
        timeNow: number;
        selectedItem: number;
        didFinish: boolean;
    }) => {
        const isSel = p.selectedItem > -1;
        const tPass = p.timeNow - p.startTime;

        const tEnd = msToTime(p.timePerItem, true);
        const tNow = msToTime(tPass, true);
        
        const timeStr = 
            `${minAppend(tNow.m, 2)}:${minAppend(tNow.s, 2)}`
            +
            (isSel && !p.didFinish ? `/${minAppend(tEnd.m, 2)}:${minAppend(tEnd.s, 2)}` : '');
            
        return <h4 className='text-xl font-semibold m-auto'>{timeStr}</h4>;
    }
);
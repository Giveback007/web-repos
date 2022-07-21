import './init';
import 'my-alyce-component-lib/dist/index.css';
import React from 'react';
import ReactDOM from "react-dom";
import { debounceTimeOut, min, sec } from '@giveback007/util-lib';
import { store, timeFromMem } from './store';
import { App } from './components/app';
import 'gamecontroller.js';

declare global {
    const isDev: boolean;
    // https://github.com/alvaromontoro/gamecontroller.js
    const gameControl: any;
}

(globalThis as any).isDev = isDev;

/* TODO:
    1. Add [EDIT] Btn
*/

// -- BOOTSTRAP -- //
;(async function bootstrap() {
    store.stateSub('memorize', timer, true);

    let tm: NodeJS.Timeout;
    function timer() {
        const times = timeFromMem(store.getState().memorize);
        store.setState(times);
        
        clearTimeout(tm);
        const use1Sec = times.nReadyIn5min;
        tm = setTimeout(timer, use1Sec ? sec(1) : min(1));
    };



    /** React App Render */
    ReactDOM.render(<App />, document.getElementById("root"));
})();

gameControl.on('connect', (gp: any) => {
    const genEv = (key: string) => dispatchEvent(new KeyboardEvent("keydown", { key }))
    
    const keyMap = new Map(Object.entries({
        'l1': 'ArrowLeft',
        'button14': 'ArrowLeft',
        'button2': 'ArrowLeft',
        'r1': 'ArrowRight',
        'button15': 'ArrowRight',
        'button1': 'ArrowRight',
        'button13': 'ArrowDown',
        'button0': 'ArrowDown',
        // 'button3': 'Enter',
        'start': 'Enter',
    }));

    for (const [gpBtn, kbBtn] of keyMap) {
        let didPress = false;
        const debounce = debounceTimeOut();
        gp.on(gpBtn, () => {
            debounce(() => didPress = false, 50);

            if (!didPress) {
                didPress = true;
                genEv(kbBtn);
            }
        }, 50);
    }
})


if (isDev && 0) gameControl.on('connect', (gp: any) => [
    "button0", "button1", "button2", "button3", "button4",
    "button5", "button6", "button7", "button8", "button9",
    "button10", "button11", "button12", "button13", "button14",
    "button15", "button16",

    "up", "down", "right",  "left",
    "up0", "down0", "right0", "left0",
    "up1", "down1", "right1", "left1",

    "l1", "l2", "r1", "r2",

    "start", "select", "power",
].forEach(key => {
    const debounce = debounceTimeOut();
    gp.on(key, () => debounce(() => log(key), 50))
}));

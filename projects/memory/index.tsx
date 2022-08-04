import './init';
import 'my-alyce-component-lib/dist/index.css';
import React from 'react';
import ReactDOM from "react-dom";
import { debounceTimeOut, sec, wait } from '@giveback007/util-lib';
import { store, timeFromMem } from './store';
import { App } from './components/app';
import 'gamecontroller.js';

declare global {
    const isDev: boolean;
    // https://github.com/alvaromontoro/gamecontroller.js
    const gameControl: any;
}

(globalThis as any).isDev = isDev;

// -- BOOTSTRAP -- //
;(async function bootstrap() {
    store.stateSub('memorize', timer, true);

    let tm: NodeJS.Timeout;
    function timer() {
        const times = timeFromMem(store.getState().memorize);
        store.setState(times);
        
        clearTimeout(tm);
        const use1Sec = times.nReadyIn5min;
        tm = setTimeout(timer, use1Sec ? sec(1) : sec(30)) as any;
    };

    /** React App Render */
    ReactDOM.render(<App />, document.getElementById("root"));

    (global as any).getWords = (hrs: number = Infinity) => {
        const timing = hrs * 60 * 60000;
        
        return store.getState().memorize.filter(x => {
            const words = x.question.split(' ');
            if (
                words.length !== 1
                ||
                !/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]+$/.test(words[0])
            ) return false;

            return x.timing <= timing
        }).map(({ question }) => question.toLocaleLowerCase());
    }
})();

let keys: [string, () => boolean][];

window.addEventListener("gamepadconnected", (e) => {
    const tinyGamepad = e.gamepad.id === "Bluetooth Wireless Controller    (Vendor: 2dc8 Product: 3230)";
    keys = (tinyGamepad ? [
        ['down0', 'ArrowDown'],
        ['button1', 'ArrowDown'],
        ['left0', 'ArrowLeft'],
        ['right0', 'ArrowRight'],
        ['button3', 'KeyX'],
    ] : [
        [ 'button0', 'ArrowDown' ],
        [ 'button13', 'ArrowDown' ],
        [ 'button14', 'ArrowLeft' ],
        [ 'button15', 'ArrowRight' ],
        [ 'button3', 'KeyX' ],
    ]).map(([btn, key]) =>
        [btn, () => dispatchEvent(new KeyboardEvent("keydown", { key }))]);
});

gameControl.on('connect', async (gp: any) => {
    await wait(0);
    const keyMap = new Map([...gameCtrlBtns, ...keys]);

    for (const [gpBtn, fct] of keyMap) {
        let didPress = false;
        const debounce = debounceTimeOut();
        gp.on(gpBtn, () => {
            debounce(() => didPress = false, 50);

            if (!didPress) {
                didPress = true;
                fct();
            }
        }, 50);
    }
});

const gameCtrlBtns = [
    "button0", "button1", "button2", "button3", "button4",
    "button5", "button6", "button7", "button8", "button9",
    "button10", "button11", "button12", "button13", "button14",
    "button15", "button16",

    "up", "down", "right", "left",
    "up0", "down0", "right0", "left0",
    "up1", "down1", "right1", "left1",

    "l1", "l2", "r1", "r2",

    "start", "select", "power",
].map(btn => [btn, () => log(btn)] as const);

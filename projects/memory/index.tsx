import './init';
import 'my-alyce-component-lib/dist/index.css';
import React from 'react';
import ReactDOM from "react-dom";
import { min, sec } from '@giveback007/util-lib';
import { auth, store, timeFromMem } from './store';
import { App } from './components/app';

declare global {
    const isDev: boolean;
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

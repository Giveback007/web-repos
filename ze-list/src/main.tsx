import './init';

import 'my-alyce-component-lib/dist/index.css';
import './index.css';
import './styles/main.css';

import React from 'react';
import ReactDOM from "react-dom";
import { objVals } from '@giveback007/util-lib';
import { App } from './components/app';

;(async function bootstrap() {
    /** Init effects */
    const effects = await import('./store/effects');
    objVals(effects).forEach(eff => eff());

    /** React App Render */
    const app = document.getElementById("app");
    ReactDOM.render(<App />, app);
})();

import './index.scss';

import 'my-alyce-component-lib/dist/index.css';
import React from 'react';
import ReactDOM from "react-dom";
import { App } from './App';
import { store } from './store';

// TODO
  // warn when there's an overlap
  // warn when an invalid date


// -- BOOTSTRAP -- //
;(async function bootstrap() {

  /** React App Render */
  ReactDOM.render(<App />, document.getElementById("root"));
})();
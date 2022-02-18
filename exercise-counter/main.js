const { log, error } = console;

// import { subscribe } from './store.js';
import { elm } from './libs/utils.js';
import { render } from 'lit-html';
import { app } from './render.js';
import { subscribe } from './store.js';
import * as effects from './effects.js'

// 1st make html/template
// 2nd identify state
  // 1) add ${var} to each one
  // 2) idtfy "state-data-type" each ${var}
  // 3) cvrt each "st-data-type" to rndrbl
// 3rd implement state
  // 1) add each ${var} to initial state
  // 2) implement every click
  // 3) work out side effects

;(async function bootstrap() {
    /** Init effects */
    Object.values(effects).forEach(eff => eff());

    subscribe((s) => {
      render(app(s), elm('root'));
    }, true);
})();

import { setState } from './store.js';
import { html } from 'lit-html';
import { ifVal } from './libs/utils.js';
import { exercisesView } from './components/exercise-view.js';
import { addExerciseView } from './components/add-exrs-view.js';
const { log } = console;

export function app(s) {
  const { selectedTab: selTab } = s;
  
  return html`
    <div class="top-bar">
      <button
        class="${ifVal(selTab === 'exercises' && 'active')}"
        @click=${() => setState({ selectedTab: 'exercises' })}
      >Exercises</button>
      <button
        class="${ifVal(selTab === 'add-exercises' && 'active')}"
        @click=${() => setState({ selectedTab: 'add-exercises' })}
      >Add Exercise</button>
    </div>

    <div style="border: solid 3px gray; border-left: none; border-right: none; padding: 0;"></div>

    ${ifVal(selTab === 'exercises' && exercisesView(s))}
    ${ifVal(selTab === 'add-exercises' && addExerciseView(s))}`
}



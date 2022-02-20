import { setNumToExercise, getExr, setState } from '../store.js';
import { html } from 'lit-html';
import { capFirst, elm, ifVal } from '../libs/utils.js';

export function exercisesView(s) {
    const {
      exercises, selectedExercise, //exerciseStart,
    } = s;

    if (!exercises.length) return '';
  
    const [exrs] = getExr(selectedExercise);
    const countType = exrs?.countType;
    const countTotal = exrs?.data?.count;
    
    const showWeek = exrs ? Array(7).fill(0).map((_, i) => {
      const dt = getDt(-i);
      const num = exrs.data[dt] || 0;
      const str = i ? dt : 'Today';
  
      return html`<div style="display: flex; font-size: x-large; border-bottom: solid 1px lightgray; padding: 0.2rem;">
        <div style="min-width: 14.5rem; text-align: end;">${str}: </div>
        <div style="margin-left: 1rem">${num}</div>
      </div>`;
    }) : null;
  
    return html`<div class="exercises-view">
        <div class="bar">
          ${exercises.map(ex => exerciseBtn(ex, selectedExercise))}
        </div>
  
        ${ifVal(selectedExercise && exerciseBody({ countTotal, countType }))}
        <div style="border: solid 3px gray; border-left: none; border-right: none; padding: 0.2rem;"></div>
        <div id="submit-day">
          <input type="date" id="submit-day-input" />
          <button
            @click=${() => {
              const { value } = elm('submit-day-input');
              if (!value) return alert('No Date Set!');
              const [y, m, d] = value.split('-');
              const dt = new Date(y, Number(m) - 1, d).toDateString('en-US');
  
              setNumToExercise(countTotal, dt);
            }}
          >Submit</button>
        </div>
  
        ${showWeek}
    </div>`
}


const exerciseBtn = ({ name }, selEx) => html`<button
  class="${ifVal(selEx === name && 'active')}"
  @click=${() => setState({ selectedExercise: name })}
>${name}</button>`;

const exerciseBody = (props) => {
  const { countTotal = 0, countType = 'count' } = props;
  return html`<div id="exercise-input" class="justify-flex">
      <input
          id="exercise-add"
          type="number"
          min="0"
      />
      <button @click=${() => {
          const el = elm('exercise-add');
          const add = Number(el.value);
          el.value = '';
          el.focus();
          setNumToExercise(countTotal + add);
      }}>Add</button>
      <div style="border: solid 3px gray; border-bottom: none; border-top: none; padding: 0.2rem; margin: 0 0.3rem;"></div>
      <button @click=${() => {
        setNumToExercise(0);
        elm('exercise-add').focus();
      }}>Reset</button>
  </div>

  <h1 id="todays-total">${capFirst(countType)}: ${countTotal}</h1>`;
}

const getDt = (addDay = 0) => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate() + addDay).toDateString('en-US');
}
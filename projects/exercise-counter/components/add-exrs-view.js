import { html } from "lit-html";
import { addExercise, removeExercise } from "../store";

export function addExerciseView(s) {
    return html`<div>
        <h4 style="text-align: center">Add Exercise:</h4>

        <form id="add-exercise-form" @submit=${(e) => {
            e.preventDefault();
            const inputs = Array.from(e.target.getElementsByTagName('input'));
            
            let countType;
            let name;
            inputs.forEach(el => {
                if (el.name === "count-type" && el.checked) {
                    countType = el.value;
                } else if (el.name === 'title') {
                    name = el.value;
                }
            });

            if (!countType || !name) return alert('Fill out the form');

            addExercise({ countType, name });
        }}>

            <div class="justify-flex" name="add-exercise">
                <span style="margin-right: 0.2rem;">Type:</span>
                <label style="margin-right: 0.5rem">
                    <input type="radio" value="count" name="count-type">
                    Reps
                </label>

                <label style="margin-right: 0.5rem">
                    <input type="radio" value="time" name="count-type">
                    Minutes
                </label>
            </div>

            <div id="add-exercise-input" class="justify-flex">
                <input id="add-new-exercise" name="title"/>
                <button type="submit">Add</button>
            </div>
        </form>

        <h4 style="text-align: center">List:</h4>
        ${s.exercises.map(({ name }) => html`<div>
            <button
                @click=${() => {
                    const yes = confirm(`REMOVE: ${name}?`);
                    if (yes) removeExercise(name);
                }}
                style="width: 3rem; height: 3rem; margin-bottom: 1rem"
            >X</button>
            <span>${name}</span>
        </div>`)}
    </div>`
}
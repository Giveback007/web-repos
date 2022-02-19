import { html } from "lit-html";

export function addExerciseView(s) {
    return html`<form>
        <input />
        
        <p>Count Type:</p>

        <label>
            <input type="radio" value="count" name="count-type">
            Reps
        </label>

        <label>
            <input type="radio" value="time" name="count-type">
            Minutes
        </label>
    </form>`
}
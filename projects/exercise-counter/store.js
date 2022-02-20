import { stateManager } from './libs/state-manager.js';
import { arrRmIdx, clone } from './libs/utils.js';
const { log } = console;

export function removeExercise(name) {
  const { exercises } = getState();
  log({exercises})
  const idx = exercises.findIndex(el => el.name === name);
  setState({ exercises: arrRmIdx(exercises, idx) });
}

export function addExercise({ countType, name }) {
  const { exercises: arr } = getState();
  const exercises = [...arr, { name, countType, data: { count: 0 }}];

  setState({ exercises });
}

export function setNumToExercise(num, date = null) {
  const { selectedExercise, ...s } = getState();
  const exercises = [...s.exercises];

  const [exr, idx] = clone(getExr(selectedExercise));
  exr.data[date ?? 'count'] = num || 0;
  exercises[idx] = exr;

  setState({ exercises });
}

export function getExr(name) {
  const { exercises } = getState();
  const idx = exercises.findIndex((x) => x.name === name);
  return [exercises[idx], idx];
}

export const [
  setState, getState, subscribe, addMiddleware
] = stateManager({
  exercises: [{
    name: 'Push Ups',
    countType: 'reps', // 'minutes' | 'reps'
    data: { count: 0 }
  }],
  selectedExercise: null,
  selectedTab: 'exercises', //'exercises' | 'add-exercises',
}, {
  id: 'push-up-counter-v10',
  keys: ['selectedExercise', 'exercises', 'selectedTab']
});

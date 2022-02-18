import { clone, wait } from './utils.js';
const { log } = console;

export function stateManager(
  initState,
  ls // { id, keys: [] }
) {
  /* LOCAL STORAGE */
  const setLS = () => {
    const { id, keys } = ls;
    
    const o = {};
    keys.map(k => o[k] = state[k]);
    
    localStorage.setItem(id, JSON.stringify(o))
  }
  
  /* STATE */
  let state = {
    ...initState,
    ...(ls && JSON.parse(localStorage.getItem(ls.id))) || {},
  };
  let prev = { ...state };

  const sKeys = {}; // state keys
  Object.keys(state).map(k => sKeys[k] = true);


  /* SUBS & MIDL */
  const subs = {/* [id]: fct: (s)=> */};
  const midl = {/* [id]: fct: (s)=> */};

  let midKeys = [];
  let subKeys = [];

  
  /* COUNT */
  let setStateCounter = 0;
  let setStateTimer = Date.now();

  // log({initState})
  // log({state});
  return [
    // setState
    async (obj) => {
      await wait(0);
      setStateCounter++;
      
      prev = state;
      state = { ...state };
      
      /* Validate Keys */
      Object.keys(obj).map(k => {
        // validate if state has such key
        if (!sKeys[k]) {
          console.error(`!sKey: ${k}`);
          throw new Error;
        }
        
        state[k] = obj[k];
      });
    
      if (ls) setLS();
      midKeys.map((k) => state = midl[k](state, prev));
      subKeys.map((k) => subs[k](state, prev));

      if (setStateTimer + 1000 < Date.now()) {
        if (setStateCounter > 10)
          console.error(`state was set ${setStateCounter} times in a sec`);

        setStateCounter = 0;
        setStateTimer = Date.now();
      }

      // console.log(state.exercises);
      return state;
    },
    // getState
    () => state,
    // subscribe
    (fct, execOnSub = false) => { 
      const id = Date.now() + Math.random();
      subs[id] = fct;
      
      subKeys = Object.keys(subs);

      if (execOnSub) fct(state, prev);
      return {unsub: () => {
          delete subs[id];
          subKeys = Object.keys(subs);
      }};
    },
    // addMiddleware
    (fct) => {
      const id = Date.now() + Math.random();
      midl[id] = fct;
      
      midKeys = Object.keys(midl);

      return {cancel: () => {
          delete midl[id];
          midKeys = Object.keys(midl);
      }};
    }
  ]
};

/* EXAMPLE
export const [
  setState, getState, subscribe, addMiddleware
] = stateManager({
  // initial state
});
*/



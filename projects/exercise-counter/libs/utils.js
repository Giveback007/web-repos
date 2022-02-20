const { log, error } = console;

export const arrRmIdx = (arr, idx) => {
  const newArr = [...arr];
  newArr.splice(idx, 1)

  return newArr;
}

export const elm = (id) => {
  const el = document.getElementById(id);
  if (!el) error('!el:', { id });
  
  return el;
}


export const elmClick = (id, fct) =>
  el(id).addEventListener('click', fct);
  

export function msToTime(msT) {
  const ln = (n, l) => {
    let str = n + '';
    while (str.length < l) str = '0'+str;
    
    return str;
  }
  
  const ms = (msT % 1000);
  let s = Math.floor(msT / 1000);
  let m = Math.floor(s / 60);
  s = (s % 60);

  let h = Math.floor(m / 60);
  m = m % 60;

  // const dN = Math.floor(hN / 24);
  // hN = hN % 24;

  return {
    // d: dN,
    h: ln(h, 2),
    m: ln(m, 2),
    s: ln(s, 2),
    ms: ln(ms, 3)
  };
}

/** if `check` is not `null' || 'undefined' -> return val | else -> return "" (or def) */
export const ifVal = (check, def = '') =>
  check === null || check === undefined || check === false ? def : check;

/** A promise that waits `ms` amount of milliseconds to execute */
export const wait = (ms) =>
    new Promise((res) => setTimeout(() => res(), ms));

export const clone = (obj) => JSON.parse(JSON.stringify(obj));

export const capFirst = ([ first, ...rest ], locale = navigator.language) =>
  first.toLocaleUpperCase(locale) + rest.join('')
import { Dict, uuid } from '@giveback007/util-lib';
import { str } from 'src/test';

export const elm = (id: string) => {
  const el = document.getElementById(id);
  if (!el) throw new Error(`id: "${id} not found"`);

  return el;
}
  
export const addSec = (n = 1) =>
  Array(n).fill('\n.\n\n.\n\n.\n').join('');
  
export const strBtw = (str: string, s1: string, s2?: string) => {
  const x = str.split(s1).pop();
  if (!x) throw new Error(`s1: "${s1}" not on "str"`);

  return x.split(s2 as any)[0];
}

export function copy(text: string) {
    const input = document.createElement('textarea');
    input.innerHTML = text;
    document.body.appendChild(input);
    input.select();
    var result = document.execCommand('copy');
    document.body.removeChild(input);
    
    return result;
}

export function msToTime(msT: number) {
    // N - number;
    const msN = (msT % 1000);
    let sN = Math.floor(msT / 1000);
    let mN = Math.floor(sN / 60);
    sN = sN % 60;

    let hN = Math.floor(mN / 60);
    mN = mN % 60;

    const dN = Math.floor(hN / 24);
    hN = hN % 24;

    return { d: dN, h: hN, m: mN, s: sN, ms: msN };
}

export const minAppend = (
    item: string | number, length: number, append = '0'
) => (append.repeat(length - 1) + item).slice(-(length));

const forwardKeys = {
	E: '7',
	T: '𝘓',
	A: 'Ր', // changed
	O: 'Ḷ',
	I: 'Λ',
	N: 'Γ', // changed
	S: 'Ɔ', // changed
	// R: 'Ƨ', // changed
	// H: 'Ϫ', // changed
	L: 'Ѧ',
	F: 'Π',
	G: 'Ͷ',
	Y: 'Δ',
}

export function scramble(str = '') {
	let newStr = str.toUpperCase();
	Object.entries(forwardKeys).map(([from, to]) => {
		newStr = newStr.replaceAll(from, to);
	});

	return newStr;
}

export type Detail = { text: string; id: string; };

export type TextItems = {
  title: string;
  keys: string[];
  symbol: string;
  time: string;
  details: Detail[];
  full: string;
  id: string;
}[];

export const textToObjs = (text: string) => {
  const keys = text.match(/\[\[\[.+?\]\]\]/g) as string[];
  const obj: Dict<string> = {};
  keys.map((k) => obj[strBtw(k, '[[[', ']]]')] = strBtw(text, k, '[[[').trim());
  
  return obj.List.split('~')
    .filter(x => x)
    .map((y) => {
        const [title, symbol] = strBtw(y, '[', ']')
          .split('-')
          .map(x => x.trim());
        
        const time = strBtw(y,
          '{{{Time}}}',
          '{{{Keys}}}'
        ).replaceAll('\n', '');

        const keys = strBtw(y,
          '{{{Keys}}}',
          '{{{Details}}}'
        ).replaceAll('\n', '')
        .split(',')
        .map(x => x.trim());
        keys //?
        
        const details = strBtw(y, '{{{Details}}}')
          .trim()
          .split('\n')
          .map(text => ({ id: uuid(), text }));
        
        const full = y
          .replaceAll('\n', '\n\n')
          .replace(/[-]+/gi, addSec(1));
        
        return {
          title, symbol, time, details, full, id: uuid(), keys,
        };
  });
}

export function playAudio(audioSrc: string, volume = 1) {
  const audio = new Audio(audioSrc);
  audio.volume = volume;
  audio.play();

  return new Promise((res) => audio.onended = res);
}

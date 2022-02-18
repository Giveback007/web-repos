import './init';

import 'my-alyce-component-lib/dist/index.css';
import './index.css';
import './styles/main.css';

import React from 'react';
import ReactDOM from "react-dom";
import { objVals } from '@giveback007/util-lib';
import { App } from './components/app';

// QUICK APP DOCUMENTATION //
// - have in the readme the checklist of all the things you need to make the thing work
// - have each thing in an isolated repo/example to see how it works and making it easier to implement in a different stack
  // - eg auth with google, or making own auth, and login

// ----------- // QUICK FRONT END // ----------- //
// react router
// component styling to create styles for brand
// LOGIN: w/ & w/o server 
// storybook
// https://capacitorjs.com/ for building fast native apps
// add documentation for creating a PWA & how to test that it works properly
  // + check if it has a particular issue

// ----------- // QUICK BACK END // ----------- //
// nest.js
// quick database
// quick auth
// quick way to figure out all the models
// quick apis (like your current generic implementation that takes a model and auto create rest/crud api)
// n8n.io (low code automation)

// ----------- // IDEAS FOR OTHER APPS // ----------- //
// Language learning
// Tooth brushing guide

// ----------- // MORNING STRATEGY // ----------- //
// "How to effectively start your morning"
// [DETECT AWAKE]: {fitbit} {phone-activity}
// TODO
// have a strategy for starting your day faster
// [example]: detect activity on the phone for more than 5 minutes and render a popup like "are you awake or going back to sleep? [awake] [snooze 2 mins]"
// if "awake" 
// TODO
/** Have 30mins FM when wake up, where all you do before is just put shirt and pants on before */
// for this time have a routine/checklist of what you need to sych yourself into starting your day and getting on with the morning routine
// during this time can do:
  // + caff/carb/rit
  // + tACS
  // + music
  // + go over a list of what you will be doing 


// ----------- // IDEAS FOR THIS APP // ----------- //
// - MAIN GOAL: to have my focus be enhanced by this app to get the effects
// - Something that really helps to keep focus
// - can add/subtract items
// - can export list
// - have an appreciation/acknowledgement of what has already come true
// - have login & sync
// - have some ways to add specific goals/things you want to see concrete goals
// TODO:
    // - publish app
    // - speaker read key
    // - scroll to highlighted item (within box if overflow)
    // - turn off speaking as soon as tab goes off focus
    

;(async function bootstrap() {
    /** Init effects */
    const effects = await import('./store/effects');
    objVals(effects).forEach(eff => eff());

    /** React App Render */
    const app = document.getElementById("app");
    ReactDOM.render(<App />, app);
})();

//    |   |
// -----------
//    |   |
// -----------
//    |   |


// - Start by filling in each one
// - Symbol/Matching-Letter
// - Then can fill each one with letters to match when meditating 


type FocusItem = {
  name: string,
  emoji: string,
  keys: string,
  list: string[],
}
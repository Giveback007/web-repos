(function init() {
    (window as any)['log'] = console.log;
})();

import 'spectre.css';
import './index.sass';

import * as React from 'react';
import ReactDOM from 'react-dom';
import HeartRate from './heart-rate';

ReactDOM.render(
    <HeartRate />,
    document.getElementById('root')
);

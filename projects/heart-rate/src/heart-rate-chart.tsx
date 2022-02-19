import { interval } from '@giveback007/util-lib';
import React from 'react';
import { SmoothieChart, TimeSeries } from "smoothie";
import type { HR } from './store';

function DebounceTimeOut() {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    return (fct: Function, ms: number) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(fct, ms) as any;
    }
}

type S = {};
type P = {
    hrNow: HR | null;
    min1Avg?: HR;
    min5Avg?: HR;
    min15Avg?: HR;
    timeNow: number;
    showGraph: boolean;
};

export class HrChart extends React.Component<P, S> {
    componentWillUnmount() {
        this.intv?.stop();
    }

    canvasRef = React.createRef<HTMLCanvasElement>();
    canvasElm: HTMLCanvasElement = null as any;

    tNow = new TimeSeries();
    t1m = new TimeSeries();
    t5m = new TimeSeries();
    t15m = new TimeSeries();
    lastTimeNow: number = 0;

    intv: { stop: () => void } | null = null;
    debounce = DebounceTimeOut();

    // updateCanvasSize(cvs = this.canvasElm) {
    //     // this.debounce(() => {
    //         cvs.width = window.innerWidth;
    //         // cvs.height = 180
    //     // }, 500)
    // }

    createTimeline(canvasElm: HTMLCanvasElement) {
        // has "responsive"
        const chart = new SmoothieChart({
            interpolation: 'linear',
            minValueScale: 1.05,
            maxValueScale: 1.05,
            scaleSmoothing: 0.7,
            minValue: 55,
            maxValue: 195,
            millisPerPixel: 40,
            responsive: true,
            grid: {
                // strokeStyle: 'rgb(125, 0, 0)',
                fillStyle: 'rgb(255, 255, 255)',
                lineWidth: 1,
                millisPerLine: 5000,
                verticalSections: 6,
            },
            labels: {
                fillStyle: '#000000',
                fontSize: 25
            }
        });

        chart.addTimeSeries(this.t15m, {
            strokeStyle: 'rgba(162, 12, 176, 1)',
            fillStyle: 'rgba(162, 12, 176, 0.2)',
            lineWidth: 3
        });

        chart.addTimeSeries(this.t5m, {
            strokeStyle: 'rgba(12, 154, 176, 1)',
            fillStyle: 'rgba(12, 154, 176, 0.2)',
            lineWidth: 3
        });

        chart.addTimeSeries(this.t1m, {
            strokeStyle: 'rgb(63, 191, 191, 1)',
            fillStyle: 'rgba(63, 191, 191, 0.2)',
            lineWidth: 3
        });

        chart.addTimeSeries(this.tNow, {
            
            strokeStyle: 'rgba(176, 12, 12, 1)',
            lineWidth: 5
        });

        chart.streamTo(canvasElm, 500);
    }

    componentDidMount() {
        this.canvasElm = this.canvasRef.current || null as any;
        if (!this.canvasElm) throw 'chart canvas not found';

        // this.updateCanvasSize();
        this.createTimeline(this.canvasElm);

        // addEventListener('resize', () => this.updateCanvasSize());
        
        this.intv = interval(() => {
            if (this.lastTimeNow === this.props.timeNow) return;

            const { min1Avg: m1, min5Avg: m5, min15Avg: m15, hrNow } = this.props;

            if (hrNow) this.tNow.append(hrNow.time, hrNow.hr);
            if (m1) this.t1m.append(m1.time, m1.hr);
            if (m5) this.t5m.append(m5.time, m5.hr);
            if (m15) this.t15m.append(m15.time, m15.hr);

            this.lastTimeNow = this.props.timeNow;
        }, 500);
    }

    render = (p = this.props) => <><canvas
        ref={this.canvasRef}
        style={{
            display: 'block',
            position: 'fixed',
            bottom: 0,
            height: 160,
            width: '100%',
            visibility: p.showGraph ? "initial" : "hidden"
        }}
    /><div
        id="chart-spacer"
        style={{
            marginTop: 160
        }}
    /></>;
}

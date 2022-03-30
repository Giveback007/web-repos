import React, { Component, createRef } from "react";
import { arrGen, equal } from '@giveback007/util-lib';
import { Calendar as CalendarLib } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { set, store } from "./store";
import { strFromRes } from "./utils";

export class CalendarView extends Component<{ selectedMonth: number }> {
    state = { nCalendars: arrGen<null>(6, null) }

    render() {
        return <div className='calnedar-container'>
            {this.state.nCalendars.map((_, i) => <Calendar i={i} />)}
        </div>;
    }
}

const Calendar = class extends Component<{
    i: number;
}> {
    calRef = createRef<HTMLDivElement>();
    cal: CalendarLib | null = null;

    sub: { unsubscribe: () => boolean; } | null = null;

    firstRender = true;
    componentDidMount() {
        this.sub = store.stateSub([
            'roomDict', 'selectedMonth', 'selectedRoom'
        ], (s, prev) => {
            const room = s.roomDict[s.selectedRoom || ''];
            if (!room || !this.calRef.current) return;
    
            if (!this.cal) {
                this.cal = new CalendarLib(this.calRef.current, {
                    plugins: [ dayGridPlugin ], // timeGridPlugin, listPlugin 
                    initialView: 'dayGridMonth',
                    headerToolbar: {
                    left: null as any,
                    center: 'title',
                    right: null as any,
                    },
                    fixedWeekCount: false,
                    showNonCurrentDates: false,
                    contentHeight: 'auto',
                    titleFormat: { year: 'numeric', month: '2-digit' },
                });
    
                this.cal.render();
            }
    
            const m = this.props.i + s.selectedMonth;
            const dtM = new Date(set.nowYM.y, set.nowYM.m + m);
            const { reservations } = room;
    
            if (s.selectedMonth !== prev?.selectedMonth) {
                this.cal.gotoDate(dtM);
            }
    
            if (this.firstRender || s.selectedRoom !== prev?.selectedRoom || !equal(s.roomDict, prev.roomDict)) {
                this.cal.gotoDate(dtM);
                this.cal.removeAllEvents();
                reservations.forEach((re) => {
                    const start = new Date(re.fromDate), end = new Date(re.toDate);
                    
                    // const start = `${fDt.getFullYear()}-${minAppend(fDt.getMonth() + 1, 2)}-${minAppend(fDt.getDate(), 2)}`;
                    // const end = `${tDt.getFullYear()}-${minAppend(tDt.getMonth() + 1, 2)}-${minAppend(tDt.getDate(), 2)}`;
                    
                    const title = strFromRes(re);

                    this.cal?.addEvent({
                        title, start, end, textColor: 'black',
                        color: set.eventColorMap[re.status],
                    });
                });
            }

            this.firstRender = false;
        }, true);
    }

    componentWillUnmount = () =>
        this.sub && this.sub.unsubscribe();

    render = () =>
        <div ref={this.calRef} className="calnedar-inner-container" />;
};

import React, { Component, createRef } from "react";
import { arrGen, equal } from '@giveback007/util-lib';
import { Calendar as CalendarLib } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { set, store } from "./store";
import { strFromRes } from "./utils";

export class CalendarView extends Component<{ selectedRoom: string }> {
    state = { nCalendars: arrGen<null>(12, null) }

    render = () => this.props.selectedRoom ?
        <div className='calendar-container'>
            {this.state.nCalendars.map((_, i) => <Calendar selectedRoom={this.props.selectedRoom} i={i} />)}
        </div>
        :
        <h1 style={{fontSize: 'xx-large', textAlign: 'center'}}>Please Select A Room</h1>;
}

const Calendar = class extends Component<{
    i: number; selectedRoom: string;
}, {
    // selectedRoom: string | null
}> {
    // state = {
    //     selectedRoom: null,
    // };

    calRef = createRef<HTMLDivElement>();
    cal: CalendarLib | null = null;

    sub: { unsubscribe: () => boolean; } | null = null;

    firstRender = true;
    componentDidMount() {
        this.sub = store.stateSub([
            'roomDict', 'selectedMonth'
        ], (s, prev) => {
            if (!s.roomDict || !this.calRef.current) return;

            const {selectedRoom} = this.props;
            const room = s.roomDict[selectedRoom];
    
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
        <div ref={this.calRef} className="calendar-inner-container" />;
};


import { arrGen, minAppend, equal } from '@giveback007/util-lib';
import { NavDrawer, TopBar } from 'my-alyce-component-lib';
import { Button } from "my-alyce-component-lib";
import React, { Component, createRef } from "react";
import { link, set, State, store } from "./store";
import { genSimplifiedTime, readXL } from "./utils";
import { Calendar as CalendarLib } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';

type S = {
    navOpen: boolean;
}

export const App = link(s => s,
//     objExtract(s, [
//     'rooms', 'uploadTime', 'selectedRoom', 'nowDate'
// ]
class extends Component<State, S> {
    state: S = {
        navOpen: !!store.getState().rooms.length
    }

    fileUpldRef = createRef<HTMLInputElement>();

    handleRoomClick = (rm: Room) => {
        store.setState({ selectedRoom: rm.roomName });
        this.setState({ navOpen: false });
    }

    render() {
        const p = this.props;
        const s = this.state;
        const { selectedMonth, selectedRoom, rooms } = p;
        
        const m = new Date(set.nowYM.y, set.nowYM.m + selectedMonth, 1);

        return <>
            <TopBar
                addSpacer
                fixed
                className='top-bar'
                menuIsExpanded={s.navOpen}
                onMenuExpand={() => this.setState({ navOpen: !s.navOpen })}
                leftNavItems={[{
                    children: <Button>◄</Button>,
                    onClick: () => store.setState({ selectedMonth: selectedMonth - 1 }),
                }, {
                    children: <h1>{minAppend(m.getMonth() + 1, 2)}/{m.getFullYear()}</h1>,
                    onClick: () => {}
                }, {
                    children: <Button>►</Button>,
                    onClick: () => store.setState({ selectedMonth: selectedMonth + 1 })
                }]}
                rightNavItems={[{
                    children: <Button size='lg' className='upload-btn'>Upload XL</Button>,
                    onClick: () => {
                        this.fileUpldRef.current?.click();
                        const sub = store.stateSub('rooms', ({ rooms }) => {
                            if (rooms.length) {
                                this.setState({ navOpen: true });
                                sub.unsubscribe();
                            }
                        })
                    },
                }]}
                centerContent={<div className='center-content'>
                    <h1 className='xl-time'>{p.uploadTime ?
                        `XL Added ${genSimplifiedTime(p.uploadTime)}`
                        :
                        'No Data, Please Upload XL'
                    }</h1>
                    {selectedRoom && <h1 style={{ fontWeight: 'bold' }}>{selectedRoom}</h1>}
                </div>}
            />
            <NavDrawer
                className='nav-drawer'
                fixed={'left'}
                menuItems={p.rooms.map(r => ({
                    type: 'action',
                    title: r.roomName + '',
                    onClick: () => this.handleRoomClick(r),
                }))}
                isOpen={s.navOpen}
                onBackdropClick={() => this.setState({ navOpen: false })}
            />
            <input
                type="file"
                hidden
                ref={this.fileUpldRef}
                onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return alert("Error: Uploading File");

                    const rooms = await readXL(file);
                    store.setState({ rooms, uploadTime: Date.now(), selectedRoom: null });
                }}
            />
            {selectedRoom ? <CalendarView {...{selectedMonth}} /> : <h1 style={{fontSize: 'xx-large', textAlign: 'center'}}>{
                rooms.length ? 'Please Select A Room' : 'Please Add XL Data'
            }</h1>}
        </>;
    }
});

class CalendarView extends Component<{ selectedMonth: number }> {
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
    
            if (s.selectedRoom !== prev?.selectedRoom || !equal(s.roomDict, prev.roomDict)) {
                this.cal.gotoDate(dtM);
                this.cal.removeAllEvents();
                reservations.forEach((re) => {
                    const start = new Date(re.fromDate), end = new Date(re.toDate);
                    
                    // const start = `${fDt.getFullYear()}-${minAppend(fDt.getMonth() + 1, 2)}-${minAppend(fDt.getDate(), 2)}`;
                    // const end = `${tDt.getFullYear()}-${minAppend(tDt.getMonth() + 1, 2)}-${minAppend(tDt.getDate(), 2)}`;
                    
                    const title = re.status === "0" ?
                    'Closed'
                    :
                    `${re.guestName ?? ''}${re.guestNickName ? ` (${re.guestNickName})` : ''}`;

                    this.cal?.addEvent({
                        title, start, end, textColor: 'black',
                        color: set.eventColorMap[re.status],
                    });
                });
            }
        }, true);
    }

    componentWillUnmount = () =>
        this.sub && this.sub.unsubscribe();

    render = () =>
        <div ref={this.calRef} className="calnedar-inner-container" />;
};

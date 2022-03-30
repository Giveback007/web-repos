import { minAppend } from '@giveback007/util-lib';
import { NavDrawer, TopBar } from 'my-alyce-component-lib';
import { Button } from "my-alyce-component-lib";
import React, { Component, createRef } from "react";
import { AcctView } from './AccountingView';
import { CalendarView } from './CalendarView';
import { ScrollView } from './ScrollView';
import { link, set, State, store } from "./store";
import { genSimplifiedTime, readXL } from "./utils";

type S = {
    navOpen: boolean;
    tab: 'scroll' | 'calendar' | 'accounting';
}

export const App = link(s => s,
//     objExtract(s, [
//     'rooms', 'uploadTime', 'selectedRoom', 'nowDate'
// ]
class extends Component<State, S> {
    state: S = {
        navOpen: false, // !!store.getState().rooms.length,
        tab: 'accounting',
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
                leftNavItems={rooms.length ? [{
                    children: <Button
                        type='primary'
                        outline={s.tab !== 'scroll'}
                    >Mth</Button>,
                    onClick: () => this.setState({ tab: 'scroll' })
                }, {
                    children: <Button
                        type='primary'
                        outline={s.tab !== 'calendar'}
                    >Cal</Button>,
                    onClick: () => this.setState({ tab: 'calendar' })
                }, {
                    children: <Button
                        type='primary'
                        outline={s.tab !== 'accounting'}
                    >Act</Button>,
                    onClick: () => this.setState({ tab: 'accounting' })
                }] : []}
                rightNavItems={[{
                    children: <Button size='lg' className='upload-btn'>Add XL</Button>,
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
                    {/* <h1 className='xl-time'>{p.uploadTime ?
                        `XL Added ${genSimplifiedTime(p.uploadTime)}`
                        :
                        'No Data, Please Upload XL'
                    }</h1> */}
                    {/* <Button type='primary' size='auto' onClick={() => this.setState({ navOpen: true })}>Select Room</Button> */}
                    <Button
                        type='info'
                        size='lg'
                        onClick={() => this.setState({ navOpen: true })}
                        // style={{ fontSize: 'large' }}
                    >
                        {selectedRoom ? `Rm: ${selectedRoom}` : 'Select Room'}
                    </Button>
                    {/* {selectedRoom ? <h1 style={{ fontWeight: 'bold' }}>{selectedRoom}</h1>} */}
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



            {rooms.length ? <>
                <div id="month-selector">
                    <Button
                        shape='flat'
                        onClick={() => store.setState({ selectedMonth: selectedMonth - 1 })}
                    >◄</Button>
                    <input
                        type="month"
                        value={`${m.getFullYear()}-${minAppend(m.getMonth() + 1, 2)}`}
                        onChange={(e) => {
                            const [y, _m] = e.target.value.split('-').map(s => Number(s));
                            const selectedMonth = (y * 12 + _m - 1) - (set.nowYM.y * 12 + set.nowYM.m);
                            
                            store.setState({ selectedMonth });
                        }}
                    />
                    {/* <h1>{minAppend(m.getMonth() + 1, 2)}/{m.getFullYear()}</h1> */}
                    <Button
                        shape='flat'
                        onClick={() => store.setState({ selectedMonth: selectedMonth + 1 })}
                    >►</Button>
                </div>

                {s.tab === 'calendar' && (selectedRoom ?
                    <CalendarView {...{selectedMonth}} />
                    :
                    <h1 style={{fontSize: 'xx-large', textAlign: 'center'}}>Please Select A Room</h1>)
                }

                {s.tab === 'scroll' && <ScrollView />}

                {s.tab === 'accounting' && <AcctView />}
            </> : <h1 style={{fontSize: 'xx-large', textAlign: 'center'}}>Please Add XL Data</h1>}
            
            <div style={{height: 45, width: '100%'}}/>

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
        </>;
    }
});


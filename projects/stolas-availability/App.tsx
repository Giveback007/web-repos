import { minAppend, objExtract, objKeyVals } from '@giveback007/util-lib';
import { NavDrawer, TopBar } from 'my-alyce-component-lib';
import { Button } from "my-alyce-component-lib";
import React, { Component, createRef } from "react";
import { AcctView } from './AccountingView';
import { ScrollView } from './ScrollView';
import { link, set, State, store } from "./store";
import { readXL } from "./utils";

type S = {
    navOpen: boolean;
    tab: 'scroll' | 'accounting';
}

export const App = link(s => objExtract(s, ['selectedMonth', 'selectedRoom', 'rooms', 'roomTypes']),
class extends Component<Pick<State, 'selectedMonth' | 'selectedRoom' | 'rooms' | 'roomTypes'>, S> {
    state: S = {
        navOpen: false, // !!store.getState().rooms.length,
        tab: 'scroll',
    }

    fileUpldRef = createRef<HTMLInputElement>();

    handleRoomClick = (rm: Room) => {
        store.setState({ selectedRoom: rm.roomName });
        this.setState({ navOpen: false });
    }

    render() {
        const { selectedMonth, selectedRoom, rooms, roomTypes } = this.props;
        const { navOpen, tab } = this.state;
        
        const m = new Date(set.nowYM.y, set.nowYM.m + selectedMonth, 1);

        const navItems: any[] = [];
        if (roomTypes) objKeyVals(roomTypes).map(({key, val}, i) => {
            if (i) navItems.push({type: 'break'});

            navItems.push(
                {type: 'section', title: key },
                ...val.map(r => ({
                    type: 'action',
                    title: r.roomName + '',
                    onClick: () => this.handleRoomClick(r),
                    isActive: r.roomName === selectedRoom
                }))
            );
        })

        return <>
            <TopBar
                addSpacer
                fixed
                style={{maxWidth: '100vw'}}
                className='top-bar'
                menuIsExpanded={navOpen}
                onMenuExpand={() => this.setState({ navOpen: !navOpen })}
                leftNavItems={rooms.length ? [{
                    children: <Button
                        type='primary'
                        outline={tab !== 'scroll'}
                    >Mnth</Button>,
                    onClick: () => this.setState({ tab: 'scroll' })
                },
                // {
                //     children: <Button
                //         type='primary'
                //         outline={tab !== 'calendar'}
                //     >Cal</Button>,
                //     onClick: () => this.setState({ tab: 'calendar' })
                // }, 
                {
                    children: <Button
                        type='primary'
                        outline={tab !== 'accounting'}
                    >Acct</Button>,
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
                brand="Stolas Rooms"
                menuItems={navItems}
                isOpen={navOpen}
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

                {/* {tab === 'calendar' && <CalendarView {...{selectedMonth, selectedRoom}} />} */}
                {tab === 'scroll' && <ScrollView />}
                {tab === 'accounting' && <AcctView />}

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


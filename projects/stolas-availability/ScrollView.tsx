import { arrGen, arrLast, days, Dict, hrs, isType, monthStartEnd, objExtract } from "@giveback007/util-lib";
import { Modal } from "my-alyce-component-lib";
import React, { Component, CSSProperties } from "react";
import { link, set, store } from "./store";
import { strFromRes } from "./utils";

const boxSize = 50;

type BaseRenderObj = {
    renderDays: number;
    rendTimeStart: number;
    rendTimeEnd: number;
}

type RenderReservation = Reservation & BaseRenderObj;

type RenderFill = BaseRenderObj & { status: null; };

const boxStyle: CSSProperties = {
    minWidth: boxSize,
    minHeight: boxSize,
    border: 'solid 1px lightgray',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center'
}

const datesBox: CSSProperties = {
    ...boxStyle,
    borderBottom: 'solid 2px black',
    
}

const selRowStyle: CSSProperties = {
    ...boxStyle,
    borderTop: 'solid 3px black',
    borderBottom: 'solid 3px black',
}

const selColStyle: CSSProperties = {
    ...boxStyle,
    borderLeft: 'solid 3px black',
    borderRight: 'solid 3px black',
}

type S = {
    daysArr: number[];
    renderDict?: Dict<(RenderReservation | RenderFill)[]>;
    modal: null | RenderReservation;
    selectedMonth: number;
}

type P = {
    rooms: Room[];
    selectedRoom: string;
}

export const ScrollView = link(s => {
    // create a list of days for the month
    // take the list of rooms
    // 
    return objExtract(s, ['rooms', 'selectedRoom']);
}, class extends Component<P, S> {
    state = { daysArr: [], modal: null, selectedMonth: 0 } as S;

    sub: { unsubscribe: () => boolean; } | null = null;
    componentWillUnmount = () => this.sub && this.sub.unsubscribe();

    componentDidMount() {
        this.sub = store.stateSub(['roomDict', 'selectedMonth'], (s) => {
            const { rooms, selectedMonth } = s;
            const renderDict = {};

            const m = set.nowYM.m + selectedMonth;
            const y = set.nowYM.y;
            const { end, start } = monthStartEnd(new Date(y, m, 1));

            const daysArr = arrGen(end.getDate()).map((_, i) => i + 1);

            const tStartM   = start.getTime();
            const tEndM     = end.getTime();
            rooms.map(rm => {
                // filter reservations that fall into the selected month and sort by date
                const resInMonth = rm.reservations
                    .filter(rsv => Math.max(rsv.fromDate, tStartM) < Math.min(rsv.toDate, tEndM))
                    .map(rsv => ({...rsv, rendTimeStart: rsv.fromDate, rendTimeEnd: rsv.toDate }))
                    .sort((a, b) => a.fromDate - b.fromDate)

                // create an array of all the reservations to be 
                const renderRes = [...resInMonth] as (typeof resInMonth[0] | {
                    rendTimeStart: number;
                    rendTimeEnd: number;
                    status: null;
                })[];

                if (!renderRes.length) {
                    renderRes.push({
                        rendTimeStart: tStartM,
                        rendTimeEnd: tEndM,
                        status: null,
                    });
                } else {
                    // if gap exists from start of month to start of first reservation -> fill
                    if (resInMonth[0].fromDate > tStartM)
                        renderRes.unshift({
                            rendTimeStart: tStartM,
                            rendTimeEnd: resInMonth[0].fromDate,
                            status: null,
                        });
                    // else make sure time start is not earlier than start of month
                    else
                        renderRes[0] = { ...renderRes[0], rendTimeStart: tStartM }

                    
                    // if gap exist from checkout of last reservation and end of month -> fill
                    if (tEndM > arrLast(resInMonth).toDate)
                        renderRes.push({
                            rendTimeStart: arrLast(resInMonth).toDate,
                            rendTimeEnd: tEndM,
                            status: null,
                        });
                    // else make sure time end is not later than start of month
                    else
                        renderRes[renderRes.length - 1] = { ...arrLast(renderRes), rendTimeEnd: tEndM }
                }

                const fillers: {
                    rendTimeStart: number;
                    rendTimeEnd: number;
                    status: null;
                }[] = [];

                // fill gaps in between reservations
                renderRes.forEach((res, i) => {
                    const nextRes = renderRes[i + 1];
                    if (
                        !nextRes
                        ||
                        res.rendTimeEnd + hrs(2) > nextRes.rendTimeStart
                    ) return;
                    
                    fillers.push({
                        rendTimeStart: res.rendTimeEnd,
                        rendTimeEnd: nextRes.rendTimeStart,
                        status: null,
                    });
                });
                
                renderDict[rm.roomName] = [...renderRes, ...fillers]
                    .sort((a, b) => a.rendTimeStart - b.rendTimeStart)
                    .map(x => {
                        let renderDays = Number(((x.rendTimeEnd - x.rendTimeStart) / days(1)).toFixed(1));
                        if (renderDays % 1) {
                            const remainder = renderDays % 1;
                            renderDays = renderDays - remainder + 0.5
                        }

                        return {...x, renderDays};
                    });
            });

            this.setState({ daysArr, renderDict, selectedMonth });
        }, true);
    }

    render() {
        const { daysArr, renderDict, modal, selectedMonth } = this.state;
        const { rooms, selectedRoom } = this.props;
        const nowDay = !selectedMonth && set.nowYM.d;
        
        return <div>
            {modal && <Modal
                onClose={() => this.setState({ modal: null })}
                onBackdropClick={() => this.setState({ modal: null })}
                style={{fontSize: 30, fontWeight: 600}}
            >
                <h1>Room: {modal.roomName}</h1>
                <h1>Type: {modal.roomType}</h1>
                <br />
                <h1>{modal.status !== '0' ? 'Guest:' : 'Room'} {strFromRes(modal)}</h1>
                <h1>From: {new Date(modal.fromDate).toLocaleDateString()}</h1>
                <h1>To: {new Date(modal.toDate).toLocaleDateString()}</h1>
            </Modal>}

            {/* DATES (top row) */}
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                position: 'sticky',
                top: 75,
                zIndex: 999,
                fontSize: 35,
            }}>
                <div style={{...datesBox, background: 'white'}}/>
                {daysArr.map(d => <div style={{...datesBox, background: nowDay === d ? 'orange' : 'white',}}>{d}</div>)}
            </div>

            {/* ROOMS */}
            <div style={{position: 'relative'}}>
                {/* Under Grid */}
                {rooms.map(({ roomName }) => {
                    const style = roomName === selectedRoom ? selRowStyle : boxStyle;

                    return <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                    }}>
                        <div style={{...style, borderRight: 'solid 1px black', fontSize: 20, fontWeight: 700}}>{roomName}</div>
                        {daysArr.map((d) => <div style={{
                            ...style,
                            ...nowDay === d && selColStyle,
                            background: roomName === selectedRoom && nowDay === d ? 'orange' : 'white',
                        }}></div>)}
                    </div>
                })}
                
                {/* Above Grid */}
                {renderDict && <div
                    style={{
                        position:'absolute',
                        top: 0,
                        left: 0,
                    }}
                >
                    {rooms.map(({ roomName }) => {
                        const style = roomName === selectedRoom ? selRowStyle : boxStyle;
                        // const text = 

                        return <div style={{
                            display: 'flex',
                            flexDirection: 'row',
                        }}>
                            <div style={style}/>
                            {renderDict[roomName].map(x => {
                                const isRes = x.status !== null;
                                const text = isRes ? strFromRes(x, true) : null;

                                return <div
                                    style={{
                                        height: boxSize - 10,
                                        width: boxSize * x.renderDays - 8,
                                        margin: '5px 4px',
                                        background: set.eventColorMap[x.status],
                                        opacity: 0.75,
                                        overflow: 'hidden',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        cursor: isRes ? 'pointer' : 'default',
                                    }}
                                    onClick={isRes ? () => this.setState({ modal: x }) : undefined}
                                    title={text}
                                >{x.status !== null &&
                                    <h3 style={{fontSize: 18, fontWeight: 700}}>{text}</h3>
                                }</div>
                            })}
                        </div>})
                    }
                </div>}
            </div>
        </div>;
    }
});
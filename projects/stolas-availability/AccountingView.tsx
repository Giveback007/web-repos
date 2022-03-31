import { days, Dict, objExtract } from '@giveback007/util-lib';
import React, { Component, CSSProperties } from 'react';
import { link, set } from './store';
import { fillTimeGaps, strFromRes } from './utils';

const getBoxStyle = (height: number, status: Reservation['status'] | 'fill', highlight: boolean): CSSProperties => ({
  background: status === 'fill' ? 'transparent' : set.eventColorMap[status],
  minHeight: Math.max(40, height),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '10px 0',
  border: highlight ? 'solid 10px gray' : undefined,
  textDecoration: highlight ? 'underline' : undefined,
});

type Filler = {
  status: 'fill';
  fromDate: number;
  toDate: number;
  days: number;
}

type P = {
  selectedRoom: string | null;
  roomDict: Dict<Room> | null;
}

export const AcctView = link(s => objExtract(s, ['roomDict', 'selectedRoom']), class extends Component<P> {
  render() {
    const { roomDict, selectedRoom } = this.props;

    if (!roomDict || !selectedRoom) return <h1 style={{fontSize: 'xx-large', textAlign: 'center'}}>Please Select A Room</h1>;

    const res = roomDict[selectedRoom].reservations;
    if (!res.length) return <h1 style={{fontSize: 'xx-large', textAlign: 'center'}}>No Reservations Data For This Room</h1>;

    let fillers: Filler[] = [];
    if (res.length > 1) {
      const startEnd = res.map(({ fromDate: start, toDate: end }) => ({ start, end }));
      fillers = fillTimeGaps(startEnd).map(({ start: fromDate, end: toDate }) => ({
          fromDate,
          toDate,
          status: 'fill',
          days: Math.round((toDate - fromDate) / days(1)),
      }));
    }

    const renderArr = [...res, ...fillers].sort((a, b) => a.fromDate - b.fromDate);

    return <div
      style={{
        border: 'solid 2px gray',
        margin: '10px auto',
        padding: '0 10px',
        maxWidth: 1000,
        fontSize: 20,
        fontWeight: 700
      }}
    >
      {renderArr.map((rs => {
        const t = set.dtStart.getTime();
        const highlight = t > rs.fromDate && t < rs.toDate;
        console.log(t > rs.fromDate && t < rs.toDate, rs)
        const style = getBoxStyle(Math.ceil(rs.days / 7) * 20, rs.status, highlight);

        return rs.status === 'fill' ?
          <div style={style}>{rs.days} Days Unbooked</div>
          :
          <div style={{...style}} >
            <h1>{rs.status !== '0' ? 'Guest:' : 'Room'} {strFromRes(rs, true)} | Days: {rs.days}</h1>
          </div>
      }))}
    </div>;
  }
});

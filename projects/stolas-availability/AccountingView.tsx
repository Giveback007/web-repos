import React, { Component } from 'react';

type P = {
}

export class AcctView extends Component<P> {
  render() {
    return <div
      style={{
        border: 'solid 2px gray',
        margin: '10px auto',
        padding: '0 10px',
        maxWidth: 800,
      }}
    ></div>;
  }
}

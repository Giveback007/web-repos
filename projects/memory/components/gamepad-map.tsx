import React, { Component } from 'react';
import { Button, Modal, Spinner } from 'my-alyce-component-lib';
import { bindGpButton, GpActions, link, set, State, store } from '../store';
import { debounceTimeOut } from '@giveback007/util-lib';

type P = {
    exit: () => any;
    gamepadBindings: State['gamepadBindings'];
}

type S = {
    actionToBind: GpActions | null;
    btnPressed: string | null;
}

export const GamepadMapModal = link(({ gamepadBindings }) => ({gamepadBindings}), class extends Component<P, S> {
    state: S = {
        actionToBind: null,
        btnPressed: null,
    }

    debounce = debounceTimeOut();
    sub = store.actionSub('gamepad', ({ data: { btn } }: { type: string, data: { id: string; btn: string } }) => {
        if (this.state.actionToBind) return;

        this.setState({ btnPressed: btn });
        this.debounce(() => this.setState({ btnPressed: null }), 750)
    });

    startBinding = (actionToBind: GpActions) => {
        this.setState({ actionToBind });
        this.debounce(() => this.setState({ actionToBind: null, btnPressed: null }), 3000);

        const sub = store.actionSub('gamepad', ({ data: { btn, id } }: { type: string, data: { id: string; btn: string } }) => {
            sub.unsubscribe();
            this.debounce(() => this.setState({ actionToBind: null, btnPressed: null }));
            bindGpButton(id, btn, actionToBind);
        });
    }

    componentWillUnmount = () => this.sub.unsubscribe();
    render() {
        const { exit, gamepadBindings } = this.props;
        const { actionToBind, btnPressed } = this.state;

        const gpId = navigator.getGamepads()[0]?.id;
        const btnsToAction = gamepadBindings[gpId as any] || {};
        const actionToBtns = Object.entries(btnsToAction).reduce((obj, [a, b]) => ({...obj, [b as any]: a}), {})

        return <Modal
            onBackdropClick={exit}
            onClose={exit}
        >
            <table style={{ width: '100%' }}>
                <tr>
                    <th>Function</th>
                    <th>Button Bound</th>
                </tr>

                {set.gamepadActions.map((action) => <tr
                    style={actionToBtns[action] === btnPressed ? { background: 'grey' } : {}}
                >
                    <td>{action.toUpperCase()}</td>
                    <td>{actionToBtns[action]}</td>
                    <td style={{width: '6rem'}}><Button
                        shape='flat'
                        type="info"
                        size='md'
                        style={{ height: '2.5rem', width: '100%' }}
                        disabled={!!actionToBind}
                        onClick={() => this.startBinding(action)}
                    >{actionToBind === action ? <Spinner
                        size='auto'
                        type={10}
                    /> : 'Bind'}</Button></td>
                </tr>)}
            </table>
        </Modal>
    }
});

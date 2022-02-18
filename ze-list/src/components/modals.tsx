import { hours, minutes, seconds } from "@giveback007/util-lib";
import { Button, Modal, TextArea, TextInput } from "my-alyce-component-lib";
import React, { MouseEventHandler, useState } from "react";
import { store } from "../store/store";
import { textToObjs } from "../utils/utils";

export function MaxTimeModal(_p: {}) {
    const [min, setMin] = useState(0);
    const [sec, setSec] = useState(0);
    const close = () => store.toggle('maxTimeModal');

    const set: MouseEventHandler<HTMLInputElement> = (e) => {
        const target: HTMLInputElement = e.target as any;
        const alt: 'min' | 'sec' = (target as any).alt;
        let value = Number((e.target as HTMLInputElement).value) || 0;
        if (value > 59) value = 59;
        if (value < 0) value = 0;

        if (alt === 'min') {
            setMin(value);
        } else if (alt === 'sec') {
            setSec(value);
        }
    }

    return <Modal
        header='Time Per Item'
        zIndex={1004}
        onClose={close}
        onBackdropClick={close}
        className='p-4 max-w-xs'
    >
        <div className='flex'>
            <TextInput type='number' label='min' labelType='addon' className='flex-1' max={59} min={0} onChange={set} value={min} />
            <TextInput type='number' label='sec' labelType='addon' className='flex-1' max={59} min={0} onChange={set} value={sec} />
        </div>

        <Button size='auto' type='primary' shape='flat' onClick={() => {
            store.setState({ timePerItem: minutes(min) + seconds(sec), doDingForTime: true});
            close();
        }}>Set</Button>
    </Modal>
}

export function TotalTimeModal(_p: {}) {
    const [hrs, setHrs] = useState(0);
    const [min, setMin] = useState(0);
    const close = () => store.toggle('totalTimeModal');

    const set: MouseEventHandler<HTMLInputElement> = (e) => {
        const target: HTMLInputElement = e.target as any;
        const alt: 'min' | 'hrs' = (target as any).alt;
        let value = Number((e.target as HTMLInputElement).value) || 0;

        const max = alt === 'min' ? 59 : 24;
        if (value > max) value = max;
        if (value < 0) value = 0;

        if (alt === 'hrs') {
            setHrs(value);
        } else if (alt === 'min') {
            setMin(value);
        }
    }

    return <Modal
        header='Total Time This Session'
        zIndex={1004}
        onClose={close}
        onBackdropClick={close}
        className='p-4 max-w-sm'
    >
        <div className='flex'>
            <TextInput type='number' label='hrs' labelType='addon' className='flex-1' max={23} min={0} onChange={set} value={hrs} />
            <TextInput type='number' label='min' labelType='addon' className='flex-1' max={59} min={0} onChange={set} value={min} />
        </div>

        <Button size='auto' type='primary' shape='flat' onClick={() => {
            store.setState({ timePerItem: (hours(hrs) + minutes(min)) / store.getState().items.length, doDingForTime: true });
            close();
        }}>Set</Button>
    </Modal>
}

export function AddTextModal(_p: {}) {
    const [text, setText] = useState('');
    const close = () => store.toggle('addTextModal');

    return <Modal
        header='Add Text'
        zIndex={1004}
        onClose={close}
        onBackdropClick={close}
        
    >
        <TextArea
            className='h-[60vh] max-h-96'
            value={text}
            onChange={(e) => setText((e.target as any).value)}
        />
        <Button size='auto' type='primary' shape='flat' onClick={() => {
            store.setState({ items: textToObjs(text) });
            close();
        }}>Add</Button>
    </Modal>
}
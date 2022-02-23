import React, { useState } from "react";
import { Button, Modal, TextInput } from "my-alyce-component-lib";
import { addQnA, store } from "../store";

export function AddWord(p: { exit: () => any }) {
    const [btnType, setBtnType] = useState<'primary' | 'success'>('primary')
    const [q, setQ] = useState('');
    const [a, setA] = useState('');
    const [n, setN] = useState(store.getState().memorize.length + 1);

    const disableSubmit = !q || !a;
    const handleSubmit = (immediate: boolean) => {
        addQnA({ q, a, immediate });
        setN(n + 1);
        setQ('');
        setA('');
        setBtnType('success');
        setTimeout(() => setBtnType('primary'), 750);
    }

    return <Modal
        header={`Add QnA: #${n}`}
        onBackdropClick={p.exit}
        onClose={p.exit}
    >
        <TextInput
            label='Question'
            value={q}
            onChange={(e: any) => setQ(e.target.value)}
        />
        <TextInput
            label='Answer'
            value={a}
            onChange={(e: any) => setA(e.target.value)}
        />
        <br/>
        <Button
            size='auto'
            type='secondary'
            disabled={disableSubmit}
            onClick={() => handleSubmit(true)}
            style={{ marginBottom: '0.5rem' }}
        >{disableSubmit ? '!' : '🔁 Add To Review'}</Button>
        <Button
            size='auto'
            type={btnType}
            disabled={disableSubmit}
            onClick={() => handleSubmit(false)}
            style={{height: '3rem'}}
        >{disableSubmit ? 'Fill Out Question and Answer' : '📥 Add To Storage'}</Button>
    </Modal>;
}

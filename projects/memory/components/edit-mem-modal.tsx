import { objVals, wait } from "@giveback007/util-lib";
import { Button, Modal, TextInput } from "my-alyce-component-lib";
import React, { useState } from "react";
import { store } from "../store";

export function EditMem(p: { exit: () => any, memId: string }) {
    const { memId, exit } = p;
    const { question, answer } = store.getState().memoryDict[memId];

    const [doDisable, setDoDisable] = useState<boolean>(false);
    const [btnType, setBtnType] = useState<'primary' | 'success'>('primary')
    const [q, setQ] = useState(question);
    const [a, setA] = useState(answer);

    const disableSubmit = doDisable || !q || !a || (q === question && a === answer);
    const handleSubmit = () => {
        setDoDisable(true);
        setBtnType('success');
        const dict = store.getState().memoryDict;
        const mem = dict[memId];

        dict[memId] = { ...mem, question: q.trim(), answer: a.trim(), updatedOn: Date.now() };
        store.setState({ memorize: objVals(dict) });

        wait(550).then(() => exit());
    }

    return <Modal
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
            type={btnType}
            disabled={disableSubmit}
            onClick={() => handleSubmit()}
            // style={{height: '3rem'}}
        >Save</Button>
    </Modal>
}


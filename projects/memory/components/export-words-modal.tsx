import React, { useState } from "react";
import { Button, Modal, TextArea } from "my-alyce-component-lib";
import { store } from "../store";
import { objExtract } from "@giveback007/util-lib";

export function ExportWordsModal(p: { exit: () => any }) {
    const [btnColor, setBtnColor] = useState<'primary' | 'success'>('primary');
    const [text, setText] = useState(
        JSON.stringify(objExtract(store.getState(), ['memorize', 'notIntroduced']))
    );

    return <Modal
        header='Export JSON Data'
        zIndex={1004}
        onClose={p.exit}
        onBackdropClick={p.exit}
    >
        <TextArea
            style={{height: '60vh', maxHeight: '50rem' }}
            value={text}
            onChange={(e) => setText((e.target as any).value)}
            selected
        />
        <Button
            size='auto'
            type={btnColor}
            shape='flat'
            onClick={() => {
                navigator.clipboard.writeText(text);
                setBtnColor('success');
                setTimeout(() => setBtnColor('primary'), 1250);
            }}
        >{btnColor === 'primary' ? 'Copy To Clipboard' : 'Copied!'}</Button>
    </Modal>
}
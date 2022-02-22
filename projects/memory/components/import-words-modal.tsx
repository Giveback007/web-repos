import React, { useState } from "react";
import { Button, Modal, TextArea } from "my-alyce-component-lib";
import { AnyObj, Dict, isType, objKeys, type } from "@giveback007/util-lib";
import { Memory } from "../utils";
import { store } from "../store";

export function AddTextModal(p: { exit: () => any }) {
    const [text, setText] = useState('');

    return <Modal
        header='Add JSON Data'
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
            let hasError: false | string = false;
            try {
                const json = JSON.parse(text) as Memory[];
                if (!isType(json, 'array')) {
                    hasError = 'JSON is not an array'
                    throw ''
                };

                const validate = new Memory('','');
                const keys = objKeys(validate);
                
                for (const item of json) {
                    keys.forEach(k =>
                        type(json[k]) !== type(item[k]) && (hasError = `item: ${item.id} & key: ${k}`));

                    if (hasError) throw '';
                }
            } catch {
                alert(hasError ? `Can't parse json. Error: ${hasError}` : "JSON parsing error");
            }

            // store.setState({ items: textToObjs(text) });
            close();
        }}>Add</Button>
    </Modal>
}
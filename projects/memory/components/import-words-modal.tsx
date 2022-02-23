import React, { useState } from "react";
import { Button, Modal, TextArea } from "my-alyce-component-lib";
import { isType, objKeys, type } from "@giveback007/util-lib";
import { Memory } from "../utils";
import { importWords } from "../store";

export function ImportWordsModal(p: { exit: () => any }) {
    const [text, setText] = useState('');

    return <Modal
        header='Add JSON Data'
        zIndex={1004}
        onClose={p.exit}
        onBackdropClick={p.exit}
    >
        <TextArea
            // className='h-[60vh] max-h-96'
            style={{height: '60vh', maxHeight: '50rem' }}
            value={text}
            onChange={(e) => setText((e.target as any).value)}
        />
        <Button size='auto' type='primary' shape='flat' onClick={() => {
            try {
                const json = JSON.parse(text) as { memorize: Memory[]; notIntroduced: Memory[] };
                if (!isType(json, 'object'))
                    throw '[JSON is not an object]';
        
                const { memorize, notIntroduced } = json;
                if (!memorize && !notIntroduced) throw '[No keys found: "memorize" || "notIntroduced"]'
        
                const validate = new Memory('','');
                const keys = objKeys(validate);
        
                const fct = (item: Memory) => keys.forEach(k => {
                    if (type(validate[k]) !== type(item[k])) throw `[item-id: "${item.id}", key: "${k}"]`;
                });
                
                memorize.forEach(fct);
                notIntroduced.forEach(fct);

                importWords({ memorize, notIntroduced });
                p.exit();
            } catch (err: any) {
                alert(`Can't parse json. Error: ${err.toString()}`);
            }
            
        }}>Add</Button>
    </Modal>
}
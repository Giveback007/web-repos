import React, { useState } from "react";
import { Button, Modal, TextArea } from "my-alyce-component-lib";
import { isType, objKeys, type } from "@giveback007/util-lib";
import { Memory } from "../util/utils";
import { importWords } from "../util/state.util";

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
                const json = JSON.parse(text) as { memorize: Memory[]; notIntroduced: Memory[] } | [string, string][];

                if (isType(json, 'array')) {
                    json.forEach((tpl, i) => {
                        if (tpl.length !== 2)
                            throw `[In array idx: ${i}, there must be only 2 items]`;
                        
                        if (!isType(tpl[0], 'string') || !isType(tpl[1], 'string'))
                            throw `[In array idx: ${i}, both items are not type string]`
                    });

                    return importWords(json);
                }

                if (!isType(json, 'object') && !isType(json, 'array'))
                    throw '[JSON is not an object || array]';
        
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
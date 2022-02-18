import React, { useEffect, useRef } from "react";
import { objExtract } from "@giveback007/util-lib";
import { link } from "../store/store";
import { Detail, scramble } from "../utils/utils";
import classNames from "classnames";


export const AccordionContent = link(
    s => objExtract(s, ['doScramble', 'currentItemReading', 'doSpeak']),
    (p: {
        doScramble: boolean;
        doSpeak: boolean;
        details: Detail[];
        readItem?: number;
        currentItemReading: Detail | null;
        id: string;
    }) => {
        
        return <div className={'p-2.5 ' + p.id}>
            {p.details.map(({ text, id }) =>
                <ContentItem
                    key={id}
                    text={p.doScramble ? scramble(text) : text}
                    underline={p.doSpeak && p.currentItemReading?.id === id}
                />
            )}
        </div>;
    }
);

const ContentItem = ({ text, underline }: { text: string; underline: boolean; }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!underline) return;
        
        const { current } = ref
        if (current) {
            const parent: HTMLElement = current.parentElement?.parentElement as any;

            parent.scrollTo({
                top: getRelativePos(current).top - 5,
                behavior: 'smooth'
            });
        }
    }, [ref, underline]);


    return <div
        ref={ref}
        className={classNames(
            "pb-2", underline && 'underline decoration-green-400'
        )}
    >{text}</div>
}

function getRelativePos(elm: HTMLElement) {
    if (!elm) throw new Error('Cant be null');
    
    const pPos: DOMRect = elm.parentElement?.getBoundingClientRect() as any; // parent pos
    const cPos: DOMRect = elm.getBoundingClientRect(); // target pos

    return {
        top:    cPos.top    - pPos.top + (elm.parentNode as any).scrollTop as number,
        right:  cPos.right  - pPos.right,
        bottom: cPos.bottom - pPos.bottom,
        left:   cPos.left   - pPos.left,

    };
}

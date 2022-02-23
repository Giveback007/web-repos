import { interval, msTimeObj } from '@giveback007/util-lib';
import { Button, Modal } from 'my-alyce-component-lib';
import React, { useEffect, useState } from 'react';
import { deleteMem, updateMem } from '../store';
import { calcMem, genSimplifiedTime, Memory } from '../utils';

export function QnaModal({ exit, mem }: { exit: () => any, mem: Memory }) {
    const [showAnswer, setShowAnswer] = useState(false);
    const [tStart] = useState(Date.now());
    const [useTimer, setUseTimer] = useState(true);
    const [tPass, setTPass] = useState(0);

    useEffect(() => {
        const itv = interval(() => {
            if (!useTimer) return itv.stop();
            setTPass(Date.now() - tStart);
        }, 1000);

        return itv.stop;
    }, [tStart, useTimer]);
    
    const content = showAnswer ?
        <QnAShow exit={exit} mem={mem} />
        :
        <div>
            <h1 style={{fontSize: "large"}}>Q:</h1>
            <p style={{fontSize: "1.75rem"}}>{mem.question}</p>
            <Button
                size='auto'
                shape='flat'
                onClick={() => {
                    setShowAnswer(true);
                    setUseTimer(false);
                }}
                style={{marginTop: '1rem'}}
            >Show</Button>
        </div>;

    const { m, s } = msTimeObj(tPass);
    return <Modal
        onBackdropClick={exit}
        onClose={exit}
        header={<div style={{display: 'flex', alignItems: 'center'}}>
            <Button
                type='danger'
                shape='flat'
                onClick={() => {
                    const yes = confirm(`Delete: \nQ: ${mem.question} \nA: ${mem.answer}`);
                    if (yes) {
                        exit();
                        deleteMem(mem.id)
                    }
                }}
                style={{marginRight: '1rem'}}
            >Delete</Button>
            <p className="text-2xl font-bold">{`${m}:${s} | Q-n-A`}</p>
        </div>}
    >{content}</Modal>;
}

function QnAShow({ exit, mem }: { exit: () => any, mem: Memory }) {

    const update = (sucess: boolean) => {
        updateMem(mem.id, sucess);
        exit();
    };
    
    const statsStyles: React.CSSProperties = {
        flex: 1, padding: '0.2rem', display: 'flex', flexDirection: 'column'
    };

    const onSuccess = calcMem(mem, true);
    const onFail = calcMem(mem, false);
    
    return <>
        <h1 style={{fontSize: "large"}}>Q:</h1>
        <p style={{fontSize: "1.75rem"}}>{mem.question}</p>
        <hr style={{margin: '1rem 0'}} />
        <h1 style={{fontSize: "large"}}>A:</h1>
        <p style={{fontSize: "1.75rem"}}>{mem.answer}</p>

        <div style={{display: 'flex', borderTop: 'solid 2px black', marginTop: '1rem'}}>
            <div style={{...statsStyles, borderRight: 'solid 2px lightgray'}}>
                <div>On Fail:</div>
                <div>Score: {onFail.score.toFixed(2)}</div>
                <div>Ease : {onFail.ease.toFixed(2)}</div>
            </div>
            <div style={{...statsStyles}}>
                <div>On Success:</div>
                <div>Score: {onSuccess.score.toFixed(2)}</div>
                <div>Ease : {onSuccess.ease.toFixed(2)}</div>
            </div>
        </div>

        <div style={{ display: 'flex', marginTop: '1rem' }}>
            <Button
                shape='flat'
                type='danger'
                style={{ flex: 1 }}
                onClick={() => update(false)}
            >👎 {`-> ${genSimplifiedTime(onFail.reviewOn)}`}</Button>
            <Button
                shape='flat'
                type='success'
                style={{ flex: 1 }}
                onClick={() => update(true)}
            >👍
            {` -> ${genSimplifiedTime(onSuccess.reviewOn)}`}</Button>
        </div>
    </>
}
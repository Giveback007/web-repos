import { interval, msTimeObj, wait } from '@giveback007/util-lib';
import { Button, Modal } from 'my-alyce-component-lib';
import React, { useEffect, useState } from 'react';
import { deleteMem, updateMem } from '../util/state.util';
import { calcMem, genSimplifiedTime, isTxtInput, Memory } from '../util/utils';
import { EditMem } from './edit-mem-modal';

export function QnaModal({ exit, mem }: { exit: (showNext?: boolean) => any, mem: Memory }) {
    const [showAnswer, setShowAnswer] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
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

    useEffect(() => {
        function keyListener(e: KeyboardEvent) {
            const { target, key } = e;
            
            if (!isTxtInput(target) && key === 'KeyX')
                return exit(false);
            if (isTxtInput(target) || showEdit)
                return;

            if (key === 'Enter' || key === 'ArrowDown')
                setShowAnswer(true);
        }

        addEventListener('keydown', keyListener);
        return () => removeEventListener('keydown', keyListener);
    });
    
    const content = showAnswer ?
        <QnAShow exit={exit} mem={mem} />
        :
        <div>
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
    return <>{showEdit && <EditMem exit={() => setShowEdit(false)} memId={mem.id}/>}<Modal
        onBackdropClick={() => exit()}
        onClose={() => exit()}
        style={showEdit ? { display: 'none' } : undefined}
        header={
            <div style={{display: 'flex', alignItems: 'center'}}>
                <Button
                    type='info'
                    shape='flat'
                    onClick={() => {
                        setShowAnswer(false);
                        setShowEdit(true);
                    }}
                    style={{marginRight: '1rem'}}
                >Edit</Button>
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
                <p className="text-2xl font-bold">{`${m}:${s}`}</p>
            </div>
        }
    >{content}</Modal></>;
}

function QnAShow({ exit, mem }: { exit: (showNext?: boolean) => any, mem: Memory }) {
    const [disable, setDisable] = useState(true);
    const [didPass, setDidPass] = useState<null | 'yes' | 'no'>(null);

    const update = async (success: boolean, showNext?: boolean) => {
        setDidPass(success ? 'yes' : 'no');
        updateMem(mem.id, success);

        await wait(showNext ? 350 : 150);
        exit(showNext);
    };

    useEffect(() => {
        wait(350).then(() => setDisable(false));

        function keyListener(e: KeyboardEvent) {
            const { target, key } = e;
            if (isTxtInput(target) || disable) return;

            if (didPass && (key === 'Enter' || key === 'ArrowDown')) exit(true);
            
            if (key === 'KeyA' || key === 'ArrowLeft') update(false, true);
            if (key === 'KeyD' || key === 'ArrowRight') update(true, true);
        }

        addEventListener('keydown', keyListener);
        return () => removeEventListener('keydown', keyListener);
    });
    
    const statsStyles: React.CSSProperties = {
        flex: 1, padding: '0.2rem', display: 'flex', flexDirection: 'column'
    };

    const onSuccess = calcMem(mem, true);
    const onFail = calcMem(mem, false);
    
    return didPass ? <h1 style={{
        fontSize: "8rem",
        textAlign: 'center',
        borderTop: 'solid 2px grey'
    }}>{didPass === 'yes' ? '👍' : '👎'}</h1> : <>
        {/* <h1 style={{fontSize: "large"}}>Q:</h1> */}
        <p style={{fontSize: "1.75rem"}}>{mem.question}</p>
        <hr style={{margin: '1rem 0'}} />
        {/* <h1 style={{fontSize: "large"}}>A:</h1> */}
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
                disabled={disable}
                shape='flat'
                type='danger'
                style={{ flex: 1 }}
                onClick={() => update(false)}
            > 👎 {` ➔ ${genSimplifiedTime(onFail.reviewOn)}`}</Button>
            <Button
                disabled={disable}
                shape='flat'
                type='success'
                style={{ flex: 1 }}
                onClick={() => update(true)}
            > 👍
            {` ➔ ${genSimplifiedTime(onSuccess.reviewOn)}`}</Button>
        </div>
    </>
}
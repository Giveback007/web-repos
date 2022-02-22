import { min, objKeys, msTimeObj } from "@giveback007/util-lib";
import { Button } from "my-alyce-component-lib";
import React, { Component } from "react";
import { learnNewWord, link, State } from "../store";
import { genSimplifiedTime } from "../utils";
import { AddWord } from "./add-word-modal";
import { QnaModal } from "./qna-modal";

type S = {
    modal: 'add-word' | 'q-n-a' | 'import-words' | null;
    selectedId: string | null;
};

type P = State;
export const App = link(s => s, class extends Component<P, S> {
    state: S = {
        modal: null,
        selectedId: null
    }

    render() {
        const WordsString = ({ nReady, t }: { nReady: number, t: string }) =>
            nReady ? <h1 style={{ fontSize: 'large', textAlign: 'center' }}>{`${nReady} Word${nReady > 1 ? 's' : ''} In < ${t}`}</h1> : null

        const { modal, selectedId } = this.state;
        const {
            memorize, readyQnA, memoryDict, tNow,
            nReadyIn1min, nReadyIn5min, nReadyIn1hrs,
            nextIncomingId, notIntroduced
        } = this.props;

        if (memorize.length && !objKeys(memoryDict).length) return <h1>Loading...</h1>;
    
        // const reviewOn = memorize[0]?.reviewOn;
        
        // const tNextReview = reviewOn ? reviewOn - tNow : 'none';

        const nextWordTimer = (() => {
            if (!nextIncomingId) return null;
            let str = '...';
            
            const { reviewOn } = memoryDict[nextIncomingId];
            const tNext = reviewOn - tNow;
            if (tNext < min(5)) {
                const { m, s } = msTimeObj(tNext);
                str = `${m}:${s}`;
            } else {
                str = genSimplifiedTime(reviewOn) || '...';
            }

            return <h1 style={{margin: '0 0.5rem', fontSize: '1.5rem'}}>
                Word Incoming in: {str}
            </h1>
        })();

        const ready = readyQnA.length || false;
        const readyWords = ready && <h1 style={{margin: '0 0.5rem', fontSize: '1.5rem'}}>
            {`${ready} Word${ready > 1 ? 's' : ''} Ready Now`}
        </h1>;

        return <div style={{maxWidth: 650, margin: 'auto', padding: '0 0.2rem'}}>
            <div style={{ display: 'flex' }}>
                <Button
                    shape='flat'
                    type='primary'
                    style={{flex: 1}}
                    size='lg'
                    onClick={() => this.setState({ modal: 'add-word' })}
                >Add Word</Button>
                <Button
                    shape='flat'
                    type='info'
                    style={{flex: 1}}
                    size='lg'
                    onClick={() => this.setState({ modal: 'import-words' })}
                >Import Words</Button>
                <Button
                    shape='flat'
                    type='secondary'
                    style={{flex: 1}}
                    size='lg'
                    onClick={() => this.setState({ modal: 'import-words' })}
                >Export Words</Button>
            </div>

            <h1 style={{fontSize: 'xx-large', textAlign: 'center'}}>Total Words: {memorize.length}</h1>

            <div style={{marginTop: '1rem'}}>
                {([
                    [nReadyIn1hrs, '1 Day'],
                    [nReadyIn1hrs, '1 Hrs'],
                    [nReadyIn5min, '5 Min'],
                    [nReadyIn1min, '1 Min'],
                ] as const).map(([nReady, t]) => <WordsString {...{nReady, t}}/>) }
            </div>
                
            <br />
            <div style={{display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
                {nextWordTimer}
                {readyWords}
                {!ready && <Button
                    onClick={() =>
                        this.setState({ modal: 'q-n-a', selectedId: memorize[0].id })}
                >Skip Wait</Button>}
            </div>

            <br/>
            <div style={{borderTop: 'solid 3px lightgray', paddingTop: '0.3rem'}}>
                <Button
                    size="auto"
                    type="primary"
                    disabled={!notIntroduced.length}
                    onClick={() => this.setState({ selectedId: learnNewWord() })}
                >Learn New Word</Button>
                {!!readyQnA.length && <>
                    <h1 style={{fontSize: '2rem', textAlign: 'center', marginBottom: '1rem'}}>READY WORDS:</h1>
                    
                    {readyQnA.map(id => {
                        const { question } = memoryDict[id];
                        return <Button
                            style={{ margin: '0.2rem' }}
                            shape="flat"
                            size='xl'
                            onClick={() => {
                                this.setState({ modal: 'q-n-a', selectedId: id });
                            }}
                        >{question}</Button>
                    })}
                </>}
            </div>
            
            {modal === 'q-n-a' && selectedId && <QnaModal mem={memoryDict[selectedId]} exit={() => this.setState({ modal: null, selectedId: null })} />}
            {modal === 'add-word' && <AddWord exit={() => this.setState({ modal: null })} />}
        </div>
    }
});
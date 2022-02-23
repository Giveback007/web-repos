import { min, objKeys, msTimeObj } from "@giveback007/util-lib";
import { Button } from "my-alyce-component-lib";
import React, { Component } from "react";
import { learnNewWord, link, State } from "../store";
import { genSimplifiedTime } from "../utils";
import { AddWord } from "./add-word-modal";
import { ExportWordsModal } from "./export-words-modal";
import { ImportWordsModal } from "./import-words-modal";
import { QnaModal } from "./qna-modal";

type S = {
    modal: 'add-word' | 'q-n-a' | 'import-words' | 'export-words' | null;
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
            <h1 style={{ fontSize: 'large', textAlign: 'center' }}>{`[${nReady}] ${t}`}</h1>;

        const { modal, selectedId } = this.state;
        const {
            memorize, readyQnA, memoryDict, tNow,
            nReadyIn5min, nReadyToday, nReadyTomorrow, nReadyThisWeek,
            nextIncomingId, notIntroduced
        } = this.props;

        if (memorize.length && !objKeys(memoryDict).length) return <h1>Loading...</h1>;

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
                    onClick={() => this.setState({ modal: 'export-words' })}
                >Export Words</Button>
            </div>

            <div style={{display: 'flex', border: 'solid 1px lightgray'}}>
                <h1 style={{fontSize: 'x-large', textAlign: 'center', flex: 1}}>Stored Words: {notIntroduced.length}</h1>
                <div style={{borderRight: 'solid 1px lightgray', margin: '0 0.3rem'}}/>
                <h1 style={{fontSize: 'x-large', textAlign: 'center', flex: 1}}>Review Words: {memorize.length}</h1>
            </div>

            <div style={{marginTop: '1rem'}}>
                {([
                    [nReadyThisWeek, 'This Week'],
                    [nReadyTomorrow, 'Tomorrow'],
                    [nReadyToday, 'Today'],
                    [nReadyIn5min, 'In < 5min'],
                ] as const).map(([nReady, t]) => <WordsString {...{nReady, t}}/>) }
            </div>
                
            <br />
            <div style={{display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
                {nextWordTimer}
                {readyWords}
                {!ready && <Button
                    disabled={!memorize.length}
                    onClick={() =>
                        this.setState({ modal: 'q-n-a', selectedId: memorize[0].id })}
                >{memorize.length ? 'Skip Wait' : 'No Words Added'}</Button>}
            </div>

            <br/>
            <div style={{borderTop: 'solid 3px lightgray', paddingTop: '0.3rem'}}>
                <Button
                    size="auto"
                    type="primary"
                    disabled={!notIntroduced.length}
                    onClick={() => this.setState({ selectedId: learnNewWord() })}
                >{notIntroduced.length ? 'Learn New Word' : 'No Words In Storage'}</Button>
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
            {modal === 'import-words' && <ImportWordsModal exit={() => this.setState({ modal: null })} />}
            {modal === 'export-words' && <ExportWordsModal exit={() => this.setState({ modal: null })}/>}
        </div>
    }
});

import { min, objKeys, msTimeObj, wait } from "@giveback007/util-lib";
import { Alert, Avatar, Button } from "my-alyce-component-lib";
import React, { Component } from "react";
import { auth, link, State, store } from "../store";
import { deleteMem, learnNewWord } from "../util/state.util";
import { genSimplifiedTime, isTxtInput } from "../util/utils";
import { AddWord } from "./add-word-modal";
import { ExportWordsModal } from "./export-words-modal";
import { GamepadMapModal } from "./gamepad-map";
import { ImportWordsModal } from "./import-words-modal";
import { QnaModal } from "./qna-modal";

type S = {
    modal: 'add-word' | 'q-n-a' | 'import-words' | 'export-words' | 'gamepad' | null;
    selectedId: string | null;
    isSigningIn: boolean;
};

type P = State;
export const App = link(s => s, class extends Component<P, S> {
    state: S = {
        modal: null,
        selectedId: null,
        isSigningIn: true,
    }

    keyListener = (e: KeyboardEvent) => {
        const { target, key } = e;
        if (
            isTxtInput(target)
            ||
            this.state.modal
            ||
            !this.props.readyQnA.length
        ) return;

        if (key === 'Enter' || key === 'ArrowDown') {
            // const id = this.props.readyQnA[0];
            // this.setState({ selectedId: id, modal: 'q-n-a' })
            this.setQnA('NEXT')
        }
    }

    componentWillUnmount = () =>
        removeEventListener('keydown', this.keyListener);

    componentDidMount = async () => {
        addEventListener('keydown', this.keyListener);

        const res = await auth.refresh();
        if (res.type == 'success') store.action({ type: 'LOGIN_SUCCESS' });

        store.setState({ isLoading: false });
        this.setState({ isSigningIn: false });
    }

    setQnA = async (id: string | 'NEXT' | null): Promise<any> => {
        const { memoryDict, forReview, practiceReady } = this.props;
        
        this.setState({ modal: null, selectedId: null });
        await wait(0);
        
        if (id === 'NEXT') {
            const next = forReview[0] || practiceReady[0];
            if (!next) return learnNewWord();
            
            this.setState({ modal: 'q-n-a', selectedId: next });
        } else if (id) {
            const mem = memoryDict[id];
            if (!mem) throw new Error(`Mem with id: ${id} not found`);

            this.setState({ modal: 'q-n-a', selectedId: id });
        }
    }

    render() {
        
        const WordsString = ({ nReady, t }: { nReady: number, t: string }) =>
            <span style={{ fontSize: '1.1rem', textAlign: 'center', flex: 1 }}>{`[${nReady}] ${t}`}</span>;

        const { modal, selectedId, isSigningIn } = this.state;
        const {
            nReadyIn5min, nReadyIn30min, nReadyToday,
            nReadyTomorrow, nReadyThisWeek, nReadyNextWeek,

            memorize, readyQnA, memoryDict, tNow,
            nextIncomingId, notIntroduced,
            
            alert, user, isLoading, syncStatus,
            gamepadIsOn,

            forReview, forLearn, difficult, practiceReady           
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
                Next In: {str}
            </h1>
        })();

        const ready = readyQnA.length || false;
        const readyWords = ready && <h1 style={{margin: '0 0.5rem', fontSize: '1.5rem'}}>
            {`${ready} Ready Now`}
        </h1>;

        return <>{alert && <Alert {...alert} />}<div style={{maxWidth: 650, margin: 'auto', padding: '0 0.2rem'}}>
            <div
                style={{ display: 'flex' }}
            >
                <Button
                    shape='flat'
                    type='primary'
                    style={{flex: 1}}
                    size='lg'
                    onClick={() => this.setState({ modal: 'add-word' })}
                >Add Mem</Button>
                <Button
                    shape='flat'
                    type='info'
                    style={{flex: 1}}
                    size='lg'
                    onClick={() => this.setState({ modal: 'import-words' })}
                >Import Mem</Button>
                <Button
                    shape='flat'
                    type='secondary'
                    style={{flex: 1}}
                    size='lg'
                    onClick={() => this.setState({ modal: 'export-words' })}
                >Export Mem</Button>
                {gamepadIsOn && <Button
                    shape="flat"
                    type="primary"
                    size='lg'
                    onClick={() => {
                        this.setState({ modal: 'gamepad' });
                        store.setState({ gamepadBindingMode: true })
                    }}
                >🎮</Button>}
            </div>

            <div style={{display: 'flex', border: 'solid 1px lightgray'}}>
                <h1 style={{fontSize: 'x-large', textAlign: 'center', flex: 1}}>Stored: {notIntroduced.length}</h1>
                <div style={{borderRight: 'solid 1px lightgray', margin: '0 0.3rem'}}/>
                <h1 style={{fontSize: 'x-large', textAlign: 'center', flex: 1}}>Review: {memorize.length}</h1>
            </div>

            <div style={{
                marginTop: '1rem',
                display: 'flex',
                // justifyContent: 'space-around'
            }}>
                {([
                    [nReadyIn5min, 'In < 5min'],
                    [nReadyIn30min, 'In < 30min'],
                    [nReadyToday, 'Today'],
                ] as const).map(([nReady, t]) => <WordsString {...{nReady, t}}/>) }
            </div>
            <div style={{
                marginTop: '1rem',
                display: 'flex',
                // justifyContent: 'space-around'
            }}>
                {([
                    [nReadyTomorrow, 'Tomorrow'],
                    [nReadyThisWeek, 'This Week'],
                    [nReadyNextWeek, 'Next Week'],
                ] as const).map(([nReady, t]) => <WordsString {...{nReady, t}}/>) }
            </div>

            
                
            <br />
            <div style={{display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
                {nextWordTimer}
                {readyWords}
                {!ready && <Button
                    disabled={!memorize.length}
                    onClick={() => this.setQnA(memorize[0].id)}
                >{memorize.length ? 'Skip Wait' : 'No Mem Added'}</Button>}
            </div>

            <Button
                size="auto"
                type="primary"
                disabled={!notIntroduced.length}
                style={{marginTop: '0.5rem'}}
                onClick={async () => this.setState({ selectedId: await learnNewWord() })}
            >{notIntroduced.length ? 'Learn New Mem' : 'None In Storage'}</Button>

            <div style={{ paddingBottom: "4rem" }}>
                {!!readyQnA.length && <>

                    <QnABtns
                        memIds={forReview}
                        title="Review"
                        setQnA={this.setQnA}
                    />

                    <QnABtns
                        memIds={practiceReady}
                        title="Practice"
                        setQnA={this.setQnA}
                    />

                    <QnABtns
                        memIds={forLearn}
                        title="Learn"
                        setQnA={this.setQnA}
                    />

                    <QnABtns
                        memIds={difficult}
                        title="Difficult"
                        setQnA={this.setQnA}
                    />
                </>}
            </div>

            {user && user !== 'loading' ?
                <div
                    style={{ position: 'fixed', bottom: '0.2rem', right: '0.2rem' }}
                >
                    <Avatar
                        dataState={(isLoading || syncStatus === 'syncing' || syncStatus === 'initialize')? "loading" : "done"}
                        imgSrc={user.imgUrl}
                        size="md"
                        name="Logout"    
                        onClick={async () => {
                            store.setState({ isLoading: true });
                            await wait(1500);

                            const sub = store.stateSub('user', async ({ user }) => {
                                if (!user) {
                                    await wait(0);
                                    this.setState({ isSigningIn: false });
                                    store.setState({ isLoading: false });
                                    sub.unsubscribe();
                                }
                            }, true);
                            
                            store.action({ type: 'LOGOUT' });
                        }}
                    />
                </div>
                
                :

                <Button
                    size="md"
                    type="success"
                    disabled={isSigningIn}
                    onClick={async () => {
                        this.setState({ isSigningIn: true });
                        try {
                            await auth.signIn('google');
                            const sub = store.stateSub('user', async ({ user }) => {
                                if (user) {
                                    await wait(0);
                                    this.setState({ isSigningIn: false });
                                    sub.unsubscribe();
                                }
                            }, true);

                            store.action({ type: 'LOGIN_SUCCESS' });
                        } catch {
                            this.setState({ isSigningIn: false });
                            store.setState({ alert: {
                                type: 'danger',
                                title: 'Failed To Login',
                                text: "Something went wrong please try again",
                                timeoutMs: 7000,
                                onClose: () => store.setState({ alert: null }),
                                style: { position: 'fixed', top: 5, right: 5 }
                            } })
                        }
                    }}
                    className="py-2.5 px-3 rounded-md flex items-center mt-3.5"
                    style={{ position: 'fixed', bottom: '0.2rem', right: '0.2rem' }}
                >
                    {googleLogo}
                    <p className="text-base font-medium ml-4">Login</p>
                </Button>
            }

            <Button
                type='danger'
                size="lg"
                style={{ position: 'fixed', bottom: '0.2rem', left: '0.2rem' }}
                onClick={() => {
                    const yes = confirm(`🗑️ Delete All Mem?`) && confirm(`⚠️⚠️⚠️ ARE YOU SURE?? 🗑️ DELETE ALL?? ⚠️⚠️⚠️`);
                    if (yes) deleteMem('DELETE-ALL');
                }}
            >Reset</Button>
            
            {modal === 'q-n-a' && selectedId && <QnaModal mem={memoryDict[selectedId]} exit={(showNext) => this.setQnA(showNext ? 'NEXT' : null)} />}
            {modal === 'add-word' && <AddWord exit={() => this.setState({ modal: null })} />}
            {modal === 'import-words' && <ImportWordsModal exit={() => this.setState({ modal: null })} />}
            {modal === 'export-words' && <ExportWordsModal exit={() => this.setState({ modal: null })}/>}
            {modal === 'gamepad' && <GamepadMapModal exit={() => {
                this.setState({ modal: null });
                store.setState({ gamepadBindingMode: false })
            }}/>}
        </div></>
    }
});

export const QnABtns = link(({ memoryDict }) => ({ memoryDict }), ({ memoryDict, memIds, setQnA, title }: {
    memIds: string[],
    memoryDict: State['memoryDict'],
    setQnA: (id: string | null) => any,
    title: string
}) => <>
    {memIds.length ? 
        <>
            <div style={{borderTop: 'solid 3px lightgray', paddingTop: '0.3rem'}}></div>
            <h1 style={{fontSize: '1.75rem', textAlign: 'center', marginBottom: '1rem'}}>{title}:</h1>
        </> : null
    }

    {memIds.map(id => {
        const { question } = memoryDict[id];
        return <Button
            style={{ margin: '0.2rem' }}
            shape="flat"
            size='xl'
            onClick={() => setQnA(id)}
        >{question}</Button>
    })}
</>);

const googleLogo = <svg width="19" height="20" viewBox="0 0 19 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.9892 10.1871C18.9892 9.36767 18.9246 8.76973 18.7847 8.14966H9.68848V11.848H15.0277C14.9201 12.767 14.3388 14.1512 13.047 15.0812L13.0289 15.205L15.905 17.4969L16.1042 17.5173C17.9342 15.7789 18.9892 13.221 18.9892 10.1871Z" fill="#4285F4" />
    <path d="M9.68813 19.9314C12.3039 19.9314 14.4999 19.0455 16.1039 17.5174L13.0467 15.0813C12.2286 15.6682 11.1306 16.0779 9.68813 16.0779C7.12612 16.0779 4.95165 14.3395 4.17651 11.9366L4.06289 11.9465L1.07231 14.3273L1.0332 14.4391C2.62638 17.6946 5.89889 19.9314 9.68813 19.9314Z" fill="#34A853" />
    <path d="M4.17667 11.9366C3.97215 11.3165 3.85378 10.6521 3.85378 9.96562C3.85378 9.27905 3.97215 8.6147 4.16591 7.99463L4.1605 7.86257L1.13246 5.44363L1.03339 5.49211C0.37677 6.84302 0 8.36005 0 9.96562C0 11.5712 0.37677 13.0881 1.03339 14.4391L4.17667 11.9366Z" fill="#FBBC05" />
    <path d="M9.68807 3.85336C11.5073 3.85336 12.7344 4.66168 13.4342 5.33718L16.1684 2.59107C14.4892 0.985496 12.3039 0 9.68807 0C5.89885 0 2.62637 2.23672 1.0332 5.49214L4.16573 7.99466C4.95162 5.59183 7.12608 3.85336 9.68807 3.85336Z" fill="#EB4335" />
</svg>

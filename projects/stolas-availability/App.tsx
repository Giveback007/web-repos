import { minAppend, objExtract, objKeyVals, sec, wait } from '@giveback007/util-lib';
import { NavDrawer, TopBar, Button, LoginPage, Alert, AlertProps, Spinner, Avatar, Dropdown, TextInput } from "my-alyce-component-lib";
import React, { Component, createRef, useEffect } from "react";
import { AcctView } from './views/AccountingView';
import { ScrollView } from './views/ScrollView';
import { auth, link, set, State, store } from "./store";
import { getRoomsFromGSheets, readXL } from "./utils";
import logo from './public/stolas-logo.png';
import { Modal } from 'my-alyce-component-lib';
import { GFile, GoogleApis } from './google-api';

const googleLogo = <svg width="19" height="20" viewBox="0 0 19 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.9892 10.1871C18.9892 9.36767 18.9246 8.76973 18.7847 8.14966H9.68848V11.848H15.0277C14.9201 12.767 14.3388 14.1512 13.047 15.0812L13.0289 15.205L15.905 17.4969L16.1042 17.5173C17.9342 15.7789 18.9892 13.221 18.9892 10.1871Z" fill="#4285F4" />
    <path d="M9.68813 19.9314C12.3039 19.9314 14.4999 19.0455 16.1039 17.5174L13.0467 15.0813C12.2286 15.6682 11.1306 16.0779 9.68813 16.0779C7.12612 16.0779 4.95165 14.3395 4.17651 11.9366L4.06289 11.9465L1.07231 14.3273L1.0332 14.4391C2.62638 17.6946 5.89889 19.9314 9.68813 19.9314Z" fill="#34A853" />
    <path d="M4.17667 11.9366C3.97215 11.3165 3.85378 10.6521 3.85378 9.96562C3.85378 9.27905 3.97215 8.6147 4.16591 7.99463L4.1605 7.86257L1.13246 5.44363L1.03339 5.49211C0.37677 6.84302 0 8.36005 0 9.96562C0 11.5712 0.37677 13.0881 1.03339 14.4391L4.17667 11.9366Z" fill="#FBBC05" />
    <path d="M9.68807 3.85336C11.5073 3.85336 12.7344 4.66168 13.4342 5.33718L16.1684 2.59107C14.4892 0.985496 12.3039 0 9.68807 0C5.89885 0 2.62637 2.23672 1.0332 5.49214L4.16573 7.99466C4.95162 5.59183 7.12608 3.85336 9.68807 3.85336Z" fill="#EB4335" />
</svg>

type S = {
    isSigningIn: boolean;
    navOpen: boolean;
    tab: 'scroll' | 'accounting';
    modal: 'xl-add' | null;
}

export const App = link(s => objExtract(s, ['selectedMonth', 'selectedRoom', 'rooms', 'roomTypes', 'user', 'isLoading', 'alert']),
class extends Component<Pick<State, 'selectedMonth' | 'selectedRoom' | 'rooms' | 'roomTypes' | 'user' | 'isLoading' | 'alert'>, S> {
    state: S = {
        isSigningIn: true,
        navOpen: false, // !!store.getState().rooms.length,
        tab: 'scroll',
        modal: null,
    }

    fileUpldRef = createRef<HTMLInputElement>();

    componentDidMount = async () => {
        const res = await auth.refresh();
        if (res.type == 'success') store.action({ type: 'LOGIN_SUCCESS' });

        const id = store.getState().googleSheetId;
        if (id) {
            const res = await getRoomsFromGSheets(id);
            if (!res.isSuccess) this.setState({ modal: 'xl-add' });

            store.setState({
                rooms: res.rooms || [],
                googleSheetId: res.isSuccess ? id : null,
            });
        } else {
            this.setState({ modal: 'xl-add' });
        }

        store.setState({ isLoading: false });
        this.setState({ isSigningIn: false });
    }

    handleRoomClick = (rm: Room) => {
        store.setState({ selectedRoom: rm.roomName });
        this.setState({ navOpen: false });
    }

    signOut = async () => {
        const sub = store.stateSub('user', async ({ user }) => {
            if (!user) {
                await wait(0);
                this.setState({ isSigningIn: false });
                store.setState({ isLoading: false });
                sub.unsubscribe();
            }
        }, true);

        store.setState({ isLoading: true });
        store.action({ type: 'LOGOUT' });
    }

    render() {
        const { selectedMonth, selectedRoom, rooms, roomTypes, user, isLoading, ...p } = this.props;
        const { navOpen, tab, isSigningIn, modal } = this.state;
        
        const m = new Date(set.nowYM.y, set.nowYM.m + selectedMonth, 1);

        const navItems: any[] = [];
        if (roomTypes) objKeyVals(roomTypes).map(({key, val}, i) => {
            if (i) navItems.push({type: 'break'});

            navItems.push(
                {type: 'section', title: key },
                ...val.map(r => ({
                    type: 'action',
                    title: r.roomName + '',
                    onClick: () => this.handleRoomClick(r),
                    isActive: r.roomName === selectedRoom
                }))
            );
        });

        return <>{p.alert && <Alert {...p.alert} />}{isLoading ? <Loader /> : user && user !== 'loading' ? <>
            
            {modal === 'xl-add' && <XlSearch onClose={() => this.setState({ modal: null })} />}
            <TopBar
                addSpacer
                fixed
                style={{maxWidth: '100vw'}}
                className='top-bar'
                menuIsExpanded={navOpen}
                onMenuExpand={() => this.setState({ navOpen: !navOpen })}
                leftNavItems={rooms.length ? [{
                    children: <Button
                        type='primary'
                        outline={tab !== 'scroll'}
                    >Mnth</Button>,
                    onClick: () => this.setState({ tab: 'scroll' })
                },
                // {
                //     children: <Button
                //         type='primary'
                //         outline={tab !== 'calendar'}
                //     >Cal</Button>,
                //     onClick: () => this.setState({ tab: 'calendar' })
                // },
                {
                    children: <Button
                        type='primary'
                        outline={tab !== 'accounting'}
                    >Acct</Button>,
                    onClick: () => this.setState({ tab: 'accounting' })
                }] : []}
                rightNavItems={[{
                    children: <Dropdown
                        header={<div className="bg-white w-full flex flex-row p-2 text-gray-700">
                            <Avatar dataState="done" imgSrc={user.imgUrl} size="sm"/>
                            <div className="flex flex-col"><div>{user.name}</div><div>{user.email}</div></div>
                        </div>}
                        align='right'
                        items={[{
                            type: 'action',
                            title: 'Connect XL',
                            onClick: () => this.setState({ modal: 'xl-add' }),
                        }, {
                            type: 'action',
                            title: 'Sign Out',
                            onClick: this.signOut,
                        }]}
                    ><Avatar
                        dataState="done"
                        imgSrc={user.imgUrl}
                        name={user.name}
                        size="sm"
                    /></Dropdown>,
                    
                    },
                    // {
                    //     children: <Button size='lg' className='upload-btn'>Add XL</Button>,
                    //     onClick: () => {
                    //         this.fileUpldRef.current?.click();
                    //         const sub = store.stateSub('rooms', ({ rooms }) => {
                    //             if (rooms.length) {
                    //                 this.setState({ navOpen: true });
                    //                 sub.unsubscribe();
                    //             }
                    //         })
                    //     },
                    // }
                ]}
                centerContent={<div className='center-content'>
                    {/* <h1 className='xl-time'>{p.uploadTime ?
                        `XL Added ${genSimplifiedTime(p.uploadTime)}`
                        :
                        'No Data, Please Upload XL'
                    }</h1> */}
                    {/* <Button type='primary' size='auto' onClick={() => this.setState({ navOpen: true })}>Select Room</Button> */}
                    <Button
                        type='info'
                        size='lg'
                        onClick={() => this.setState({ navOpen: true })}
                        // style={{ fontSize: 'large' }}
                    >
                        {selectedRoom ? `Rm: ${selectedRoom}` : 'Select Room'}
                    </Button>
                    {/* {selectedRoom ? <h1 style={{ fontWeight: 'bold' }}>{selectedRoom}</h1>} */}
                </div>}
            />

            <NavDrawer
                className='nav-drawer'
                fixed={'left'}
                brand="Stolas Rooms"
                menuItems={navItems}
                isOpen={navOpen}
                onBackdropClick={() => this.setState({ navOpen: false })}
            />

            {rooms.length ? <>
                <div id="month-selector">
                    <Button
                        shape='flat'
                        onClick={() => store.setState({ selectedMonth: selectedMonth - 1 })}
                    >◄</Button>
                    <input
                        type="month"
                        value={`${m.getFullYear()}-${minAppend(m.getMonth() + 1, 2)}`}
                        onChange={(e) => {
                            const [y, _m] = e.target.value.split('-').map(s => Number(s));
                            const selectedMonth = (y * 12 + _m - 1) - (set.nowYM.y * 12 + set.nowYM.m);
                            
                            store.setState({ selectedMonth });
                        }}
                    />
                    {/* <h1>{minAppend(m.getMonth() + 1, 2)}/{m.getFullYear()}</h1> */}
                    <Button
                        shape='flat'
                        onClick={() => store.setState({ selectedMonth: selectedMonth + 1 })}
                    >►</Button>
                </div>

                {/* {tab === 'calendar' && <CalendarView {...{selectedMonth, selectedRoom}} />} */}
                {tab === 'scroll' && <ScrollView />}
                {tab === 'accounting' && <AcctView />}

            </> : <h1 style={{fontSize: 'xx-large', textAlign: 'center'}}>Please Add XL Data</h1>}
            
            <div style={{height: 45, width: '100%'}}/>

            {/* <input
                type="file"
                hidden
                ref={this.fileUpldRef}
                onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return alert("Error: Uploading File");

                    const rooms = await readXL(file);
                    store.setState({ rooms, uploadTime: Date.now(), selectedRoom: null });
                }}
            /> */}
        </> : <>
            <LoginPage
                companyName='Stolas Availability'
                brand={<img src={logo} className='max-w-xs px-5 mb-14 w-full' />}
                isLoading={isSigningIn}
                gradient={1}
                bgGradientFrom='slate'
                bgGradientTo='blue'
                style={{minHeight: '100vh'}}
                thirdPartyLogins={[{ name: 'Google', logo: googleLogo, onClick: async () => {
                    this.setState({ isSigningIn: true });
                    try {
                        await auth.signIn('google');
                        store.action({ type: 'LOGIN_SUCCESS' });
                    } catch {
                        store.setState({ alert: {
                            type: 'danger',
                            title: 'Failed To Login',
                            text: "Something went wrong please try again",
                            timeoutMs: 7000,
                            onClose: () => store.setState({ alert: null }),
                            style: { position: 'fixed', top: 5, right: 5 }
                        } })
                    }
                    
                    this.setState({ isSigningIn: false });
                } },]}
            />
        </>}</>;
    }
});



const Loader = () => <div
    style={{
        position: 'fixed',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
    }}
><Spinner size='lg'/></div>;

class XlSearch extends Component<{ onClose: () => any }> {
    state = {
        search: 'availability',
        files: 'loading' as (GFile[] | 'loading'),
    }

    search = async () => {
        this.setState({ files: 'loading' });
        const { files } = await new GoogleApis().searchXL(this.state.search);
        
        this.setState({ files });
    }

    xlClick = async ({ id }: GFile) => {
        const { files } = this.state;
        this.setState({ files: 'loading' });
        await store.setState({ rooms: [] });
        
        const res = await getRoomsFromGSheets(id);
        
        if (res.isSuccess)
            this.props.onClose();
        else
            this.setState({ files });

        return store.setState({
            rooms: res.rooms || [],
            googleSheetId: res.isSuccess ? id : null,
        });
    }

    componentDidMount = () => this.search();

    render() {
        const { onClose } = this.props;
        const { files, search } = this.state;

        return <Modal
            onClose={onClose}
            header='Select Availability Doc'
            style={{ maxHeight: '95vh' }}
        >
            <TextInput
                button={{
                    label: 'Submit',
                    onClick: this.search,
                    outline: false,
                    type: 'primary'
                }}
                label="Search:"
                labelType="addon"
                placeholder="Search For XL Doc in G-Drive"
                onChange={(e) => this.setState({search: (e.target as HTMLInputElement).value || ''})}
                value={search}
            />

            <div style={{ display: 'flex', flexDirection: 'column', margin: '20px 0' }}>
                {files === 'loading' ?
                    <div style={{ display: 'flex', justifyContent: 'center' }}><Spinner size='lg'/></div>
                    :
                    files.length ? files.map(f => <Button
                        type='info'
                        size='lg'
                        style={{ marginTop: 7.5 }}
                        onClick={() => this.xlClick(f)}
                    >{f.name}</Button>) : 'No Files'
                }
            </div>
        </Modal>
    }
}


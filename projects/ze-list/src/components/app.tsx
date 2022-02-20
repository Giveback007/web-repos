import { objExtract } from "@giveback007/util-lib";
import { Accordion, Button, NavDrawer, TopBar } from "my-alyce-component-lib";
import React, { useState } from "react";
import { link, nextItem, store } from "../store/store";
import { scramble, TextItems } from "../utils/utils";
import { AccordionContent } from "./accordion-content";
import { AddTextModal, MaxTimeModal, TotalTimeModal } from "./modals";
import { Timer } from "./timer";

export const App = link((s) => objExtract(s, [
    'doScramble', 'doSpeak', 'items',
    'autoNext', 'selectedItem', 'addTextModal',
    'maxTimeModal', 'totalTimeModal'
]), (p: {
    items: TextItems; doScramble: boolean; doSpeak: boolean;
    autoNext: boolean; selectedItem: number; addTextModal: boolean;
    maxTimeModal: boolean; totalTimeModal: boolean;
}) => {
    const [drawerOpen, setDrawerOpen] = useState(false);

    return <div className='bg-gray-100 min-h-screen pb-[100vh]'>
        <TopBar 
            fixed
            addSpacer
            zIndex={1000}
            onMenuExpand={() => setDrawerOpen(!drawerOpen)}
            menuIsExpanded={drawerOpen}
            centerContent={<Timer />}
            rightNavItems={[{
                children: <Button
                    type='info'
                    shape='flat'
                    size='lg'
                    disabled={!p.items.length}
                >Next</Button>,
                onClick: nextItem
            }]}
        />

        <NavDrawer
            fixed='left'
            isOpen={drawerOpen}
            onBackdropClick={() => setDrawerOpen(false)}
            zIndex={1002}
            className='p-4'
            menuItems={[
                {
                    type: 'action',
                    title: <Button
                        type={p.doScramble ? 'success' : 'secondary'}
                        outline={!p.doScramble}
                        shape='flat'
                        className='h-16 w-full mb-2'
                        onClick={() => store.toggle('doScramble')}
                    >Scramble</Button>,
                }, { 
                    type: 'action',
                    title: <Button
                        onClick={() => store.toggle('doSpeak')}
                        type={p.doSpeak ? 'success' : 'secondary'}
                        outline={!p.doSpeak}
                        shape='flat'
                        className='h-16 w-full mb-2'
                    >Speak</Button>,
                }, { 
                    type: 'action',
                    title: <Button
                        onClick={() => store.toggle('autoNext')}
                        type={p.autoNext ? 'success' : 'secondary'}
                        outline={!p.autoNext}
                        disabled={!p.items.length}
                        shape='flat'
                        className='h-16 w-full mb-2'
                    >Auto Next</Button>,
                }, {
                    type: 'break'
                }, { 
                    type: 'action',
                    title: <Button
                        onClick={() => store.toggle('addTextModal')}
                        type='primary'
                        shape='flat'
                        className='h-16 w-full my-2'
                    >Add Text</Button>,
                }, { 
                    type: 'action',
                    title: <Button
                        onClick={() => store.toggle('maxTimeModal')}
                        type='primary'
                        shape='flat'
                        className='h-16 w-full mb-2'
                    >Time Per Item</Button>,
                }, { 
                    type: 'action',
                    title: <Button
                        onClick={() => store.toggle('totalTimeModal')}
                        type='primary'
                        shape='flat'
                        className='h-16 w-full mb-2'
                    >Total Time</Button>,
                },
            ]}
        />

        {p.addTextModal && <AddTextModal />}
        {p.maxTimeModal && <MaxTimeModal />}
        {p.totalTimeModal && <TotalTimeModal />}

        <Accordion
            type='info'
            className='m-auto'
            style={{width: '92%'}}
            items={p.items.map((x, i) => ({
                title: x.symbol + ' - ' + (p.doScramble ? scramble(x.title) : x.title),
                content: <AccordionContent details={x.details} id={x.id} />,
                isOpen: p.selectedItem === i,
                onClick: () => nextItem(p.selectedItem === i ? -1 : i),
            }))}
        />
    </div>
});
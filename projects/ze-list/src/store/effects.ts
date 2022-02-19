import { interval, sec, wait } from "@giveback007/util-lib";
import { cst, nextItem, store } from "./store";
import ding = require('../assets/ding.mp3');
import { speaker } from "./speaker";
import { playAudio, TextItems } from "../utils/utils";

/** Manage speaker based on `selectedItem` */
export const speakerEffect = () => store.stateSub(
    ['selectedItem', 'doSpeak'], async (s) => {
    const i = s.selectedItem;
    const item = s.items[i];

    if (!s.doSpeak || !item) {
        store.setState({ currentItemReading: null })
        return speaker.cancel();
    };

    await speaker.setReadingList(item.details);
    speaker.readList();
});

/** Trigger scroll event when `selectedItem` changed */
export const scrollEffect = () => store.stateSub('selectedItem', async (s, prev) => {
    if (prev?.selectedItem !== s.selectedItem && s.selectedItem > -1) {
        await wait(0);
        const item: TextItems[0] | undefined = s.items[s.selectedItem];
        const el = document.getElementsByClassName(item.id)[0];
        if (!el) throw new Error(`This isn't suppose to happen!`);
        const target: any = el.parentElement?.parentElement?.getElementsByTagName('H2')[0];
        if (!target) throw new Error(`This isn't suppose to happen!`);

        setTimeout(() => scrollTo(0, target.offsetTop - 110), 700);
    }
});

/** 
 * Timer effect, uses interval to update `timeNow` every second
 * & ding when timeNow >= timePerItem
*/
export const timeNowEffect = () => {
    const sub = store.stateSub(['selectedItem'], (s) => {
        const obj = s.selectedItem === -1 ?
            { startTime: cst.appStartTime, doDingForTime: false }
            :
            { startTime: Date.now(), doDingForTime: true }

        /** Start time to app start when no item selected */
        store.setState({ ...obj, timeNow: Date.now() })
    });

    let stop = false;
    const run = async () => {
        if (stop) return;

        const {
            timePerItem, doDingForTime, timeNow,
            startTime, autoNext, items, selectedItem
        } = await store.setState({ timeNow: Date.now() });
        const overTime = timeNow - startTime >= timePerItem;
        const maxIdx = items.length - 1;

        /** Play ding on condition */
        if (overTime) {
            store.setState({ doDingForTime: false });

            if (doDingForTime) {
                if (maxIdx < selectedItem + 1) {
                    store.setState({ didFinish: true });
                    speaker.cancel();

                    for (let i = 0; i < 3; i++) {
                        playAudio(ding, 0.07);
                        await wait(sec(2));
                    }
                    await wait(sec(10));
                } else {
                    playAudio(ding, 0.07);
                }
            }

            if (autoNext) nextItem();
        }

        await wait(1000);
        run();
    }

    interval((_, stopFct) => {
        if (stop) return stopFct();
        store.setState({ timeNow: Date.now() });
    }, 500);

    run();
    return { 
        unsubscribe: () => {
            stop = true;
            return sub.unsubscribe();
        }
    };
}

/** Play next if none selected && autoNext */
export const autoNextEffect = () => store.stateSub(
    'autoNext',
    (s) => {
        if (!s.items.length) {
            store.setState({ autoNext: false })
        } else if (s.selectedItem === -1 && s.autoNext) {
            nextItem()
        }
    }, true
);

/** Manage authentication actions */
// export const authEffect = () => store.actionSub(['login', 'login-refresh'], async (a) => {
//     switch (a.type) {
//         case 'login-refresh':
//             store.setState({ currentUser: 'loading' })
//             const res = await auth.refresh();
//             let currentUser: gapi.auth2.BasicProfile | null = null;
//             if (res.type === 'success') currentUser = res.googleUser.getBasicProfile();

//             store.setState({ currentUser });
//             break;
//         case 'login':
//             store.setState({ currentUser: 'loading' });

//             try {
//                 const user = await auth.signIn('google');
//                 store.setState({ currentUser: user.getBasicProfile() });
//             } catch {
//                 store.setState({ currentUser: null });
//             }

//             break;
//         default: break;
//     }
// });
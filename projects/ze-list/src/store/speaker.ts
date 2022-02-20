import { interval } from "@giveback007/util-lib";
import { store } from "./store";
import type { Detail } from "../utils/utils";
import { wait } from "exercise-counter/libs/utils";

class Speaker {
    private doRead = false;
    private readingList: Detail[] = [];
  
    async setReadingList(list: Detail[]) {
        await this.cancel();
        this.readingList = list;
    }
  
    async cancel() {
        this.doRead = false;
        // speechSynthesis.pause();
        speechSynthesis.cancel();
        return new Promise((res) => {
            const itv = interval(() => {
                if (!speechSynthesis.speaking) {
                    itv.stop();
                    res(void(0));
                }
            }, 100);
        })
    }
  
    async readList() {
        this.doRead = false;
        await this.cancel();
  
        this.doRead = true;
  
        for (let i = 0; i < this.readingList.length; i++) {
            if (!this.doRead) return;
            await this.readItem(i);
        }
  
        this.doRead = false
    }
  
    async readItem(i: number) {
        const item = this.readingList[i];
  
        const utterance = new SpeechSynthesisUtterance(item.text);
        speechSynthesis.speak(utterance);
  
        store.setState({ currentItemReading: item });
        await new Promise((res) => {
            const onEnd = () => {
                utterance.removeEventListener('end', onEnd);
                res(void(0))
            };

            utterance.addEventListener('end', onEnd);
        });
    }
}

/** Single instance of speaker */
export const speaker = new Speaker();
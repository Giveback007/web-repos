import { GiSpeaker, GiSpeakerOff } from 'react-icons/gi'
import { BiBluetooth } from 'react-icons/bi'
import { AiOutlineDown, AiOutlineUp, AiOutlineCheck,  } from 'react-icons/ai';
import { clone, isType, min, minAppend, sec, wait, msToTime, average, arrLast } from '@giveback007/util-lib';
import { StateManager, stateManagerReactLinker } from '@giveback007/browser-utils';
// import { SmoothieChart, TimeSeries } from "smoothie";
import * as React from 'react';
// improved heart - rate component
import "./heart-rate.sass";
import dingSound from './ding.mp3';
import { HrChart } from './heart-rate-chart';
import { appConsts, HR } from './store';

/** ms seconds to starts from */
export function timeSma(data: HR[], ms: number, round = false) {
  const len = data.length;
  if (!len) return 0;

  const fromTime = data[len - 1].time - ms;
  const ratio = ratioFromTime(data, fromTime);
  return round ? Math.round(ratio) : ratio;
}

/** From unix ms time */
export function ratioFromTime(data: HR[], fromTime: number) {
  const x: HR[] = [];

  let i = data.length - 1;
  while (i > 0 && data[i].time >= fromTime) {
    x.push(data[i]);
    i--;
  }

  return average(x.map(y => y.hr)) || 0;
}

type State = {
  doSpeak: boolean;
  /** If to announce hr when staying on target */
  intermHrSpeak: boolean;
  lowerLimit: { n: number; edit: boolean };
  upperLimit: { n: number; edit: boolean };
};

const store = new StateManager<State>({
  doSpeak: true,
  intermHrSpeak: true,
  upperLimit: { n: 150, edit: false },
  lowerLimit: { n: 130, edit: false },
}, { id: 'main-app:heart-rate-v1' });

type P = State;

type S = {
  data: HR[];
  lastVal: HR | null;
  btStatus: "connecting" | "on" | "off";
  timeStart: number | null;
  timeNow: number;
  min1Avg: HR[];
  min5Avg: HR[];
  min15Avg: HR[];
};

const speak = async (lastVal: number, extra: string | string[] = "") => {
  if (extra) {
    extra = isType(extra, "string") ? [extra as string] : extra;
    extra.forEach(x => {
      const utter = new SpeechSynthesisUtterance(x);
      window.speechSynthesis.speak(utter);
    });
  }

  let txt = lastVal + "";
  if (lastVal > 100) {
    if (lastVal < 110) txt = `${txt[0]} o ${txt[2]}`;
    else txt = txt[0] + " " + txt.slice(1);
  }
  const utter = new SpeechSynthesisUtterance(txt);
  window.speechSynthesis.speak(utter);
};

class HeartRate extends React.Component<P, S> {

  state: S = {
    data: [],
    lastVal: null,
    btStatus: "off",
    timeStart: null,
    timeNow: Date.now(),
    min1Avg: [],
    min5Avg: [],
    min15Avg: [],
    // doSpeak: true,
    // upperLimit: { n: 150, edit: false },
    // lowerLimit: { n: 130, edit: false },
  }

  upperRef = React.createRef<HTMLInputElement>();
  lowerRef = React.createRef<HTMLInputElement>();

  hrConnect = async () => {
    // check if the auto connect feature is implemented
    // https://docs.google.com/document/d/1RF4D-60cQJWR1LoQeLBxxigrxJwYS8nLOE0qWmBF1eo/edit
    if (!appConsts.device) appConsts.device = await navigator.bluetooth.requestDevice({
      filters: [{ services: ["heart_rate"] }],
      acceptAllDevices: false
    });

    const { device } = appConsts;

    this.setState({ btStatus: 'connecting' });

    if (!device.gatt)
      return log("FAILED TO CONNECT!");

    const server = await device.gatt.connect();
    const service = await server.getPrimaryService("heart_rate");
    const char = await service.getCharacteristic("heart_rate_measurement");
    this.setState({ btStatus: 'on', timeStart: Date.now(), timeNow: Date.now() });

    char.oncharacteristicvaluechanged = (e) => {
      const s = this.state;
      const target = e.target as BluetoothRemoteGATTCharacteristic;
      const lastVal: HR = { time: Date.now(), hr: target.value?.getUint8(1) || 0 };
      
      if (!lastVal.hr) return;

      if (s.data.length) {
        const time = arrLast(s.data).time;
        this.setState({
          min1Avg: [...s.min1Avg, { time, hr: timeSma(s.data, min(1), true) }],
          min5Avg: [...s.min5Avg, { time, hr: timeSma(s.data, min(5), true) }],
          min15Avg: [...s.min15Avg, { time, hr: timeSma(s.data, min(15), true) }],
          timeNow: time,
        })
      }

      this.setState({ data: [...this.state.data, lastVal], lastVal });
    };

    char.startNotifications();
  }

  upDown = (type: "lowerLimit" | "upperLimit") => {
    const p = this.props;
    const l = clone(p.lowerLimit);
    const u = clone(p.upperLimit);

    if (type === 'upperLimit' && p.upperLimit.edit) {
      u.edit = false;
      this.upperLimit = false;
      if (u.n < l.n) l.n = u.n - 5;
    } else if (type === 'lowerLimit' && p.lowerLimit.edit) {
      l.edit = false;
      this.lowerLimit = false;
      if (l.n > u.n) u.n = l.n + 5;
    } else if (type === "upperLimit") {
      l.n += 5;
      u.n += 5;
    } else {
      u.n -= 5;
      l.n -= 5;
    }

    store.setState({ lowerLimit: l, upperLimit: u })
  };

  lowerLimit = false;
  upperLimit = false;
  hrInput(type: "lowerLimit" | "upperLimit") {
    const p = this.props;
    const { edit, n } = p[type];

    // if not in edit more return regular text
    if (!edit) return <div
      className={`hr-input ${type}`}
      onClick={() => store.setState({ [type]: { n, edit: true } })}
    ><span>{n}</span></div>;

    // else go into input mode
    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      store.setState({ [type]: { n: Number(e.target.value), edit: true } });
    }

    const ref = type === 'lowerLimit' ? this.lowerRef : this.upperRef;

    const input = <input
      className={`hr-input ${type}`}
      ref={ref}
      autoFocus={true}
      type="number"
      min="0"
      value={p[type].n}
      onChange={handleInput}
      onKeyDown={(x) => x.key === 'Enter' ? this.upDown(type) : null}
    />

    if (!this[type]) wait(0).then(() => {
      this[type] = true;
      const el = ref.current
      if (!el) return;
      el.select();
      el.focus();
    });

    return input;
  };

  lastMsg: 'On Target' | 'Speed Up' | 'Slow Down' | null = null;
  msgTime = Date.now()
  speaker = () => {
    const updateVals = () => {
      const s = this.state;
      const p = this.props;

      val = s.lastVal?.hr || 0;
      l = p.lowerLimit.n;
      u = p.upperLimit.n;
      doSpeak = p.doSpeak;
      intermSpeak = p.intermHrSpeak;
    }

    let val: number = 0;
    let l: number = 0;
    let u: number = 0;
    let doSpeak: boolean = false;
    let intermSpeak: boolean = false;

    updateVals();
    if (!doSpeak) return window.speechSynthesis.cancel();
    if (!val) return;

    const newMsg = async (msg?: HeartRate['lastMsg']) => {
      this.msgTime = Date.now();
      if (!msg) return speak(val);

      if (msg === 'On Target') {
        new Audio(dingSound).play();
        await wait(350);
      }

      window.speechSynthesis.cancel();
      this.lastMsg = msg;
      return speak(val, msg);
    }
    
    const { lastMsg: lMsg, msgTime: msgT } = this;

    if     ((lMsg !== 'Slow Down' || msgT + sec(20) < Date.now()) && val > u) newMsg('Slow Down')
    else if ((lMsg !== 'Speed Up' || msgT + sec(20) < Date.now()) && val < l) newMsg('Speed Up')

    // if hr decreasing && near 20% lowerLimit announce HR
    // if hr increasing && near 20% upperLimit announce HR

    else if (msgT + sec(7) && lMsg !== 'On Target' && val <= u && val >= l) newMsg('On Target')
    else if (intermSpeak && (msgT + sec(45) < Date.now())) newMsg();
  }

  componentDidMount() {
    if (appConsts.device) this.hrConnect();
  }

  render() {
    const s = this.state;
    const p = this.props;

    if (p.doSpeak) this.speaker();
    let head: JSX.Element;

    if (s.btStatus === 'off') head = <>
      <div id="bt-connect">
        <button className="btn" onClick={() =>
          this.hrConnect().catch(() =>
            this.setState({ btStatus: "off" })
          )}
        >
          <BiBluetooth/> Connect
        </button>
      </div>
    </>

    else if (s.btStatus === 'connecting')
      head = <h2>Connecting...</h2>

    else if (s.btStatus === 'on' && !s.data.length)
      head = <h2>Reading...</h2>

    else {
      const hr = s.lastVal?.hr || 0;
      
      head = <>
        <h2>
          {hr > p.upperLimit.n ? '💛' : hr < p.lowerLimit.n ? '💙' : '💚'} {hr}
        </h2>
      </>;
    }

    const f = (arr: HR[]) =>
      minAppend(arr.length ? arrLast(arr).hr : 0, 3, ' ').split('').map(x => x === ' ' ? <>&nbsp;</> : x);

    // time start
    const ts = s.timeStart || 0;
    // time elapsed
    const te = ts ? (s.timeNow - ts) : 0;

    let { h, m, s: sc } = msToTime(te, true);

    return <div id="heart-rate">
      <button
        id="toggle-speak"
        className={"btn btn-" + (p.doSpeak ? "success" : 'error')}
        onClick={() => store.toggle('doSpeak')}
      >{p.doSpeak ? <GiSpeaker/> : <GiSpeakerOff/>}</button>

      <button
        id="toggle-interm-speak"
        className={"btn btn-" + (p.intermHrSpeak ? "success" : 'error')}
        onClick={() => store.toggle('intermHrSpeak')}
      >T</button>

      {/* <div id="hr-component">
        
      </div> */}

      <div id="hr-up-low">
        <div id="hr-head">{head}</div>
        {<button
          className="btn btn-primary"
          onClick={() => this.upDown('upperLimit')}
        >
          {p.upperLimit.edit ? <AiOutlineCheck /> : <AiOutlineUp />}
        </button>}
        {this.hrInput("upperLimit")}
        {this.hrInput("lowerLimit")}
        {<button
          className="btn btn-primary"
          onClick={() => this.upDown('lowerLimit')}
        >{p.lowerLimit.edit ? <AiOutlineCheck /> : <AiOutlineDown />}
        </button>}
      </div>

      <h4>1m: {f(s.min1Avg)} | 5m: {te > min(1) ? f(s.min5Avg) : '---'} | 15m: {te > min(5) ? f(s.min15Avg) : '---'}</h4>
      <h3>{`${minAppend(h, 2)}:${minAppend(m, 2)}:${minAppend(sc, 2)}`}</h3>

      <HrChart
        hrNow={s.lastVal}
        min1Avg={arrLast(s.min1Avg)}
        min5Avg={arrLast(s.min5Avg)}
        min15Avg={arrLast(s.min15Avg)}
        showGraph={true}
        timeNow={s.timeNow}
      />
    </div>
  }
}

export default stateManagerReactLinker(store)((s) => s, HeartRate);

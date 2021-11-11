"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RPTimer = void 0;
const irq_1 = require("../irq");
const peripheral_1 = require("./peripheral");
const TIMEHR = 0x08;
const TIMELR = 0x0c;
const TIMERAWH = 0x24;
const TIMERAWL = 0x28;
const ALARM0 = 0x10;
const ALARM1 = 0x14;
const ALARM2 = 0x18;
const ALARM3 = 0x1c;
const ARMED = 0x20;
const PAUSE = 0x30;
const INTR = 0x34;
const INTE = 0x38;
const INTF = 0x3c;
const INTS = 0x40;
const ALARM_0 = 1 << 0;
const ALARM_1 = 1 << 1;
const ALARM_2 = 1 << 2;
const ALARM_3 = 1 << 3;
const timerInterrupts = [irq_1.IRQ.TIMER_0, irq_1.IRQ.TIMER_1, irq_1.IRQ.TIMER_2, irq_1.IRQ.TIMER_3];
class RPTimerAlarm {
    constructor(name, bitValue) {
        this.name = name;
        this.bitValue = bitValue;
        this.armed = false;
        this.targetMicros = 0;
        this.timer = null;
    }
}
class RPTimer extends peripheral_1.BasePeripheral {
    constructor(rp2040, name) {
        super(rp2040, name);
        this.latchedTimeHigh = 0;
        this.alarms = [
            new RPTimerAlarm('Alarm 0', ALARM_0),
            new RPTimerAlarm('Alarm 1', ALARM_1),
            new RPTimerAlarm('Alarm 2', ALARM_2),
            new RPTimerAlarm('Alarm 3', ALARM_3),
        ];
        this.intRaw = 0;
        this.intEnable = 0;
        this.intForce = 0;
        this.paused = false;
        this.clock = rp2040.clock;
    }
    get intStatus() {
        return (this.intRaw & this.intEnable) | this.intForce;
    }
    readUint32(offset) {
        const time = this.clock.micros;
        switch (offset) {
            case TIMEHR:
                return this.latchedTimeHigh;
            case TIMELR:
                this.latchedTimeHigh = Math.floor(time / Math.pow(2, 32));
                return time >>> 0;
            case TIMERAWH:
                return Math.floor(time / Math.pow(2, 32));
            case TIMERAWL:
                return time >>> 0;
            case ALARM0:
                return this.alarms[0].targetMicros;
            case ALARM1:
                return this.alarms[1].targetMicros;
            case ALARM2:
                return this.alarms[2].targetMicros;
            case ALARM3:
                return this.alarms[3].targetMicros;
            case PAUSE:
                return this.paused ? 1 : 0;
            case INTR:
                return this.intRaw;
            case INTE:
                return this.intEnable;
            case INTF:
                return this.intForce;
            case INTS:
                return this.intStatus;
            case ARMED:
                return ((this.alarms[0].armed ? this.alarms[0].bitValue : 0) |
                    (this.alarms[1].armed ? this.alarms[1].bitValue : 0) |
                    (this.alarms[2].armed ? this.alarms[2].bitValue : 0) |
                    (this.alarms[3].armed ? this.alarms[3].bitValue : 0));
        }
        return super.readUint32(offset);
    }
    writeUint32(offset, value) {
        switch (offset) {
            case ALARM0:
            case ALARM1:
            case ALARM2:
            case ALARM3: {
                const alarmIndex = (offset - ALARM0) / 4;
                const alarm = this.alarms[alarmIndex];
                const delta = (value - this.clock.micros) >>> 0;
                this.disarmAlarm(alarm);
                alarm.armed = true;
                alarm.targetMicros = value;
                alarm.timer = this.clock.createTimer(delta, () => this.fireAlarm(alarmIndex));
                break;
            }
            case ARMED:
                for (const alarm of this.alarms) {
                    if (this.rawWriteValue & alarm.bitValue) {
                        this.disarmAlarm(alarm);
                    }
                }
                break;
            case PAUSE:
                this.paused = !!(value & 1);
                if (this.paused) {
                    this.warn('Unimplemented Timer Pause');
                }
                // TODO actually pause the timer
                break;
            case INTR:
                this.intRaw &= ~this.rawWriteValue;
                this.checkInterrupts();
                break;
            case INTE:
                this.intEnable = value & 0xf;
                this.checkInterrupts();
                break;
            case INTF:
                this.intForce = value & 0xf;
                this.checkInterrupts();
                break;
            default:
                super.writeUint32(offset, value);
        }
    }
    fireAlarm(index) {
        const alarm = this.alarms[index];
        this.disarmAlarm(alarm);
        this.intRaw |= alarm.bitValue;
        this.checkInterrupts();
    }
    checkInterrupts() {
        const { intStatus } = this;
        for (let i = 0; i < this.alarms.length; i++) {
            this.rp2040.setInterrupt(timerInterrupts[i], !!(intStatus & (1 << i)));
        }
    }
    disarmAlarm(alarm) {
        if (alarm.timer) {
            this.clock.deleteTimer(alarm.timer);
            alarm.timer = null;
        }
        alarm.armed = false;
    }
}
exports.RPTimer = RPTimer;

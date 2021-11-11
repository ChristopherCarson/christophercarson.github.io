import { BasePeripheral } from './peripheral.js';
const RTC_CTRL = 0x0c;
const IRQ_SETUP_0 = 0x10;
const RTC_ACTIVE_BITS = 0x2;
export class RP2040RTC extends BasePeripheral {
    constructor() {
        super(...arguments);
        this.running = true;
    }
    readUint32(offset) {
        switch (offset) {
            case RTC_CTRL:
                return this.running ? RTC_ACTIVE_BITS : 0;
            case IRQ_SETUP_0:
                return 0;
        }
        return super.readUint32(offset);
    }
    writeUint32(offset, value) {
        switch (offset) {
            case RTC_CTRL:
                this.running = value > 0; // TODO consult the datasheet
                break;
            default:
                super.writeUint32(offset, value);
        }
    }
}

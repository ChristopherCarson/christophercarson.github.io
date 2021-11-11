import { WaitType } from './peripherals/pio.js';
export var GPIOPinState;
(function (GPIOPinState) {
    GPIOPinState[GPIOPinState["Low"] = 0] = "Low";
    GPIOPinState[GPIOPinState["High"] = 1] = "High";
    GPIOPinState[GPIOPinState["Input"] = 2] = "Input";
    GPIOPinState[GPIOPinState["InputPullUp"] = 3] = "InputPullUp";
    GPIOPinState[GPIOPinState["InputPullDown"] = 4] = "InputPullDown";
})(GPIOPinState || (GPIOPinState = {}));
export const FUNCTION_SIO = 5;
export const FUNCTION_PIO0 = 6;
export const FUNCTION_PIO1 = 7;
function applyOverride(value, overrideType) {
    switch (overrideType) {
        case 0:
            return value;
        case 1:
            return !value;
        case 2:
            return false;
        case 3:
            return true;
    }
    console.error('applyOverride received invalid override type', overrideType);
    return value;
}
const IRQ_EDGE_HIGH = 1 << 3;
const IRQ_EDGE_LOW = 1 << 2;
const IRQ_LEVEL_HIGH = 1 << 1;
const IRQ_LEVEL_LOW = 1 << 0;
export class GPIOPin {
    constructor(rp2040, index, name = index.toString()) {
        this.rp2040 = rp2040;
        this.index = index;
        this.name = name;
        this.rawInputValue = false;
        this.lastValue = this.value;
        this.ctrl = 0x1f;
        this.padValue = 0b0110110;
        this.irqEnableMask = 0;
        this.irqForceMask = 0;
        this.irqStatus = 0;
        this.listeners = new Set();
    }
    get rawInterrupt() {
        return !!((this.irqStatus & this.irqEnableMask) | this.irqForceMask);
    }
    get isSlewFast() {
        return !!(this.padValue & 1);
    }
    get schmittEnabled() {
        return !!(this.padValue & 2);
    }
    get pulldownEnabled() {
        return !!(this.padValue & 4);
    }
    get pullupEnabled() {
        return !!(this.padValue & 8);
    }
    get driveStrength() {
        return (this.padValue >> 4) & 0x3;
    }
    get inputEnable() {
        return !!(this.padValue & 0x40);
    }
    get outputDisable() {
        return !!(this.padValue & 0x80);
    }
    get functionSelect() {
        return this.ctrl & 0x1f;
    }
    get outputOverride() {
        return (this.ctrl >> 8) & 0x3;
    }
    get outputEnableOverride() {
        return (this.ctrl >> 12) & 0x3;
    }
    get inputOverride() {
        return (this.ctrl >> 16) & 0x3;
    }
    get irqOverride() {
        return (this.ctrl >> 28) & 0x3;
    }
    get rawOutputEnable() {
        const { index, rp2040, functionSelect } = this;
        const bitmask = 1 << index;
        switch (functionSelect) {
            case FUNCTION_SIO:
                return !!(rp2040.sio.gpioOutputEnable & bitmask);
            case FUNCTION_PIO0:
                return !!(rp2040.pio[0].pinDirections & bitmask);
            case FUNCTION_PIO1:
                return !!(rp2040.pio[1].pinDirections & bitmask);
            default:
                return false;
        }
    }
    get rawOutputValue() {
        const { index, rp2040, functionSelect } = this;
        const bitmask = 1 << index;
        switch (functionSelect) {
            case FUNCTION_SIO:
                return !!(rp2040.sio.gpioValue & bitmask);
            case FUNCTION_PIO0:
                return !!(rp2040.pio[0].pinValues & bitmask);
            case FUNCTION_PIO1:
                return !!(rp2040.pio[1].pinValues & bitmask);
            default:
                return false;
        }
    }
    get inputValue() {
        return applyOverride(this.rawInputValue, this.inputOverride);
    }
    get irqValue() {
        return applyOverride(this.rawInterrupt, this.irqOverride);
    }
    get outputEnable() {
        return applyOverride(this.rawOutputEnable, this.outputEnableOverride);
    }
    get outputValue() {
        return applyOverride(this.rawOutputValue, this.outputOverride);
    }
    /**
     * Returns the STATUS register value for the pin, as outlined in section 2.19.6 of the datasheet
     */
    get status() {
        const irqToProc = this.irqValue ? 1 << 26 : 0;
        const irqFromPad = this.rawInterrupt ? 1 << 24 : 0;
        const inToPeri = this.inputValue ? 1 << 19 : 0;
        const inFromPad = this.rawInputValue ? 1 << 17 : 0;
        const oeToPad = this.outputEnable ? 1 << 13 : 0;
        const oeFromPeri = this.rawOutputEnable ? 1 << 12 : 0;
        const outToPad = this.outputValue ? 1 << 9 : 0;
        const outFromPeri = this.rawOutputValue ? 1 << 8 : 0;
        return (irqToProc | irqFromPad | inToPeri | inFromPad | oeToPad | oeFromPeri | outToPad | outFromPeri);
    }
    get value() {
        if (this.outputEnable) {
            return this.outputValue ? GPIOPinState.High : GPIOPinState.Low;
        }
        else {
            // TODO: check what happens when we enable both pullup/pulldown
            if (this.pulldownEnabled) {
                return GPIOPinState.InputPullDown;
            }
            if (this.pullupEnabled) {
                return GPIOPinState.InputPullUp;
            }
            return GPIOPinState.Input;
        }
    }
    setInputValue(value) {
        this.rawInputValue = value;
        const prevIrqValue = this.irqValue;
        if (value) {
            this.irqStatus |= IRQ_EDGE_HIGH | IRQ_LEVEL_HIGH;
            this.irqStatus &= ~IRQ_LEVEL_LOW;
        }
        else {
            this.irqStatus |= IRQ_EDGE_LOW | IRQ_LEVEL_LOW;
            this.irqStatus &= ~IRQ_LEVEL_HIGH;
        }
        if (this.irqValue !== prevIrqValue) {
            this.rp2040.updateIOInterrupt();
        }
        for (const pio of this.rp2040.pio) {
            for (const machine of pio.machines) {
                if (machine.enabled &&
                    machine.waiting &&
                    machine.waitType === WaitType.Pin &&
                    machine.waitIndex === this.index) {
                    machine.checkWait();
                }
            }
        }
    }
    checkForUpdates() {
        const { lastValue, value } = this;
        if (value !== lastValue) {
            this.lastValue = value;
            for (const listener of this.listeners) {
                listener(value, lastValue);
            }
        }
    }
    updateIRQValue(value) {
        if (value & IRQ_EDGE_LOW && this.irqStatus & IRQ_EDGE_LOW) {
            this.irqStatus &= ~IRQ_EDGE_LOW;
            this.rp2040.updateIOInterrupt();
        }
        if (value & IRQ_EDGE_HIGH && this.irqStatus & IRQ_EDGE_HIGH) {
            this.irqStatus &= ~IRQ_EDGE_HIGH;
            this.rp2040.updateIOInterrupt();
        }
    }
    addListener(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }
}

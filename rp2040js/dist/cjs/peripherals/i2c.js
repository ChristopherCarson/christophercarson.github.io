"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RPI2C = exports.I2CSpeed = exports.I2CMode = void 0;
const fifo_1 = require("../utils/fifo");
const peripheral_1 = require("./peripheral");
const IC_CON = 0x00; // I2C Control Register
const IC_TAR = 0x04; // I2C Target Address Register
const IC_SAR = 0x08; // I2C Slave Address Register
const IC_DATA_CMD = 0x10; // I2C Rx/Tx Data Buffer and Command Register
const IC_SS_SCL_HCNT = 0x14; // Standard Speed I2C Clock SCL High Count Register
const IC_SS_SCL_LCNT = 0x18; // Standard Speed I2C Clock SCL Low Count Register
const IC_FS_SCL_HCNT = 0x1c; // Fast Mode or Fast Mode Plus I2C Clock SCL High Count Register
const IC_FS_SCL_LCNT = 0x20; // Fast Mode or Fast Mode Plus I2C Clock SCL Low Count Register
const IC_INTR_STAT = 0x2c; // I2C Interrupt Status Register
const IC_INTR_MASK = 0x30; // I2C Interrupt Mask Register
const IC_RAW_INTR_STAT = 0x34; // I2C Raw Interrupt Status Register
const IC_RX_TL = 0x38; // I2C Receive FIFO Threshold Register
const IC_TX_TL = 0x3c; // I2C Transmit FIFO Threshold Register
const IC_CLR_INTR = 0x40; // Clear Combined and Individual Interrupt Register
const IC_CLR_RX_UNDER = 0x44; // Clear RX_UNDER Interrupt Register
const IC_CLR_RX_OVER = 0x48; // Clear RX_OVER Interrupt Register
const IC_CLR_TX_OVER = 0x4c; // Clear TX_OVER Interrupt Register
const IC_CLR_RD_REQ = 0x50; // Clear RD_REQ Interrupt Register
const IC_CLR_TX_ABRT = 0x54; // Clear TX_ABRT Interrupt Register
const IC_CLR_RX_DONE = 0x58; // Clear RX_DONE Interrupt Register
const IC_CLR_ACTIVITY = 0x5c; // Clear ACTIVITY Interrupt Register
const IC_CLR_STOP_DET = 0x60; // Clear STOP_DET Interrupt Register
const IC_CLR_START_DET = 0x64; // Clear START_DET Interrupt Register
const IC_CLR_GEN_CALL = 0x68; // Clear GEN_CALL Interrupt Register
const IC_ENABLE = 0x6c; // I2C ENABLE Register
const IC_STATUS = 0x70; // I2C STATUS Register
const IC_TXFLR = 0x74; // I2C Transmit FIFO Level Register
const IC_RXFLR = 0x78; // I2C Receive FIFO Level Register
const IC_SDA_HOLD = 0x7c; // I2C SDA Hold Time Length Register
const IC_TX_ABRT_SOURCE = 0x80; // I2C Transmit Abort Source Register
const IC_SLV_DATA_NACK_ONLY = 0x84; // Generate Slave Data NACK Register
const IC_DMA_CR = 0x88; // DMA Control Register
const IC_DMA_TDLR = 0x8c; // DMA Transmit Data Level Register
const IC_DMA_RDLR = 0x90; // DMA Transmit Data Level Register
const IC_SDA_SETUP = 0x94; // I2C SDA Setup Register
const IC_ACK_GENERAL_CALL = 0x98; // I2C ACK General Call Register
const IC_ENABLE_STATUS = 0x9c; // I2C Enable Status Register
const IC_FS_SPKLEN = 0xa0; // I2C SS, FS or FM+ spike suppression limit
const IC_CLR_RESTART_DET = 0xa8; // Clear RESTART_DET Interrupt Register
const IC_COMP_PARAM_1 = 0xf4; // Component Parameter Register 1
const IC_COMP_VERSION = 0xf8; // I2C Component Version Register
const IC_COMP_TYPE = 0xfc; // I2C Component Type Register
// IC_CON bits:
const STOP_DET_IF_MASTER_ACTIVE = 1 << 10;
const RX_FIFO_FULL_HLD_CTRL = 1 << 9;
const TX_EMPTY_CTRL = 1 << 8;
const STOP_DET_IFADDRESSED = 1 << 7;
const IC_SLAVE_DISABLE = 1 << 6;
const IC_RESTART_EN = 1 << 5;
const IC_10BITADDR_MASTER = 1 << 4;
const IC_10BITADDR_SLAVE = 1 << 3;
const SPEED_SHIFT = 1;
const SPEED_MASK = 0x3;
const MASTER_MODE = 1 << 0;
// IC_TAR bits:
const SPECIAL = 1 << 11;
const GC_OR_START = 1 << 10;
// IC_STATUS bits:
const SLV_ACTIVITY = 1 << 6;
const MST_ACTIVITY = 1 << 5;
const RFF = 1 << 4;
const RFNE = 1 << 3;
const TFE = 1 << 2;
const TFNF = 1 << 1;
const ACTIVITY = 1 << 0;
// IC_ENABLE bits:
const TX_CMD_BLOCK = 1 << 2;
const ABORT = 1 << 1;
const ENABLE = 1 << 0;
// IC_TX_ABRT_SOURCE bits:
const TX_FLUSH_CNT_MASK = 0x1ff;
const TX_FLUSH_CNT_SHIFT = 23;
const ABRT_USER_ABRT = 1 << 16;
const ABRT_SLVRD_INT = 1 << 15;
const ABRT_SLV_ARBLOST = 1 << 14;
const ABRT_SLVFLUSH_TXFIFO = 1 << 13;
const ARB_LOST = 1 << 12;
const ABRT_MASTER_DIS = 1 << 11;
const ABRT_10B_RD_NORSTRT = 1 << 10;
const ABRT_SBYTE_NORSTRT = 1 << 9;
const ABRT_HS_NORSTRT = 1 << 8;
const ABRT_SBYTE_ACKDET = 1 << 7;
const ABRT_HS_ACKDET = 1 << 6;
const ABRT_GCALL_READ = 1 << 5;
const ABRT_GCALL_NOACK = 1 << 4;
const ABRT_TXDATA_NOACK = 1 << 3;
const ABRT_10ADDR2_NOACK = 1 << 2;
const ABRT_10ADDR1_NOACK = 1 << 1;
const ABRT_7B_ADDR_NOACK = 1 << 0;
/* Connection parameters */
var I2CMode;
(function (I2CMode) {
    I2CMode[I2CMode["Write"] = 0] = "Write";
    I2CMode[I2CMode["Read"] = 1] = "Read";
})(I2CMode = exports.I2CMode || (exports.I2CMode = {}));
var I2CSpeed;
(function (I2CSpeed) {
    I2CSpeed[I2CSpeed["Invalid"] = 0] = "Invalid";
    /* standard mode (100 kbit/s) */
    I2CSpeed[I2CSpeed["Standard"] = 1] = "Standard";
    /* fast mode (<=400 kbit/s) or fast mode plus (<=1000Kbit/s) */
    I2CSpeed[I2CSpeed["FastMode"] = 2] = "FastMode";
    /*  high speed mode (3.4 Mbit/s) */
    I2CSpeed[I2CSpeed["HighSpeedMode"] = 3] = "HighSpeedMode";
})(I2CSpeed = exports.I2CSpeed || (exports.I2CSpeed = {}));
var I2CState;
(function (I2CState) {
    I2CState[I2CState["Idle"] = 0] = "Idle";
    I2CState[I2CState["Start"] = 1] = "Start";
    I2CState[I2CState["Connect"] = 2] = "Connect";
    I2CState[I2CState["Connected"] = 3] = "Connected";
    I2CState[I2CState["Stop"] = 4] = "Stop";
})(I2CState || (I2CState = {}));
// Interrupts
const R_RESTART_DET = 1 << 12; // Slave mode only
const R_GEN_CALL = 1 << 11;
const R_START_DET = 1 << 10;
const R_STOP_DET = 1 << 9;
const R_ACTIVITY = 1 << 8;
const R_RX_DONE = 1 << 7;
const R_TX_ABRT = 1 << 6;
const R_RD_REQ = 1 << 5;
const R_TX_EMPTY = 1 << 4;
const R_TX_OVER = 1 << 3;
const R_RX_FULL = 1 << 2;
const R_RX_OVER = 1 << 1;
const R_RX_UNDER = 1 << 0;
// FIFO entry bits
const FIRST_DATA_BYTE = 1 << 10;
const RESTART = 1 << 10;
const STOP = 1 << 9;
const CMD = 1 << 8; // 0 for write, 1 for read
class RPI2C extends peripheral_1.BasePeripheral {
    constructor(rp2040, name, irq) {
        super(rp2040, name);
        this.irq = irq;
        this.state = I2CState.Idle;
        this.busy = false;
        this.stop = false;
        this.pendingRestart = false;
        this.firstByte = false;
        this.rxFIFO = new fifo_1.FIFO(16);
        this.txFIFO = new fifo_1.FIFO(16);
        // user provided callbacks
        this.onStart = () => this.completeStart();
        this.onConnect = () => this.completeConnect(false);
        this.onWriteByte = () => this.completeWrite(false);
        this.onReadByte = () => this.completeRead(0xff);
        this.onStop = () => this.completeStop();
        this.enable = 0;
        this.rxThreshold = 0;
        this.txThreshold = 0;
        this.control = IC_SLAVE_DISABLE | IC_RESTART_EN | (I2CSpeed.FastMode << SPEED_SHIFT) | MASTER_MODE;
        this.targetAddress = 0x55;
        this.slaveAddress = 0x55;
        this.abortSource = 0;
        this.intRaw = 0;
        this.intEnable = 0;
    }
    get intStatus() {
        return this.intRaw & this.intEnable;
    }
    get speed() {
        return ((this.control >> SPEED_SHIFT) & SPEED_MASK);
    }
    get masterBits() {
        return this.control & IC_10BITADDR_MASTER ? 10 : 7;
    }
    checkInterrupts() {
        this.rp2040.setInterrupt(this.irq, !!this.intStatus);
    }
    clearInterrupts(mask) {
        if (this.intRaw & mask) {
            this.intRaw &= ~mask;
            this.checkInterrupts();
            return 1;
        }
        else {
            return 0;
        }
    }
    setInterrupts(mask) {
        if (!(this.intRaw & mask)) {
            this.intRaw |= mask;
            this.checkInterrupts();
        }
    }
    abort(reason) {
        this.abortSource &= ~TX_FLUSH_CNT_MASK;
        this.abortSource |= reason | (this.txFIFO.itemCount << TX_FLUSH_CNT_SHIFT);
        this.txFIFO.reset();
        this.setInterrupts(R_TX_ABRT);
    }
    nextCommand() {
        const enabled = this.enable & ENABLE;
        const blocked = this.enable & TX_CMD_BLOCK;
        if (this.txFIFO.empty || this.busy || blocked || !enabled) {
            return;
        }
        this.busy = true;
        const restart = !!(this.txFIFO.peek() & RESTART) && !this.pendingRestart && !this.stop;
        if (this.state === I2CState.Idle || restart) {
            this.pendingRestart = restart;
            this.stop = false;
            this.state = I2CState.Start;
            this.onStart(restart);
            return;
        }
        this.pendingRestart = false;
        const cmd = this.txFIFO.pull();
        const readMode = !!(cmd & CMD);
        this.stop = !!(cmd & STOP);
        if (readMode) {
            this.onReadByte(!this.stop);
        }
        else {
            this.onWriteByte(cmd & 0xff);
        }
        if (this.txFIFO.itemCount <= this.txThreshold) {
            this.setInterrupts(R_TX_EMPTY);
        }
    }
    pushRX(value) {
        if (this.rxFIFO.full) {
            this.setInterrupts(R_RX_OVER);
            return;
        }
        this.rxFIFO.push(value);
        if (this.rxFIFO.itemCount > this.rxThreshold) {
            this.setInterrupts(R_RX_FULL);
        }
    }
    completeStart() {
        if (this.txFIFO.empty || this.state !== I2CState.Start || this.stop) {
            this.onStop();
            return;
        }
        const mode = this.txFIFO.peek() & CMD ? I2CMode.Read : I2CMode.Write;
        this.state = I2CState.Connect;
        this.setInterrupts(R_START_DET);
        const addressMask = this.masterBits === 10 ? 0x3ff : 0xff;
        this.onConnect(this.targetAddress & addressMask, mode);
    }
    completeConnect(ack, nackByte = 0) {
        if (!ack || this.stop) {
            if (!ack) {
                if (!this.targetAddress) {
                    this.abort(ABRT_GCALL_NOACK);
                }
                else if (this.control & IC_10BITADDR_MASTER) {
                    this.abort(nackByte === 0 ? ABRT_10ADDR1_NOACK : ABRT_10ADDR2_NOACK);
                }
                else {
                    this.abort(ABRT_7B_ADDR_NOACK);
                }
            }
            this.state = I2CState.Stop;
            this.onStop();
            return;
        }
        this.state = I2CState.Connected;
        this.busy = false;
        this.firstByte = true;
        this.nextCommand();
    }
    completeWrite(ack) {
        if (!ack || this.stop) {
            if (!ack) {
                this.abort(ABRT_TXDATA_NOACK);
            }
            this.state = I2CState.Stop;
            this.onStop();
            return;
        }
        this.busy = false;
        this.nextCommand();
    }
    completeRead(value) {
        this.pushRX(value | (this.firstByte ? FIRST_DATA_BYTE : 0));
        if (this.stop) {
            this.state = I2CState.Stop;
            this.onStop();
            return;
        }
        this.firstByte = false;
        this.busy = false;
        this.nextCommand();
    }
    completeStop() {
        this.state = I2CState.Idle;
        this.setInterrupts(R_STOP_DET);
        this.busy = false;
        this.pendingRestart = false;
        if (this.enable & ABORT) {
            this.enable &= ~ABORT;
        }
        else {
            this.nextCommand();
        }
    }
    arbitrationLost() {
        this.state = I2CState.Idle;
        this.busy = false;
        this.abort(ARB_LOST);
    }
    readUint32(offset) {
        switch (offset) {
            case IC_CON:
                return this.control;
            case IC_TAR:
                return this.targetAddress;
            case IC_SAR:
                return this.slaveAddress;
            case IC_DATA_CMD:
                if (this.rxFIFO.empty) {
                    this.setInterrupts(R_RX_UNDER);
                    return 0;
                }
                this.clearInterrupts(R_RX_FULL);
                return this.rxFIFO.pull();
            case IC_INTR_STAT:
                return this.intStatus;
            case IC_INTR_MASK:
                return this.intEnable;
            case IC_RAW_INTR_STAT:
                return this.intRaw;
            case IC_RX_TL:
                return this.rxThreshold;
            case IC_TX_TL:
                return this.txThreshold;
            case IC_CLR_INTR:
                this.abortSource &= ABRT_SBYTE_NORSTRT; // Clear IC_TX_ABRT_SOURCE, expect for bit 9
                return this.clearInterrupts(R_RX_UNDER |
                    R_RX_OVER |
                    R_TX_OVER |
                    R_RD_REQ |
                    R_TX_ABRT |
                    R_RX_DONE |
                    R_ACTIVITY |
                    R_STOP_DET |
                    R_START_DET |
                    R_GEN_CALL);
            case IC_CLR_RX_UNDER:
                return this.clearInterrupts(R_RX_UNDER);
            case IC_CLR_RX_OVER:
                return this.clearInterrupts(R_RX_OVER);
            case IC_CLR_TX_OVER:
                return this.clearInterrupts(R_TX_OVER);
            case IC_CLR_RD_REQ:
                return this.clearInterrupts(R_RD_REQ);
            case IC_CLR_TX_ABRT:
                this.abortSource &= ABRT_SBYTE_NORSTRT; // Clear IC_TX_ABRT_SOURCE, expect for bit 9
                return this.clearInterrupts(R_TX_ABRT);
            case IC_CLR_RX_DONE:
                return this.clearInterrupts(R_RX_DONE);
            case IC_CLR_ACTIVITY:
                return this.clearInterrupts(R_ACTIVITY);
            case IC_CLR_STOP_DET:
                return this.clearInterrupts(R_STOP_DET);
            case IC_CLR_START_DET:
                return this.clearInterrupts(R_START_DET);
            case IC_CLR_GEN_CALL:
                return this.clearInterrupts(R_GEN_CALL);
            case IC_ENABLE:
                return this.enable;
            case IC_STATUS:
                return ((this.state !== I2CState.Idle ? MST_ACTIVITY | ACTIVITY : 0) |
                    (this.rxFIFO.full ? RFF : 0) |
                    (!this.rxFIFO.empty ? RFNE : 0) |
                    (this.txFIFO.empty ? TFE : 0) |
                    (!this.txFIFO.full ? TFNF : 0));
            case IC_TXFLR:
                return this.txFIFO.itemCount;
            case IC_RXFLR:
                return this.rxFIFO.itemCount;
            case IC_TX_ABRT_SOURCE: {
                const value = this.abortSource;
                this.abortSource &= ABRT_SBYTE_NORSTRT; // Clear IC_TX_ABRT_SOURCE, expect for bit 9
                return value;
            }
            case IC_COMP_PARAM_1:
                // From the datasheet:
                // Note This register is not implemented and therefore reads as 0. If it was implemented it would be a constant read-only
                // register that contains encoded information about the component's parameter settings.
                return 0;
            case IC_COMP_VERSION:
                return 0x3230312a;
            case IC_COMP_TYPE:
                return 0x44570140;
        }
        return super.readUint32(offset);
    }
    writeUint32(offset, value) {
        switch (offset) {
            case IC_CON:
                if (((value >> SPEED_SHIFT) & SPEED_MASK) === I2CSpeed.Invalid) {
                    value = (value & ~(SPEED_MASK << SPEED_SHIFT)) | (I2CSpeed.HighSpeedMode << SPEED_SHIFT);
                }
                this.control = value;
                return;
            case IC_TAR:
                this.targetAddress = value & 0x3ff;
                return;
            case IC_SAR:
                this.slaveAddress = value & 0x3ff;
                return;
            case IC_DATA_CMD:
                if (this.txFIFO.full) {
                    this.setInterrupts(R_TX_OVER);
                }
                else {
                    this.txFIFO.push(value);
                    this.clearInterrupts(R_TX_EMPTY);
                    this.nextCommand();
                }
                return;
            case IC_RX_TL:
                this.rxThreshold = value & 0xff;
                if (this.rxThreshold > this.rxFIFO.size) {
                    this.rxThreshold = this.rxFIFO.size;
                }
                return;
            case IC_TX_TL:
                this.txThreshold = value & 0xff;
                if (this.txThreshold > this.txFIFO.size) {
                    this.txThreshold = this.txFIFO.size;
                }
                return;
            case IC_ENABLE:
                // ABORT bit can only be set by software, not cleared.
                value |= this.enable & ABORT;
                if (value & ABORT) {
                    if (this.state === I2CState.Idle) {
                        value &= ~ABORT;
                    }
                    else {
                        this.abort(ABRT_USER_ABRT);
                        this.stop = true;
                    }
                }
                if (!(value & ENABLE)) {
                    this.txFIFO.reset();
                    this.rxFIFO.reset();
                }
                this.enable = value;
                this.nextCommand(); // TX_CMD_BLOCK may have changed
                return;
            default:
                super.writeUint32(offset, value);
        }
    }
}
exports.RPI2C = RPI2C;

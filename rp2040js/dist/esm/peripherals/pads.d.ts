import { RP2040 } from '../rp2040';
import { BasePeripheral, Peripheral } from './peripheral';
export declare type IIOBank = 'qspi' | 'bank0';
export declare class RPPADS extends BasePeripheral implements Peripheral {
    readonly bank: IIOBank;
    voltageSelect: number;
    private readonly firstPadRegister;
    private readonly lastPadRegister;
    constructor(rp2040: RP2040, name: string, bank: IIOBank);
    getPinFromOffset(offset: number): import("../gpio-pin").GPIOPin;
    readUint32(offset: number): number;
    writeUint32(offset: number, value: number): void;
}

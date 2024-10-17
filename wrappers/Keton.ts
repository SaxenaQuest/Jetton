import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type KetonConfig = {};

export function ketonConfigToCell(config: KetonConfig): Cell {
    return beginCell().endCell();
}

export class Keton implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new Keton(address);
    }

    static createFromConfig(config: KetonConfig, code: Cell, workchain = 0) {
        const data = ketonConfigToCell(config);
        const init = { code, data };
        return new Keton(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }
}

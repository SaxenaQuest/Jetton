import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { Keton } from '../wrappers/Keton';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('Keton', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Keton');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let keton: SandboxContract<Keton>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        keton = blockchain.openContract(Keton.createFromConfig({}, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await keton.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: keton.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and keton are ready to use
    });
});

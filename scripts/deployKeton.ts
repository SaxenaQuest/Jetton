import { toNano } from '@ton/core';
import { Keton } from '../wrappers/Keton';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const keton = provider.open(Keton.createFromConfig({}, await compile('Keton')));

    await keton.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(keton.address);

    // run methods on `keton`
}

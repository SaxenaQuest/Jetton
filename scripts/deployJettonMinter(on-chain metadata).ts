import { Address, Dictionary, beginCell, Cell, toNano } from '@ton/core';
import { JettonMinter, JettonMinterContent, jettonContentToCell, jettonMinterConfigToCell } from '../wrappers/JettonMinter';
import { compile, NetworkProvider, UIProvider} from '@ton/blueprint';
import { promptAddress, promptBool, promptUrl } from '../wrappers/ui-utils';
import { sha256 } from 'ton-crypto';


const formatUrl = "https://github.com/ton-blockchain/TEPs/blob/master/text/0064-token-data-standard.md#jetton-metadata-example-offchain";
const metadataContent = {
                          "name": "Trial Jetton",
                          "description": "Trial Jetton With On-Chain Metadata",
                          "symbol": "TRIAL",
                          "decimals": "9",
                          "image": "https://www.shutterstock.com/image-vector/cute-cat-wear-dino-costume-600nw-2457633459.jpg"
                       };


export async function run(provider: NetworkProvider) {
    const ui       = provider.ui();
    const sender   = provider.sender();

    const adminPrompt = `Please specify admin address`;

    let admin      = await promptAddress(adminPrompt, ui, sender.address);
    ui.write(`Admin address:${admin}\n`);

    let dataCorrect = false;
    do {
        ui.write(`Please verify Admin Address:${admin}\n\n`);
        dataCorrect = await promptBool('Is everything ok?(y/n)', ['y','n'], ui);
        if(!dataCorrect) {
                admin = await promptAddress(adminPrompt, ui, sender.address);
        }
    } while(!dataCorrect);
    let content:Cell

    const collectionContentDict = Dictionary.empty(Dictionary.Keys.BigUint(256), Dictionary.Values.Cell())
        .set(BigInt("0x" + (await sha256('name')).toString('hex')),beginCell().storeUint(0, 8).storeStringTail(metadataContent.name).endCell())
        .set(BigInt("0x" + (await sha256('description')).toString('hex')),beginCell().storeUint(0, 8).storeStringTail(metadataContent.description).endCell())
        .set(BigInt("0x" + (await sha256('symbol')).toString('hex')),beginCell().storeUint(0, 8).storeStringTail(metadataContent.symbol).endCell())
        .set(BigInt("0x" + (await sha256('image')).toString('hex')),beginCell().storeUint(0, 8).storeStringTail(metadataContent.image).endCell())
        .set(BigInt("0x" + (await sha256('decimals')).toString('hex')),beginCell().storeUint(0, 8).storeStringTail(metadataContent.decimals).endCell())
     content = beginCell()
                .storeUint(0,8)
                .storeDict(collectionContentDict)
                .endCell();

    const wallet_code = await compile('JettonWallet');

    const minter  = provider.open(JettonMinter.createFromConfig({admin,
                                                  content,
                                                  wallet_code}, 
                                                  await compile('JettonMinter')));
    await minter.sendDeploy(provider.sender(), toNano('0.05'));
    await provider.waitForDeploy(minter.address);
}

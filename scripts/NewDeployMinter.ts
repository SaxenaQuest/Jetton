import { Address, contractAddress, Dictionary, beginCell, Cell, toNano } from '@ton/core';
import { JettonMinter, JettonMinterContent, jettonContentToCell, jettonMinterConfigToCell } from '../wrappers/JettonMinter';
import { compile, NetworkProvider, UIProvider} from '@ton/blueprint';
import { promptAddress, promptBool, promptUrl } from '../wrappers/ui-utils';
import { sha256 } from 'ton-crypto';

import { mnemonicToWalletKey, mnemonicNew } from "ton-crypto";
import { TonClient, WalletContractV4, internal } from "@ton/ton";
import { getHttpEndpoint } from "@orbs-network/ton-access";

import * as fs from 'fs';
// const imgdata=fs.readFileSync()


const formatUrl = "https://github.com/ton-blockchain/TEPs/blob/master/text/0064-token-data-standard.md#jetton-metadata-example-offchain";
const exampleContent = {
                          "name": "Trial Jetton8",
                          "description": "Eigth Trial Jetton",
                          "symbol": "TRY8",
                          "decimals": "8",
                          "image": "https://www.shutterstock.com/image-vector/cute-cat-wear-dino-costume-600nw-2457633459.jpg"
                        //   "image_data": binaryData
                       };


export async function main() {
    const fmnemonic ="purpose paper arctic exhibit tuna grid maple grocery pitch neck pull cannon shrug worth million assume tone index march inquiry gossip layer liquid oblige";  
    const fundingWalletkey = await mnemonicToWalletKey(fmnemonic.split(" "));
    const fundingWallet = WalletContractV4.create({ publicKey: fundingWalletkey.publicKey, workchain: 0 });
    const fundingWalletsecretkey = fundingWalletkey.secretKey;
    // initialize ton rpc client on testnet
    const endpoint = await getHttpEndpoint({ network: "testnet" });
    const client = new TonClient({ endpoint });
    let admin      = fundingWallet.address

    const collectionContentDict = Dictionary.empty(Dictionary.Keys.BigUint(256), Dictionary.Values.Cell())
        .set(BigInt("0x" + (await sha256('name')).toString('hex')),beginCell().storeUint(0, 8).storeStringTail(exampleContent.name).endCell())
        .set(BigInt("0x" + (await sha256('description')).toString('hex')),beginCell().storeUint(0, 8).storeStringTail(exampleContent.description).endCell())
        .set(BigInt("0x" + (await sha256('symbol')).toString('hex')),beginCell().storeUint(0, 8).storeStringTail(exampleContent.symbol).endCell())
        .set(BigInt("0x" + (await sha256('decimals')).toString('hex')),beginCell().storeUint(0, 8).storeStringTail(exampleContent.decimals).endCell())
        .set(BigInt("0x" + (await sha256('image')).toString('hex')),beginCell().storeUint(0, 8).storeStringTail(exampleContent.image).endCell())
        // .set(BigInt("0x" + (await sha256('image_data')).toString('hex')),beginCell().storeUint(0, 8).storeStringTail(exampleContent.image_data).endCell())
     let content = beginCell()
                .storeUint(0,8)
                .storeDict(collectionContentDict)
                .endCell();

    const wallet_code = await compile('JettonWallet');
    JettonMinter.createFromConfig({admin,content,wallet_code,}, await compile('JettonMinter'))
    const data = jettonMinterConfigToCell({admin,content,wallet_code,});
    const code = await compile('JettonMinter')
    const initdata = { code, data };
    const deployaddress=contractAddress(0, initdata)

    // send 0.1 TON from funding wallet to new wallet
    let walletContract = client.open(fundingWallet);
    let seqno = await walletContract.getSeqno();
    await walletContract.sendTransfer({
        secretKey: fundingWalletsecretkey,
        seqno: seqno,
        messages: [
        internal({
            to: deployaddress, 
            value: "0.05", // 0.1 TON
            bounce: true,
            init:initdata
        })
        ]
    });
    await waitForTransaction(seqno, walletContract);
}

async function waitForTransaction(seqno: number, walletContract: any) {
    // wait until confirmed
    let currentSeqno = seqno;
    while (currentSeqno == seqno) {
    console.log("waiting for transaction to confirm...");
    await sleep(1500);
        currentSeqno = await walletContract.getSeqno();
    }
    console.log("transaction confirmed!");
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

main();
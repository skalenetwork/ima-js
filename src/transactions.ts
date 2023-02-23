/**
 * @license
 * SKALE ima-js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * @file transactions.ts
 * @copyright SKALE Labs 2021-Present
 */

import { ethers, providers, Signer, Wallet } from 'ethers';
import debug from 'debug';

import * as constants from './constants';
import TxOpts from './TxOpts';


const log = debug('ima:transactions');


export async function send(
    provider: providers.Provider,
    transaction: providers.TransactionRequest,
    opts: TxOpts,
    name: string,
    wait: boolean = true
): Promise<providers.TransactionResponse> {
    if (opts.value) transaction.value = opts.value;
    if (opts.address) transaction.from = opts.address;

    const gasLimit = await provider.estimateGas(transaction);
    log('💡 ' + name + ' estimated gasLimit: ' + gasLimit);

    const signer = getSigner(provider, opts);

    log('⏩ ' + name + ' sending - from: ' + transaction.from + ', to: ' +
        transaction.to + ', value: ' + transaction.value);
    const txResponse = await signer.sendTransaction(transaction);

    log('⏳ ' + name + ' mining - tx: ' + txResponse.hash + ', nonce: ' +
        txResponse.nonce + ', gasLimit: ' + txResponse.gasLimit);
    if (wait) await txResponse.wait(constants.DEFAULT_CONFIRMATIONS_NUM);
    log('✅ ' + name + ' mined - tx: ' + txResponse.hash);
    return txResponse;
}


function getSigner(provider: providers.Provider, opts: TxOpts): Signer {
    let signer: Signer;
    if (opts.privateKey && typeof opts.privateKey === 'string' && opts.privateKey.length > 0) {
        signer = new Wallet(opts.privateKey, provider);
    } else if (provider instanceof providers.Web3Provider) {
        signer = provider.getSigner();
    } else {
        throw new Error('Invalid provider type, can not send transaction');
    }
    return signer;
}


export async function sendETH(
    provider: providers.Provider,
    address: string,
    value: string,
    opts: TxOpts,
    wait: boolean = true
): Promise<providers.TransactionResponse> {
    // TODO: add dry run!
    log('⏩ ' + ' sending ETH - from: ' + ', to: ' + address + ', value: ' + value);
    const signer = getSigner(provider, opts);
    const txResponse = await signer.sendTransaction({
        to: address,
        value: ethers.utils.parseEther(value)
    });
    log('⏳ ' + ' sending ETH - tx: ' + txResponse.hash + ', nonce: ' +
        txResponse.nonce + ', gasLimit: ' + txResponse.gasLimit);
    if (wait) await txResponse.wait(constants.DEFAULT_CONFIRMATIONS_NUM);
    log('✅ ' + ' ETH sent - tx: ' + txResponse.hash);
    return txResponse;
}

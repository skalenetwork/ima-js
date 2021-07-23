/**
 * @license
 * SKALE ima-js-v2
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * @file transactions.ts
 * @copyright SKALE Labs 2021-Present
 */

import Web3 from 'web3';

import * as helper from '../src/helper';
import * as constants from '../src/constants';
import IMAContractException from './exceptions/IMAContractException';
import InvalidCredentialsException from './exceptions/InvalidCredentialsException';


export async function signAndSend(web3: Web3, address: string, transactionData: any, gas: string,
    value: string, privateKey: string) {
    const encoded = transactionData.encodeABI();
    const contractAddress = transactionData._parent._address;
    const accountFromPrivateKey = web3.eth.accounts.privateKeyToAccount(privateKey).address;
    if (address !== accountFromPrivateKey && address !== helper.remove0x(accountFromPrivateKey)) {
        throw new InvalidCredentialsException(constants.errorMessages.INVALID_KEYPAIR);
    }
    const nonce = await web3.eth.getTransactionCount(address);
    const chainId = await web3.eth.getChainId(); // todo: use chainID from the outside!
    const tx = {
        from: address,
        data: encoded,
        gas,
        to: contractAddress,
        nonce,
        chainId,
        value
    };
    const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
    const rawTx = (signedTx.rawTransaction as string)
    return await web3.eth.sendSignedTransaction(rawTx);
}


export async function sendWithExternalSigning(web3: Web3, address: string, transactionData: any,
    gas: string, value: string) {
    const nonce = await web3.eth.getTransactionCount(address);
    return await transactionData.send({
        from: address,
        gas,
        nonce
    });
}


export async function send(web3: Web3, address: string, transactionData: any, gas: string,
    value: string='0', privateKey?: string) {
    let result;
    try {
        if (privateKey && typeof privateKey === 'string' && privateKey.length > 0) {
            const pk = (helper.add0x(privateKey) as string);
            helper.validatePrivateKey(pk);
            result = await signAndSend(web3, address, transactionData, gas, value, pk);
        } else {
            result = await sendWithExternalSigning(web3, address, transactionData, gas, value);
        }
        return result;
    } catch (error) {
        if (error.message.includes(constants.errorMessages.REVERTED_TRANSACTION)) {
            const errorMessage = error.message.substr(constants.errorMessages.REVERTED_TRANSACTION.length);
            const revertReason = JSON.parse(errorMessage).revertReason;
            if (revertReason) {
                throw new IMAContractException(revertReason);
            } else {
                throw new IMAContractException(constants.errorMessages.FAILED_TRANSACTION);
            }
        } else {
            throw error;
        }
    }
}
/**
 * @license
 * SKALE ima-js
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

import * as helper from './helper';
import * as constants from './constants';
import IMAContractException from './exceptions/IMAContractException';
import InvalidCredentialsException from './exceptions/InvalidCredentialsException';
import TxOpts from './TxOpts';


export async function signAndSend(web3: Web3, address: string, transactionData: any, gas: string,
    value: string, privateKey: string) {
    const encoded = transactionData.encodeABI();
    const contractAddress = transactionData._parent._address;
    const accountFromPrivateKey = web3.eth.accounts.privateKeyToAccount(privateKey).address;
    if (address !== accountFromPrivateKey && address !== helper.remove0x(accountFromPrivateKey)) {
        throw new InvalidCredentialsException(constants.errorMessages.INVALID_KEYPAIR);
    }
    const chainId = await web3.eth.getChainId(); // todo: use chainID from the outside!
    const nonce = await web3.eth.getTransactionCount(address);
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
    const rawTx = (signedTx.rawTransaction as string);
    return await web3.eth.sendSignedTransaction(rawTx);
}


export async function sendWithExternalSigning(web3: Web3, address: string, transactionData: any,
    gas: string, value: string) {
    // const nonce = await web3.eth.getTransactionCount(address);
    return await transactionData.send({
        from: address,
        gas,
        value
        // nonce
    });
}


export async function send(web3: Web3, transactionData: any, opts: TxOpts) {
    let result;
    let gasLimit: string;

    if (opts.customGasLimit) {
        gasLimit = opts.customGasLimit;
    } else {
        gasLimit = await estimateGasLimit(web3, opts.address, transactionData, opts.value);
    }

    if (!opts.value) opts.value = '0';

    try {
        if (opts.privateKey && typeof opts.privateKey === 'string' && opts.privateKey.length > 0) {
            const pk = (helper.add0x(opts.privateKey) as string);
            helper.validatePrivateKey(pk);
            result = await signAndSend(web3, opts.address, transactionData, gasLimit, opts.value, pk);
        } else {
            result = await sendWithExternalSigning(web3, opts.address, transactionData, gasLimit, opts.value);
        }
        return result;
    } catch (error) {
        if (error.message.includes(constants.errorMessages.REVERTED_TRANSACTION)) {
            const errorMessage = error.message.substr(
                constants.errorMessages.REVERTED_TRANSACTION.length);
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

export async function estimateGasLimit(web3: Web3, address: string, transactionData: any,
    value: string='0', gasMultiplier: number=constants.DEFAULT_GAS_MULTIPLIER){
    let estimatedGas = 0;
    const blockGasLimit = await currentBlockGasLimit(web3);
    try {
        estimatedGas = await transactionData.estimateGas({
            from: address,
            value
        });
    } catch ( err ) {
        estimatedGas = 0;
    }
    estimatedGas *= gasMultiplier;
    estimatedGas = Math.ceil(estimatedGas);
    if( estimatedGas === 0 ) estimatedGas = constants.DEFAULT_GAS_LIMIT;
    if ( estimatedGas > blockGasLimit ) estimatedGas = blockGasLimit;
    return estimatedGas.toString();
}

export async function currentBlockGasLimit(web3: Web3): Promise<number> {
    const latestBlockNumber = await web3.eth.getBlockNumber();
    const latestBlock = await web3.eth.getBlock(latestBlockNumber);
    return latestBlock.gasLimit;
}

export async function currentGasPrice(web3: Web3): Promise<string> {
    const ethGasPrice = await web3.eth.getGasPrice();
    const ethGasPriceBN = web3.utils.toBN(ethGasPrice);
    const gasMultBN = web3.utils.toBN(constants.GAS_PRICE_MULTIPLIER);
    ethGasPriceBN.mul(gasMultBN);
    return ethGasPriceBN.toString(10);
}

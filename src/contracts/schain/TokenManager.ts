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
 * @file TokenManager.ts
 * @copyright SKALE Labs 2022-Present
 */

 import { Logger } from "tslog";
import { Contract } from 'web3-eth-contract';

import { BaseContract } from '../BaseContract';
import { ContractsStringMap } from '../../BaseChain';
import TxOpts from '../../TxOpts';
import TimeoutException from '../../exceptions/TimeoutException';

import * as constants from '../../constants';
import * as transactions from '../../transactions';
import * as helper from '../../helper';


const log: Logger = new Logger();


export abstract class TokenManager extends BaseContract {
    tokens: ContractsStringMap = {};

    addToken(tokenName: string, contract: Contract) {
        this.tokens[tokenName] = contract;
    }

    abstract getTokenCloneAddress(
        originTokenAddress: string,
        originChainName: string
    ): Promise<string>;

    async enableAutomaticDeploy(opts: TxOpts) {
        const txData = this.contract.methods.enableAutomaticDeploy();
        return await transactions.send(this.web3, txData, opts);
    }

    async disableAutomaticDeploy(opts: TxOpts) {
        const txData = this.contract.methods.disableAutomaticDeploy();
        return await transactions.send(this.web3, txData, opts);
    }

    async automaticDeploy(): Promise<string> {
        return await this.contract.methods.automaticDeploy().call();
    }

    async grantRole(role: any, address: string, opts: TxOpts) {
        const txData = this.contract.methods.grantRole(role, address);
        return await transactions.send(this.web3, txData, opts);
    }

    async AUTOMATIC_DEPLOY_ROLE(): Promise<string> {
        return await this.contract.methods.AUTOMATIC_DEPLOY_ROLE().call();
    }

    async TOKEN_REGISTRAR_ROLE(): Promise<string> {
        return await this.contract.methods.TOKEN_REGISTRAR_ROLE().call();
    }

    async hasTokenManager(chainName: string): Promise<boolean> {
        return await this.contract.methods.hasTokenManager(chainName).call();
    }

    async ownerOf(tokenName: string, tokenId: number | string): Promise<string> {
        const contract = this.tokens[tokenName];
        try {
            if (typeof tokenId === 'string') tokenId = Number(tokenId);
            return await contract.methods.ownerOf(tokenId).call();
        } catch (err) {
            return constants.ZERO_ADDRESS; // todo: replace with IMA-ERC721 exception: no such token
        }
    }

    async waitForTokenClone(
        originTokenAddress: string,
        originChainName: string,
        sleepInterval: number=constants.DEFAULT_SLEEP,
        iterations: number = constants.DEFAULT_ITERATIONS
    ): Promise<any> {
        let res;
        const logData = 'origin token: ' + originTokenAddress + ', origin chain: ' + originChainName;
        for (let i = 1; i <= iterations; i++) {
            res = await this.getTokenCloneAddress(originTokenAddress, originChainName);
            if (constants.ZERO_ADDRESS !== res) {
                return;
            }
            if (helper.isNode()){
                log.info('Waiting for token clone - ' + logData);
            }
            await helper.sleep(sleepInterval);
        }
        throw new TimeoutException('waitForTokenClone timeout - ' + logData);
    }
}

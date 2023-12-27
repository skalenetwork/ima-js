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
 * @file index.ts
 * @copyright SKALE Labs 2023-Present
 */

import { Command } from 'commander'
import { JsonRpcProvider, Wallet } from "ethers";
import { Logger, ILogObj } from "tslog";
import { SChain, SCHAIN_ABI } from "../src";

const log: Logger<ILogObj> = new Logger()
const program = new Command()

program
    .name('ima')
    .description('Compact CLI for IMA')
    .version('0.0.1');

program.command('connect')
    .description('Connect 2 sChains')
    .requiredOption('-n1, --name-1 <string>', 'sChain 1 name')
    .requiredOption('-n2, --name-2 <string>', 'sChain 2 name')
    .requiredOption('-pk1, --private-key-1 <string>', 'sChain 1 private key')
    .requiredOption('-pk2, --private-key-2 <string>', 'sChain 2 private key')
    .requiredOption('-e1, --endpoint-1 <string>', 'sChain 1 endpoint')
    .requiredOption('-e2, --endpoint-2 <string>', 'sChain 2 endpoint')
    .action(async (options) => {
        await connect(
            options.name1,
            options.name2,
            options.privateKey1,
            options.privateKey2,
            options.endpoint1,
            options.endpoint2
        )
    });

program.parse();


export function initSChain(endpoint: string) {
    log.info(`Going to init sChain: ${endpoint}`)
    const provider = new JsonRpcProvider(endpoint)
    return new SChain(provider, SCHAIN_ABI)
}

async function connect(chain1: string, chain2: string, pk1: string, pk2: string, endpoint1: string, endpoint2: string): Promise<void> {
    const wallet1 = new Wallet(pk1)
    const wallet2 = new Wallet(pk2)

    const opts = { address: wallet1.address, privateKey: pk1 }
    const opts2 = { address: wallet2.address, privateKey: pk2 }

    const sChain1 = initSChain(endpoint1)
    const sChain2 = initSChain(endpoint2)

    let chain1Connected = await sChain1.tokenManagerLinker.hasSchain(chain2);
    if (!chain1Connected) {
        log.info('Connecting chain ' + chain1 + ' to ' + chain2);
        await sChain1.tokenManagerLinker.connectSchain(chain2, opts);
    } else {
        log.warn(`${chain1} already connected to ${chain2}`);
    }

    let chain2Connected = await sChain2.tokenManagerLinker.hasSchain(chain1);
    if (!chain2Connected) {
        log.info('Connecting chain ' + chain2 + ' to ' + chain1);
        await sChain2.tokenManagerLinker.connectSchain(chain1, opts2);
    } else {
        log.warn(`${chain2} already connected to ${chain1}`)
    }

    let isAutomaticDeployEnabled1 = await sChain1.erc20.automaticDeploy();
    if (!isAutomaticDeployEnabled1) {
        await sChain1.erc20.enableAutomaticDeploy(opts)
    }

    let isAutomaticDeployEnabled2 = await sChain2.erc20.automaticDeploy();
    if (!isAutomaticDeployEnabled2) {
        await sChain2.erc20.enableAutomaticDeploy(opts2)
    }
}
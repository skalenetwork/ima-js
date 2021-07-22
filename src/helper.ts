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
 * @file helper.ts
 * @copyright SKALE Labs 2021-Present
 */

import Web3 from 'web3';
import fs from 'fs';


export namespace helper {
    export function privateKeyToAccount(web3: Web3, privateKey: string) {
        return web3.eth.accounts.privateKeyToAccount(privateKey);
    }

    export function privateKeyToAddress(web3: Web3, privateKey: string) {
        let account = helper.privateKeyToAccount(web3, privateKey);
        return account.address;
    }

    export function add0x(s: any) {
        if (!s.startsWith('0x')) {
            return '0x' + s
        }
        return s;
    }

    export function jsonFileLoad(path: string) {
        if(!fileExists(path)){
            return {}
        }
        try {
            let s = fs.readFileSync(path);
            let jo = JSON.parse(s.toString());
            return jo;
        } catch ( err ) {
        }
        return {};
    }

    export function fileExists(strPath: string) {
        try {
            if(fs.existsSync(strPath)) {
                const stats = fs.statSync(strPath);
                if(stats.isFile())
                    return true;
            }
        } catch (err) {}
        return false;
    }
}
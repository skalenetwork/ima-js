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
 * @file helper.ts
 * @copyright SKALE Labs 2021-Present
 */


import * as constants from './constants';
import InvalidCredentialsException from './exceptions/InvalidCredentialsException';


export function add0x(s: any) {
    if (!s.startsWith('0x')) {
        return '0x' + s
    }
    return s;
}

export function remove0x(s: any) {
    if (!s.startsWith('0x')) return s;
    return s.slice(2);
}

export function validatePrivateKey(privateKey: string) {
    if (!constants.PRIVATE_KEY_REGEX.test(privateKey)) {
        throw new InvalidCredentialsException(constants.errorMessages.INVALID_PRIVATEKEY);
    }
}

export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function isNode() {
    let node = false;
    if (typeof process === 'object') {
        if (typeof process.versions === 'object') {
            if (typeof process.versions.node !== 'undefined') {
                node = true;
            }
        }
    }
    return node;
}
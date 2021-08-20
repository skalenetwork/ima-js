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
 * @file constants.ts
 * @copyright SKALE Labs 2021-Present
 */

export const PRIVATE_KEY_REGEX = /^(0x)?[0-9a-f]{64}$/i;

export const errorMessages = {
    FAILED_TRANSACTION: 'Transaction has been failed',
    REVERTED_TRANSACTION: 'Transaction has been reverted by the EVM:',
    INVALID_KEYPAIR: 'Keypair mismatch',
    INVALID_PRIVATEKEY: 'Incorrect privateKey'
};

export const DEFAULT_GAS_LIMIT = 10000000;
export const DEFAULT_GAS_MULTIPLIER = 1.5;
export const GAS_PRICE_MULTIPLIER = 1.3;

export const MAX_APPROVAL_AMOUNT = '999999999999000000000000000000'; // todo: replace with max uint256!

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export const DEFAULT_SLEEP = 3000;
export const DEFAULT_ITERATIONS = 30;
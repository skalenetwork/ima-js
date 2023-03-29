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
 * @file constants.ts
 * @copyright SKALE Labs 2021-Present
 */


import { BigNumber } from 'ethers';

export const PRIVATE_KEY_REGEX = /^(0x)?[0-9a-f]{64}$/i;

export const errorMessages = {
    FAILED_TRANSACTION: 'Transaction has been failed',
    REVERTED_TRANSACTION: 'Transaction has been reverted by the EVM:',
    INVALID_KEYPAIR: 'Keypair mismatch',
    INVALID_PRIVATEKEY: 'Incorrect privateKey'
};

export const DEFAULT_GAS_LIMIT = BigNumber.from(10000000);
export const DEFAULT_GAS_MULTIPLIER = 1.2;
export const GAS_PRICE_MULTIPLIER = 1.3;

export const MAX_APPROVAL_AMOUNT = '999999999999000000000000000000'; // todo: use max uint256!

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export const DEFAULT_SLEEP = 6000;
export const DEFAULT_ITERATIONS = 30;

export const MAINNET_CHAIN_NAME = 'Mainnet';

export const DEFAULT_CONFIRMATIONS_NUM = 1;

export const TOKEN_MANAGER_ERC20_MAPPING_LENGTH_SLOT = 212;
export const TOKEN_MANAGER_ERC721_MAPPING_LENGTH_SLOT = 211;
export const TOKEN_MANAGER_ERC1155_MAPPING_LENGTH_SLOT = 211;

export const ADDRESS_LENGTH_BYTES = 20;

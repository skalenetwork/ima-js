// SPDX-License-Identifier: AGPL-3.0-only

/**
 * @license
 * SKALE IMA JS
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
 * @file Address.sol
 * @copyright SKALE Labs 2019-Present
 */

pragma solidity ^0.5.0;

library Address {
    function isContract( address account ) internal view returns ( bool ) {
        // Returns true if "account" is a contract.
        //
        // This test is non-exhaustive, and there may be false-negatives: during the
        // execution of a contract's constructor, its address will be reported as
        // not containing a contract.
        //
        // It is unsafe to assume that an address for which this function returns
        // false is an externally-owned account (EOA) and not a contract.
        //
        // This method relies in extcodesize, which returns 0 for contracts in
        // construction, since the code is only stored at the end of the
        // constructor execution.
        uint256 size;
        // solhint-disable-next-line no-inline-assembly
        assembly { size := extcodesize( account ) }
        return size > 0;
    }
}

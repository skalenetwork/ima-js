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
 * @file Counters.sol
 * @copyright SKALE Labs 2019-Present
 */

pragma solidity ^0.5.0;

import "./SafeMath.sol";

// Counters by Matt Condon (@shrugs)
// Provides counters that can only be incremented or decremented by one. This can be used e.g. to track the number
// of elements in a mapping, issuing ERC721 ids, or counting request ids.
// Include with "using Counters for Counters.Counter;"
// Since it is not possible to overflow a 256 bit integer with increments of one, "increment" can skip the SafeMath
// overflow check, thereby saving gas. This does assume however correct usage, in that the underlying "_value" is never
// directly accessed.
library Counters {
    using SafeMath for uint256;
    struct Counter {
        // This variable should never be directly accessed by users of the library: interactions must be restricted to
        // the library's function. As of Solidity v0.5.2, this cannot be enforced, though there is a proposal to add
        // this feature: see https://github.com/ethereum/solidity/issues/4637
        uint256 _value; // default: 0
    }
    function current(Counter storage counter) internal view returns ( uint256 ) {
        return counter._value;
    }
    function increment(Counter storage counter) internal {
        counter._value += 1;
    }
    function decrement(Counter storage counter) internal {
        counter._value = counter._value.sub(1);
    }
}

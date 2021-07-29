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
 * @file IERC165.sol
 * @copyright SKALE Labs 2019-Present
 */

pragma solidity ^0.5.0;

// Interface of the ERC165 standard, as defined in the
// [EIP](https://eips.ethereum.org/EIPS/eip-165).
// Implementers can declare support of contract interfaces, which can then be
// queried by others ("ERC165Checker").
/// For an implementation, see "ERC165".
interface IERC165 {
    // Returns true if this contract implements the interface defined by
    // "interfaceId". See the corresponding
    // [EIP section](https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified)
    // to learn more about how these ids are created.
    // This function call must use less than 30 000 gas.
    function supportsInterface(bytes4 interfaceId) external view returns ( bool );
}

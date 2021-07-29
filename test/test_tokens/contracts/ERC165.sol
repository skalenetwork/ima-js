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
 * @file ERC165.sol
 * @copyright SKALE Labs 2019-Present
 */

pragma solidity ^0.5.0;

import "./IERC165.sol";

// Implementation of the "IERC165" interface.
// Contracts may inherit from this and call "_registerInterface" to declare
// their support of an interface.
contract ERC165 is IERC165 {
    // bytes4(keccak256('supportsInterface(bytes4)')) == 0x01ffc9a7
    bytes4 private constant _INTERFACE_ID_ERC165 = 0x01ffc9a7;

    // Mapping of interface ids to whether or not it's supported.
    mapping(bytes4 => bool) private _supportedInterfaces;

    constructor () internal {
        // Derived contracts need only register support for their own interfaces,
        // we register support for ERC165 itself here
        _registerInterface(_INTERFACE_ID_ERC165);
    }

    // See "IERC165.supportsInterface".
    // Time complexity O(1), guaranteed to always use less than 30 000 gas.
    function supportsInterface(bytes4 interfaceId) external view returns (bool) {
        return _supportedInterfaces[interfaceId];
    }

    // Registers the contract as an implementer of the interface defined by
    // "interfaceId". Support of the actual ERC165 interface is automatic and
    // registering its interface id is not required.
    // See "IERC165.supportsInterface".
    // Requirements:
    // - "interfaceId" cannot be the ERC165 invalid interface ("0xffffffff").
    function _registerInterface(bytes4 interfaceId) internal {
        require(interfaceId != 0xffffffff, "ERC165: invalid interface id");
        _supportedInterfaces[interfaceId] = true;
    }
}

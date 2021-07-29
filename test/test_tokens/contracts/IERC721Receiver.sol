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
 * @file IERC721Receiver.sol
 * @copyright SKALE Labs 2019-Present
 */

pragma solidity ^0.5.0;

// ERC721 token receiver interface
// Interface for any contract that wants to support safeTransfers
// from ERC721 asset contracts.
contract IERC721Receiver {
    // Handle the receipt of an NFT
    // The ERC721 smart contract calls this function on the recipient
    // after a "safeTransfer". This function MUST return the function selector,
    // otherwise the caller will revert the transaction. The selector to be
    // returned can be obtained as "this.onERC721Received.selector". This
    // function MAY throw to revert and reject the transfer.
    // Note: the ERC721 contract address is always the message sender.
    // -  operator The address which called "safeTransferFrom" function
    // -  from The address which previously owned the token
    // -  tokenId The NFT identifier which is being transferred
    // -  data Additional data with no specified format
    // Returns bytes4 "bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))"
    function onERC721Received(address operator, address from, uint256 tokenId, bytes memory data)
    public returns (bytes4);
}

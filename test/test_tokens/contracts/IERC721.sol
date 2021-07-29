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
 * @file IERC721.sol
 * @copyright SKALE Labs 2019-Present
 */

pragma solidity ^0.5.0;

import "./IERC165.sol";

// @dev Required interface of an ERC721 compliant contract.
contract IERC721 is IERC165 {
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    // Returns the number of NFTs in "owner"'s account.
    function balanceOf(address owner) public view returns ( uint256 balance );

    // Returns the owner of the NFT specified by "tokenId".
    function ownerOf(uint256 tokenId) public view returns ( address owner );

    // Transfers a specific NFT ("tokenId") from one account ("from") to
    // another ("to").
    // Requirements:
    // - "from", "to" cannot be zero.
    // - "tokenId" must be owned by "from".
    // - If the caller is not "from", it must be have been allowed to move this
    // NFT by either "approve" or "setApproveForAll".
    function safeTransferFrom(address from, address to, uint256 tokenId) public;

    // Transfers a specific NFT ("tokenId") from one account ("from") to
    // another ("to").
    // Requirements:
    // - If the caller is not "from", it must be approved to move this NFT by
    // either "approve" or "setApproveForAll".
    function transferFrom(address from, address to, uint256 tokenId) public;
    function approve(address to, uint256 tokenId) public;
    function getApproved(uint256 tokenId) public view returns (address operator);

    function setApprovalForAll(address operator, bool _approved) public;
    function isApprovedForAll(address owner, address operator) public view returns ( bool );


    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public;
}

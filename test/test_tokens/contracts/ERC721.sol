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
 * @file ERC721.sol
 * @copyright SKALE Labs 2019-Present
 */

pragma solidity ^0.5.0;

import "./IERC721.sol";
import "./IERC721Receiver.sol";
import "./SafeMath.sol";
import "./Address.sol";
import "./Counters.sol";
import "./ERC165.sol";
import "./Pausable.sol";

// ERC721 Non-Fungible Token Standard basic implementation
// see https://eips.ethereum.org/EIPS/eip-721
contract ERC721 is ERC165, IERC721, Pausable {
    using SafeMath for uint256;
    using Address for address;
    using Counters for Counters.Counter;

    // Equals to "bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))"
    // which can be also obtained as "IERC721Receiver(0).onERC721Received.selector"
    bytes4 private constant _ERC721_RECEIVED = 0x150b7a02;

    string private _name;
    string private _symbol;

    // Mapping from token ID to owner
    mapping (uint256 => address) private _tokenOwner;

    // Mapping from token ID to approved address
    mapping (uint256 => address) private _tokenApprovals;

    // Mapping from owner to number of owned token
    mapping (address => Counters.Counter) private _ownedTokensCount;

    // Mapping from owner to operator approvals
    mapping (address => mapping (address => bool)) private _operatorApprovals;

    //     bytes4(keccak256('balanceOf(address)')) == 0x70a08231
    //     bytes4(keccak256('ownerOf(uint256)')) == 0x6352211e
    //     bytes4(keccak256('approve(address,uint256)')) == 0x095ea7b3
    //     bytes4(keccak256('getApproved(uint256)')) == 0x081812fc
    //     bytes4(keccak256('setApprovalForAll(address,bool)')) == 0xa22cb465
    //     bytes4(keccak256('isApprovedForAll(address,address)')) == 0xe985e9c
    //     bytes4(keccak256('transferFrom(address,address,uint256)')) == 0x23b872dd
    //     bytes4(keccak256('safeTransferFrom(address,address,uint256)')) == 0x42842e0e
    //     bytes4(keccak256('safeTransferFrom(address,address,uint256,bytes)')) == 0xb88d4fde
    
    //     => 0x70a08231 ^ 0x6352211e ^ 0x095ea7b3 ^ 0x081812fc ^
    //        0xa22cb465 ^ 0xe985e9c ^ 0x23b872dd ^ 0x42842e0e ^ 0xb88d4fde == 0x80ac58cd
    bytes4 private constant _INTERFACE_ID_ERC721 = 0x80ac58cd;

    constructor (string memory name, string memory symbol) public {
        // register the supported interfaces to conform to ERC721 via ERC165
        _name = name;
        _symbol = symbol;
        _registerInterface(_INTERFACE_ID_ERC721);
    }

    // Returns the name of the token.
    function name() public view returns ( string memory ) {
        return _name;
    }

    // Returns the symbol of the token, usually a shorter version of thename.
    function symbol() public view returns ( string memory ) {
        return _symbol;
    }

    // Gets the balance of the specified address.
    // - owner address to query the balance of
    // Returns uint256 representing the amount owned by the passed address
    function balanceOf(address owner) public view returns (uint256) {
        require(owner != address(0), "ERC721: balance query for the zero address");

        return _ownedTokensCount[owner].current();
    }

    /**
    // Gets the owner of the specified token ID.
    // -  tokenId uint256 ID of the token to query the owner of
    // Returns address currently marked as the owner of the given token ID
     */
    function ownerOf(uint256 tokenId) public view returns (address) {
        address owner = _tokenOwner[tokenId];
        require(owner != address(0), "ERC721: owner query for nonexistent token");

        return owner;
    }

    // Approves another address to transfer the given token ID
    // The zero address indicates there is no approved address.
    // There can only be one approved address per token at a given time.
    // Can only be called by the token owner or an approved operator.
    // -  to address to be approved for the given token ID
    // -  tokenId uint256 ID of the token to be approved
    function approve(address to, uint256 tokenId) public whenNotPaused {
        address owner = ownerOf(tokenId);
        require(to != owner, "ERC721: approval to current owner");

        require(msg.sender == owner || isApprovedForAll(owner, msg.sender),
            "ERC721: approve caller is not owner nor approved for all"
        );

        _tokenApprovals[tokenId] = to;
        emit Approval(owner, to, tokenId);
    }

    // Gets the approved address for a token ID, or zero if no address set
    // Reverts if the token ID does not exist.
    // -  tokenId uint256 ID of the token to query the approval of
    // Returns address currently approved for the given token ID
    function getApproved(uint256 tokenId) public view returns (address) {
        require(_exists(tokenId), "ERC721: approved query for nonexistent token");

        return _tokenApprovals[tokenId];
    }

    // Sets or unsets the approval of a given operator
    // An operator is allowed to transfer all tokens of the sender on their behalf.
    // -  to operator address to set the approval
    // -  approved representing the status of the approval to be set
    function setApprovalForAll(address to, bool approved) public whenNotPaused {
        require(to != msg.sender, "ERC721: approve to caller");

        _operatorApprovals[msg.sender][to] = approved;
        emit ApprovalForAll(msg.sender, to, approved);
    }

    // Tells whether an operator is approved by a given owner.
    // -  owner owner address which you want to query the approval of
    // -  operator operator address which you want to query the approval of
    // Returns bool whether the given operator is approved by the given owner
    function isApprovedForAll(address owner, address operator) public view returns (bool) {
        return _operatorApprovals[owner][operator];
    }

    // Transfers the ownership of a given token ID to another address.
    // Usage of this method is discouraged, use "safeTransferFrom" whenever possible.
    // Requires the msg.sender to be the owner, approved, or operator.
    // -  from current owner of the token
    // -  to address to receive the ownership of the given token ID
    // -  tokenId uint256 ID of the token to be transferred
    function transferFrom(address from, address to, uint256 tokenId) public whenNotPaused {
        //solhint-disable-next-line max-line-length
        require(_isApprovedOrOwner(msg.sender, tokenId), "ERC721: transfer caller is not owner nor approved");

        _transferFrom(from, to, tokenId);
    }

    // Safely transfers the ownership of a given token ID to another address
    // If the target address is a contract, it must implement "onERC721Received",
    // which is called upon a safe transfer, and return the magic value
    // "bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))"; otherwise,
    // the transfer is reverted.
    // Requires the msg.sender to be the owner, approved, or operator
    // -  from current owner of the token
    // -  to address to receive the ownership of the given token ID
    // -  tokenId uint256 ID of the token to be transferred
    function safeTransferFrom(address from, address to, uint256 tokenId) public whenNotPaused {
        safeTransferFrom(from, to, tokenId, "");
    }

    // Safely transfers the ownership of a given token ID to another address
    // If the target address is a contract, it must implement "onERC721Received",
    // which is called upon a safe transfer, and return the magic value
    // "bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))"; otherwise,
    // the transfer is reverted.
    // Requires the msg.sender to be the owner, approved, or operator
    // -  from current owner of the token
    // -  to address to receive the ownership of the given token ID
    // -  tokenId uint256 ID of the token to be transferred
    // -  _data bytes data to send along with a safe transfer check
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory _data) public whenNotPaused {
        transferFrom(from, to, tokenId);
        require(_checkOnERC721Received(from, to, tokenId, _data), "ERC721: transfer to non ERC721Receiver implementer");
    }

    // Returns whether the specified token exists.
    // -  tokenId uint256 ID of the token to query the existence of
    // Returns bool whether the token exists
    function _exists(uint256 tokenId) internal view returns (bool) {
        address owner = _tokenOwner[tokenId];
        return owner != address(0);
    }

    // Returns whether the given spender can transfer a given token ID.
    // -  spender address of the spender to query
    // -  tokenId uint256 ID of the token to be transferred
    // Returns bool whether the msg.sender is approved for the given token ID,
    // is an operator of the owner, or is the owner of the token
    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view returns (bool) {
        require(_exists(tokenId), "ERC721: operator query for nonexistent token");
        address owner = ownerOf(tokenId);
        return (spender == owner || getApproved(tokenId) == spender || isApprovedForAll(owner, spender));
    }

    // Internal function to mint a new token.
    // Reverts if the given token ID already exists.
    // -  to The address that will own the minted token
    // -  tokenId uint256 ID of the token to be minted
    function _mint(address to, uint256 tokenId) internal {
        require(to != address(0), "ERC721: mint to the zero address");
        require(!_exists(tokenId), "ERC721: token already minted");

        _tokenOwner[tokenId] = to;
        _ownedTokensCount[to].increment();

        emit Transfer(address(0), to, tokenId);
    }

    // Internal function to burn a specific token.
    // Reverts if the token does not exist.
    // Deprecated, use _burn(uint256) instead.
    // -  owner owner of the token to burn
    // -  tokenId uint256 ID of the token being burned
    function _burn(address owner, uint256 tokenId) internal {
        require(ownerOf(tokenId) == owner, "ERC721: burn of token that is not own");

        _clearApproval(tokenId);

        _ownedTokensCount[owner].decrement();
        _tokenOwner[tokenId] = address(0);

        emit Transfer(owner, address(0), tokenId);
    }

    // Internal function to burn a specific token.
    // Reverts if the token does not exist.
    // -  tokenId uint256 ID of the token being burned
    function _burn(uint256 tokenId) internal {
        _burn(ownerOf(tokenId), tokenId);
    }

    // Internal function to transfer ownership of a given token ID to another address.
    // As opposed to transferFrom, this imposes no restrictions on msg.sender.
    // -  from current owner of the token
    // -  to address to receive the ownership of the given token ID
    // -  tokenId uint256 ID of the token to be transferred
    function _transferFrom(address from, address to, uint256 tokenId) internal {
        require(ownerOf(tokenId) == from, "ERC721: transfer of token that is not own");
        require(to != address(0), "ERC721: transfer to the zero address");

        _clearApproval(tokenId);

        _ownedTokensCount[from].decrement();
        _ownedTokensCount[to].increment();

        _tokenOwner[tokenId] = to;

        emit Transfer(from, to, tokenId);
    }

    // Internal function to invoke "onERC721Received" on a target address.
    // The call is not executed if the target address is not a contract.
    // This function is deprecated.
    // -  from address representing the previous owner of the given token ID
    // -  to target address that will receive the tokens
    // -  tokenId uint256 ID of the token to be transferred
    // -  _data bytes optional data to send along with the call
    // Returns bool whether the call correctly returned the expected magic value
    function _checkOnERC721Received(address from, address to, uint256 tokenId, bytes memory _data)
        internal returns (bool)
    {
        if (!to.isContract()) {
            return true;
        }

        bytes4 retval = IERC721Receiver(to).onERC721Received(msg.sender, from, tokenId, _data);
        return (retval == _ERC721_RECEIVED);
    }

    // Private function to clear current approval of a given token ID.
    // -  tokenId uint256 ID of the token to be transferred
    function _clearApproval(uint256 tokenId) private {
        if (_tokenApprovals[tokenId] != address(0)) {
            _tokenApprovals[tokenId] = address(0);
        }
    }
    
    //
    //
    //
    // ERC721 Token that can be irreversibly burned (destroyed).
    // Burns a specific ERC721 token.
    // - tokenId uint256 id of the ERC721 token to be burned.
    function burn(uint256 tokenId) public whenNotPaused {
        //solhint-disable-next-line max-line-length
        require(_isApprovedOrOwner(msg.sender, tokenId), "ERC721Burnable: caller is not owner nor approved");
        _burn(tokenId);
    }
    
    //
    //
    //
    // RC721 minting logic
    // Function to mint tokens.
    // - to The address that will receive the minted tokens.
    // -  tokenId The token id to mint.
    // Returns A boolean that indicates if the operation was successful.
    function mint(address to, uint256 tokenId) public onlyPrivileged whenNotPaused returns ( bool ) {
        _mint(to, tokenId);
        return true;
    }
}

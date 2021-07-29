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
 * @file ERC20.sol
 * @copyright SKALE Labs 2019-Present
 */

pragma solidity ^0.5.0;

import "./IERC20.sol";
import "./Pausable.sol";
import "./SafeMath.sol";

// Implementation of the "IERC20" interface.
contract ERC20 is IERC20, Pausable {
    using SafeMath for uint256;
    mapping (address => uint256) private _balances;
    mapping (address => mapping (address => uint256)) private _allowances;
    uint256 private _totalSupply;

    // See "IERC20.totalSupply"
    function totalSupply() public view returns ( uint256 ) {
        return _totalSupply;
    }

    // See "IERC20.balanceOf".
    function balanceOf(address account) public view returns ( uint256 ) {
        return _balances[account];
    }

    // See "IERC20.transfer".
    // Requirements:
    // - "recipient" cannot be the zero address.
    // - the caller must have a balance of at least "amount".
    function transfer(address recipient, uint256 amount) public whenNotPaused returns ( bool ) {
        _transfer(msg.sender, recipient, amount);
        return true;
    }

    // See "IERC20.allowance".
    function allowance(address owner, address spender) public view returns ( uint256 ) {
        return _allowances[owner][spender];
    }

    // See "IERC20.approve".
    // Requirements:
    // - "spender" cannot be the zero address.
    function approve(address spender, uint256 value) public whenNotPaused returns ( bool ) {
        _approve(msg.sender, spender, value);
        return true;
    }

    // See "IERC20.transferFrom".
    // Emits an "Approval" event indicating the updated allowance. This is not
    // required by the EIP. See the note at the beginning of "ERC20";
    // Requirements:
    // - "sender" and "recipient" cannot be the zero address.
    // - "sender" must have a balance of at least "value".
    // - the caller must have allowance for "sender"'s tokens of at least
    // "amount".
    function transferFrom(address sender, address recipient, uint256 amount) public whenNotPaused returns ( bool ) {
        _transfer(sender, recipient, amount);
        _approve(sender, msg.sender, _allowances[sender][msg.sender].sub(amount));
        return true;
    }

    // Atomically increases the allowance granted to "spender" by the caller.
    // This is an alternative to "approve" that can be used as a mitigation for
    // problems described in "IERC20.approve".
    // Emits an "Approval" event indicating the updated allowance.
    // Requirements:
    // - "spender" cannot be the zero address.
    function increaseAllowance(address spender, uint256 addedValue) public whenNotPaused returns ( bool ) {
        _approve(msg.sender, spender, _allowances[msg.sender][spender].add(addedValue));
        return true;
    }

    // Atomically decreases the allowance granted to "spender" by the caller.
    // This is an alternative to "approve" that can be used as a mitigation for
    // problems described in "IERC20.approve".
    // Emits an "Approval" event indicating the updated allowance.
    // Requirements:
    // - "spender" cannot be the zero address.
    // - "spender" must have allowance for the caller of at least
    // "subtractedValue".
    function decreaseAllowance(address spender, uint256 subtractedValue) public whenNotPaused returns ( bool ) {
        _approve(msg.sender, spender, _allowances[msg.sender][spender].sub(subtractedValue));
        return true;
    }

    // Moves tokens "amount" from "sender" to "recipient".
    // This is internal function is equivalent to "transfer", and can be used to
    // e.g. implement automatic token fees, slashing mechanisms, etc.
    // Emits a "Transfer" event.
    // Requirements:
    // - "sender" cannot be the zero address.
    // - "recipient" cannot be the zero address.
    // - "sender" must have a balance of at least "amount".
    function _transfer(address sender, address recipient, uint256 amount) internal {
        require(sender != address(0), "ERC20: transfer from the zero address");
        require(recipient != address(0), "ERC20: transfer to the zero address");
        _balances[sender] = _balances[sender].sub(amount);
        _balances[recipient] = _balances[recipient].add(amount);
        emit Transfer(sender, recipient, amount);
    }

    // Creates "amount" tokens and assigns them to "account", increasing
    // the total supply.
    // Emits a "Transfer" event with "from" set to the zero address.
    // Requirements
    // - "to" cannot be the zero address.
    function _mint(address account, uint256 amount) internal {
        // require(totalSupply().add(amount) <= _cap, "ERC20Capped: cap exceeded");
        require(account != address(0), "ERC20: mint to the zero address");
        _totalSupply = _totalSupply.add(amount);
        _balances[account] = _balances[account].add(amount);
        emit Transfer(address(0), account, amount);
    }

    // Destoys "amount" tokens from "account", reducing the
    // total supply.
    // Emits a "Transfer" event with "to" set to the zero address.
    // Requirements
    // - "account" cannot be the zero address.
    // - "account" must have at least "amount" tokens.
    function _burn(address account, uint256 value) internal {
        require(account != address(0), "ERC20: burn from the zero address");
        _totalSupply = _totalSupply.sub(value);
        _balances[account] = _balances[account].sub(value);
        emit Transfer(account, address(0), value);
    }

    // Sets "amount" as the allowance of "spender" over the "owner"s tokens.
    // This is internal function is equivalent to "approve", and can be used to
    // e.g. set automatic allowances for certain subsystems, etc.
    // Emits an "Approval" event.
    // Requirements:
    // - "owner" cannot be the zero address.
    // - "spender" cannot be the zero address.
    function _approve(address owner, address spender, uint256 value) internal {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");
        _allowances[owner][spender] = value;
        emit Approval(owner, spender, value);
    }

    // Destoys "amount" tokens from "account"."amount" is then deducted
    // from the caller's allowance.
    // See "_burn" and "_approve".
    function _burnFrom(address account, uint256 amount) internal {
        _burn(account, amount);
        _approve(account, msg.sender, _allowances[account][msg.sender].sub(amount));
    }

    //
    //
    //
    // Extension of "ERC20" that allows token holders to destroy both their own
    // tokens and those that they have an allowance for, in a way that can be
    // recognized off-chain (via event analysis).

    // Destoys "amount" tokens from the caller.
    // See "ERC20._burn".
    function burn(uint256 amount) public onlyPrivileged whenNotPaused {
        _burn(msg.sender, amount);
    }

    // See "ERC20._burnFrom".
    function burnFrom(address account, uint256 amount) public onlyPrivileged whenNotPaused {
        _burnFrom(account, amount);
    }

    //
    //
    //
    // Extension of "ERC20" that adds a set of accounts with the "MinterRole",
    // which have permission to mint (create) new tokens as they see fit.
    // At construction, the deployer of the contract is the only minter.

    // See "ERC20._mint".
    // Requirements:
    // - the caller must have the "MinterRole".
    function mint(address account, uint256 amount) public onlyPrivileged whenNotPaused returns ( bool ) {
        _mint(account, amount);
        return true;
    }

    //
    //
    //
    // Detailed and capped features,
    string private _name;
    string private _symbol;
    uint8 private _decimals;
    // uint256 private _cap;

    // Sets the values for "name", "symbol", and "decimals". All three of
    // these values are immutable: they can only be set once during
    // construction.
    constructor (
        string memory name,
        string memory symbol,
        uint8 decimals //,
        // uint256 cap
        ) public {
        _name = name;
        _symbol = symbol;
        _decimals = decimals;
        // require(cap > 0, "ERC20Capped: cap is 0");
        // _cap = cap;
    }

    // Returns the name of the token.
    function name() public view returns ( string memory ) {
        return _name;
    }

    // Returns the symbol of the token, usually a shorter version of thename.
    function symbol() public view returns ( string memory ) {
        return _symbol;
    }

    // Returns the number of decimals used to get its user representation.
    // For example, if "decimals" equals "2", a balance of "505" tokens should
    // be displayed to a user as "5,05" ("505 / 10 ** 2").
    // Tokens usually opt for a value of 18, imitating the relationship between
    // Ether and Wei.
    // > Note that this information is only used for _display_ purposes: it in
    // no way affects any of the arithmetic of the contract, including
    // "IERC20.balanceOf" and "IERC20.transfer".
    function decimals() public view returns ( uint8 ) {
        return _decimals;
    }

    // // Returns the cap on the token's total supply.
    // function cap() public view returns ( uint256 ) {
    //     return _cap;
    // }

}

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
 * @file IERC20.sol
 * @copyright SKALE Labs 2019-Present
 */

pragma solidity ^0.5.0;

// Interface of the ERC20 standard as defined in the EIP
interface IERC20 {
    // Returns the amount of tokens in existence
    function totalSupply() external view returns ( uint256 );

    // Returns the amount of tokens owned by "account"
    function balanceOf(address account) external view returns ( uint256 );

    // Moves "amount" tokens from the caller's account to "recipient".
    // Returns a boolean value indicating whether the operation succeeded.
    // Emits a "Transfer" event.
    function transfer(address recipient, uint256 amount) external returns ( bool );

    // Returns the remaining number of tokens that "spender" will be
    // allowed to spend on behalf of "owner" through "transferFrom". This is
    // zero by default.
    // This value changes when "approve" or "transferFrom" are called.
    function allowance(address owner, address spender) external view returns ( uint256 );

    // Sets "amount" as the allowance of "spender" over the caller's tokens.
    // Returns a boolean value indicating whether the operation succeeded.
    // > Beware that changing an allowance with this method brings the risk
    // that someone may use both the old and the new allowance by unfortunate
    // transaction ordering. One possible solution to mitigate this race
    // condition is to first reduce the spender's allowance to 0 and set the
    // desired value afterwards:
    // https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
    // Emits an "Approval" event.
    function approve(address spender, uint256 amount) external returns ( bool );

    // Moves "amount" tokens from "sender" to "recipient" using the
    // allowance mechanism. "amount" is then deducted from the caller's
    // allowance.
    // Returns a boolean value indicating whether the operation succeeded.
    // Emits a "Transfer" event.
    function transferFrom(address sender, address recipient, uint256 amount) external returns ( bool );

    // Emitted when "value" tokens are moved from one account ("from") to
    // another ("to").
    // Note that "value" may be zero.
    event Transfer(address indexed from, address indexed to, uint256 value);

    // Emitted when the allowance of a "spender" for an "owner" is set by
    // a call to "approve". "value" is the new allowance.
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

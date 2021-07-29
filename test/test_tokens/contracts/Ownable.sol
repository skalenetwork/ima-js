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
 * @file Ownable.sol
 * @copyright SKALE Labs 2019-Present
 */

pragma solidity ^0.5.0;

contract Ownable {
    address payable private ownerAddress;
    address[] private arrPrivileged;
    mapping( address => uint256 ) private mapPrivileged;
    constructor() public {
        ownerAddress = msg.sender;
        arrPrivileged.push(ownerAddress);
        mapPrivileged[ownerAddress] = 0;
    }
    function getOwner() public view returns ( address payable ow ) {
        return ownerAddress;
    }
    modifier onlyOwner() {
        require(msg.sender == getOwner(), "Only owner can execute this method");
        _;
    }
    function transferOwnership( address payable newOwner ) external onlyOwner {
        require(newOwner != address(0), "New owner has to be set");
        delete mapPrivileged[ownerAddress];
        ownerAddress = newOwner;
        arrPrivileged[0] = ownerAddress;
        mapPrivileged[ownerAddress] = 0;
    }

    function privilegedAdd( address a ) public onlyOwner {
        if( a == ownerAddress )
            return;
        if( mapPrivileged[a] > 0 )
            return;
        arrPrivileged.push(a);
        mapPrivileged[a] = arrPrivileged.length - 1;
    }
    function privilegedRemove( address a ) public onlyOwner {
        require(a != ownerAddress, "Cannot make owner less privileged");
        uint256 nPos = mapPrivileged[a];
        if( nPos == 0 )
            return;
        if( nPos < (arrPrivileged.length - 1) )
            arrPrivileged[nPos] = arrPrivileged[arrPrivileged.length - 1];
        arrPrivileged.length --;
    }
    function isPrivileged(address a) public view returns ( bool ) {
        if( a == ownerAddress )
            return true;
        uint256 nPos = mapPrivileged[a];
        if( nPos == 0 )
            return false;
        return true;
    }
    modifier onlyPrivileged() {
        require(isPrivileged(msg.sender), "Only privileged can execute this method");
        _;
    }

    // modifier onlyPrivileged() {
    //     require(msg.sender == getOwner(), "Only owner can execute this method");
    //     _;
    // }

}

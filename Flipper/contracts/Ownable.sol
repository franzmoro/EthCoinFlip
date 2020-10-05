// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.7.0;

contract Ownable {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
}

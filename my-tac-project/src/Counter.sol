// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract Counter {
    uint256 public number;

    event CounterSet(uint256 indexed value, address indexed sender);
    event CounterIncremented(uint256 indexed value, address indexed sender);
    event CounterDecremented(uint256 indexed value, address indexed sender);

    constructor(uint256 _initialValue) {
        number = _initialValue;
    }

    function setNumber(uint256 newNumber) public {
        number = newNumber;
        emit CounterSet(newNumber, msg.sender);
    }

    function increment() public {
        number++;
        emit CounterIncremented(number, msg.sender);
    }

    function decrement() public {
        number--;
        emit CounterDecremented(number, msg.sender);
    }

    function getNumber() public view returns (uint256) {
        return number;
    }
}

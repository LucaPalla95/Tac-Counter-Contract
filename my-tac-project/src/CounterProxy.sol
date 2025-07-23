// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Counter} from "./Counter.sol";

contract CounterProxy {
    Counter public counterContract;
    address public crossChainLayer;

    // Events for cross-chain communication
    event CrossChainCall(address indexed caller, string method, bytes data);
    event CrossChainResponse(address indexed target, bytes data);

    modifier onlyCrossChainLayer() {
        require(
            msg.sender == crossChainLayer,
            "Only cross-chain layer can call"
        );
        _;
    }

    constructor(address _counterContract, address _crossChainLayer) {
        counterContract = Counter(_counterContract);
        crossChainLayer = _crossChainLayer;
    }

    /**
     * @dev Proxy function to increment the counter
     * Called from TON with cross-chain message
     */
    function increment(
        bytes calldata tacHeader,
        bytes calldata arguments
    ) external onlyCrossChainLayer {
        emit CrossChainCall(msg.sender, "increment", arguments);

        // Increment the counter
        counterContract.increment();

        // Get the new counter value
        uint256 newValue = counterContract.getNumber();

        // Emit response event (in real implementation, this would send message back to TON)
        emit CrossChainResponse(msg.sender, abi.encode(newValue));
    }

    /**
     * @dev Proxy function to decrement the counter
     * Called from TON with cross-chain message
     */
    function decrement(
        bytes calldata tacHeader,
        bytes calldata arguments
    ) external onlyCrossChainLayer {
        emit CrossChainCall(msg.sender, "decrement", arguments);

        // Decrement the counter
        counterContract.decrement();

        // Get the new counter value
        uint256 newValue = counterContract.getNumber();

        // Emit response event
        emit CrossChainResponse(msg.sender, abi.encode(newValue));
    }

    /**
     * @dev Proxy function to set the counter to a specific value
     * Called from TON with cross-chain message
     * Arguments should contain the new value to set
     */
    function setNumber(
        bytes calldata tacHeader,
        bytes calldata arguments
    ) external onlyCrossChainLayer {
        emit CrossChainCall(msg.sender, "setNumber", arguments);

        // Decode the arguments to get the new value
        uint256 newValue = abi.decode(arguments, (uint256));

        // Set the counter to the new value
        counterContract.setNumber(newValue);

        // Get the current counter value (should be the same as newValue)
        uint256 currentValue = counterContract.getNumber();

        // Emit response event
        emit CrossChainResponse(msg.sender, abi.encode(currentValue));
    }

    /**
     * @dev Proxy function to get the current counter value
     * Called from TON with cross-chain message
     */
    function getNumber(
        bytes calldata tacHeader,
        bytes calldata arguments
    ) external onlyCrossChainLayer {
        emit CrossChainCall(msg.sender, "getNumber", arguments);

        // Get the current counter value
        uint256 currentValue = counterContract.getNumber();

        // Emit response event
        emit CrossChainResponse(msg.sender, abi.encode(currentValue));
    }

    /**
     * @dev Direct function to get counter value (for testing)
     */
    function getCounterValue() external view returns (uint256) {
        return counterContract.getNumber();
    }

    /**
     * @dev Update cross-chain layer address (only owner functionality)
     */
    function updateCrossChainLayer(address newCrossChainLayer) external {
        // In a real implementation, this would have proper access control
        crossChainLayer = newCrossChainLayer;
    }
}

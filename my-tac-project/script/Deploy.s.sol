// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/Counter.sol";
import "../src/CounterProxy.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy Counter
        Counter counter = new Counter(0);
        console.log("Counter deployed to:", address(counter));

        // Deploy TAC-enabled CounterProxy contract
        address crossChainLayer = 0x4f3b05a601B7103CF8Fc0aBB56d042e04f222ceE;
        CounterProxy counterProxy = new CounterProxy(
            address(counter),
            crossChainLayer
        );
        console.log("CounterProxy deployed to:", address(counterProxy));

        vm.stopBroadcast();

        // Log deployment info
        console.log("Deployment completed on network:", block.chainid);
        console.log("Deployer address:", vm.addr(deployerPrivateKey));
        console.log("Block number:", block.number);
    }
}

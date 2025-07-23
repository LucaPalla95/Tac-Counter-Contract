// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/Counter.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy SimpleStorage
        Counter counter = new Counter(0);
        console.log("Counter deployed to:", address(counter));

        vm.stopBroadcast();

        // Log deployment info
        console.log("Deployment completed on network:", block.chainid);
        console.log("Deployer address:", vm.addr(deployerPrivateKey));
        console.log("Block number:", block.number);
    }
}

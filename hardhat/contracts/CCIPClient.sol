// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Client } from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import { IRouterClient } from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import { IERC20 } from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/interfaces/IERC20.sol";
import {CCIPClientExample} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPClientExample.sol";
import {CCIPLocalSimulator} from "@chainlink/local/src/ccip/CCIPLocalSimulator.sol";

contract CCIPClient is CCIPClientExample {
  event ChainAdded(uint64 selector, uint256 chainId);

  struct Chain {
    address onramp;
    address router;
    uint256 id;
    uint64 selector;
  }

  uint256 public immutable CHAINID;

  uint256 public chainCount;

  mapping(uint256 => Chain) public chains;

  constructor(address router, address feeToken) 
    CCIPClientExample(IRouterClient(router), IERC20(feeToken)) {
  }

  function addChain(uint64 chainSelector, bytes memory extraArgs, address onramp, address router, uint256 id) external onlyOwner {
    chainCount++;

    Chain storage newChain = chains[chainCount];
    newChain.onramp = onramp;
    newChain.router = router;
    newChain.id = id;
    newChain.selector = chainSelector;

    s_chains[chainSelector] = extraArgs;
    emit ChainAdded(chainSelector, id);
  }


}

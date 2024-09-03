// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Client } from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import { IRouterClient } from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import { IERC20 } from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/interfaces/IERC20.sol";
import {CCIPClientExample} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPClientExample.sol";
import {CCIPLocalSimulator} from "@chainlink/local/src/ccip/CCIPLocalSimulator.sol";

// TODO: separate deelProtocol to its own file
contract deelProtocol {
  event JobAdded(address owner, uint256 id);

  struct Job {
    address owner;
    address taker;
    address feeToken;
    address currency;
    uint256 value;
    uint64 origin;
    uint64 destiny;
    uint8 status;
  }

  uint256 public jobCount;

  mapping(uint256 => Job) public jobs;

  // Publish job on supported chain
  function addJob(address feeToken, address currency, uint256 value) external {
    jobCount++;

    Job storage newJob = jobs[jobCount];
    newJob.owner = msg.sender;
    newJob.feeToken = feeToken;
    newJob.currency = currency;
    newJob.value = value;
    newJob.origin;

    emit JobAdded(msg.sender, jobCount);
  }

  function takeJob() external {
    // TODO: takeToken
    // newJob.destiny;  // get taker chain id
    // newJob.status = 0;
  }

}

contract CCIPClient is CCIPClientExample, deelProtocol {
  event ChainAdded(uint64 selector, uint256 chainId);

  struct Chain {
    address onramp;
    address router;
    uint256 id;
    uint64 selector;
  }

  uint256 public chainCount;
  uint256 public chainId;

  mapping(uint256 => Chain) public chains;

  constructor(address router, address feeToken) 
    CCIPClientExample(IRouterClient(router), IERC20(feeToken)) {

    chainId = block.chainid;
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

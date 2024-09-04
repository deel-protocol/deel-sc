// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Client } from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import { IRouterClient } from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import { IERC20 } from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/interfaces/IERC20.sol";
import {CCIPClientExample} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPClientExample.sol";
import {CCIPLocalSimulator} from "@chainlink/local/src/ccip/CCIPLocalSimulator.sol";

import "hardhat/console.sol";

// TODO: separate DeelProtocol to its own file
// TODO: resolve owner
contract DeelProtocol {

  enum Status {
    NOT_CREATED,
    TAKEABLE,
    TAKEN,
    DELIVERED,
    PAID,
    CLOSED
  }

  struct Job {
    address owner;
    address taker;
    address feeToken;
    address currency;
    uint256 value;
    uint256 originChain;
    uint256 destinyChain;
    Status status;
  }

  uint256 public jobCount;

  mapping(uint256 => Job) public jobs;

  error InvalidJob();
  error IncorrectJobStatus(uint8 status);

  event JobAdded(uint256 indexed id, address indexed owner);
  event JobTaken(uint256 indexed id, address indexed taker);

  // Publish job on supported chain
  function addJob(address feeToken, address currency, uint256 value) external {

    // TODO: check if job is available on other chains 

    Job storage newJob = jobs[jobCount];
    newJob.owner = msg.sender;
    newJob.feeToken = feeToken;
    newJob.currency = currency;
    newJob.value = value;
    newJob.originChain = block.chainid;

    // Todo, transfer fees and funds to protocol
    // IERC20(feeToken).transferFrom(msg.sender, FEES_VAULT, JOB_POSTING_FEE_AMOUNT);
    // IERC20(currency).transferFrom(msg.sender, FEES_VAULT, value);

    emit JobAdded(jobCount, msg.sender);
    jobCount++;
  }

  function takeJob(uint256 jobId) external {

    if(jobId < jobCount) revert InvalidJob();

    Job storage job = jobs[jobId];
    if(job.status != Status.TAKEABLE) revert IncorrectJobStatus(0);

    job.taker = msg.sender;
    job.destinyChain = block.chainid;
    job.status = Status.TAKEN;

    // TODO: send message to origin chain
    if(job.originChain != block.chainid) {
      // Message job taken
    }

  }

  function listJobs(uint256 startPosition, uint256 size) public view returns (Job[] memory) {
        require(startPosition < jobCount, "Start position out of bounds");

        uint256 endPosition = startPosition + size;
        if (endPosition > jobCount) {
            endPosition = jobCount;
        }

        uint256 resultLength = endPosition - startPosition;

        Job[] memory result = new Job[](resultLength); 

        for (uint256 i = 0; i < resultLength; i++) {
            result[i] = jobs[startPosition + i];
        }

        return result;
    }


}

contract CCIPClient is CCIPClientExample, DeelProtocol {
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

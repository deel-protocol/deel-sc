// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.19;

import { Client } from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import { IRouterClient } from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import { IERC20 } from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/interfaces/IERC20.sol";
// import {CCIPClientExample} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPClientExample.sol";
import {CCIPLocalSimulator} from "@chainlink/local/src/ccip/CCIPLocalSimulator.sol";
import {CCIPReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";

import {ISP} from "@ethsign/sign-protocol-evm/src/interfaces/ISP.sol";
import {Attestation} from "@ethsign/sign-protocol-evm/src/models/Attestation.sol";
import {DataLocation} from "@ethsign/sign-protocol-evm/src/models/DataLocation.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

// import "hardhat/console.sol";

// TODO: separate DeelProtocol to its own file
// TODO: resolve owner
contract DeelProtocol is CCIPReceiver, Ownable {
  error InvalidConfig();
  error InvalidChain(uint64 chainSelector);

  event MessageSent(bytes32 messageId);
  event MessageReceived(bytes32 messageId);
  event didAttestWork(address poster, address worker, uint64 attestationId);

  enum Status {
    NOT_CREATED,
    TAKEABLE,
    TAKEN,
    DELIVERED,
    PAID,
    CLOSED
  }

  enum Actions {
    APPLY,
    ASSIGN,
    DELIVER,
    QUIT,
    CLAIM
  }

  struct Reputation {
    uint256 posted;
    uint256 applied;
    uint256 assigned;
    uint256 delivered;
    uint256 unfulfiled;
  }

  struct Job {
    address owner;
    address taker;
    address feeToken;
    address currency;
    uint256 value;
    uint256 originChain;
    uint256 destinyChain;
    uint256 applicantCount;
    Status status;
  }
  struct JobApplication {
    address worker;
    uint256 chainSelector;
  }

  uint256 public constant MAIN_CHAINID = 84532; // Eth Sepolia
  uint64 public constant MAIN_CHAIN_SELECTOR = 10344971235874465080; // Eth Sepolia
  uint256 public constant JOB_POSTING_FEE_AMOUNT = 43000000000000; // ~ .1 usd

  address public immutable MAIN_CONTRACT_ADDRESS;
  address public immutable FEES_VAULT;
  uint256 public jobCount;
  uint256 public chainid;
  uint64 public chainSelector;
  IERC20 public s_feeToken;
  ISP public spInstance;
  uint64 public schemaId;

  mapping(uint64 destChainSelector => bytes extraArgsBytes) public s_chains;
  mapping(uint256 => Job) public jobs;
  mapping(address => Reputation) public reputation;
  mapping(address => bytes) public arweaveHash;
  mapping(address worker => address poster) public jobCompletion;


  // mapping(uint256 => JobApplication) public jobApplications;

  mapping(uint256 => address[]) public applicationSenders;
  mapping(uint256 => uint64[]) public applicationChainSeletor;

  
  error InvalidJob();
  error IncorrectJobStatus(uint8 status);

  event JobAdded(uint256 indexed id, address indexed owner);
  event JobTaken(uint256 indexed id, address indexed taker);

  modifier notMainCahin() {
    require(block.chainid != MAIN_CHAINID, "Not main chain");
    _;
  }

  modifier onlyOnMainChain() {
    // TODO: enforce chain check
    // require(block.chainid == MAIN_CHAINID, "Not main chain");
    _;
  }

  constructor(address router, address feeToken, uint64 _chainSelector, address main )
    CCIPReceiver(address(router))
    Ownable(msg.sender) {

    MAIN_CONTRACT_ADDRESS = main;
    chainid = block.chainid;
    chainSelector = _chainSelector;


    s_feeToken = IERC20(feeToken);
    // s_feeToken.approve(address(router), type(uint256).max);
    FEES_VAULT  = address(this);
  }

  function onChildChain() public view returns(bool) {
    return (chainid != MAIN_CHAINID);
  }

  function overrideChainid(uint256 _chainId) external {
    chainid = _chainId;
  }

  function createDeelId(bytes calldata _arwavehash) public onlyOnMainChain {
   arweaveHash[msg.sender] = _arwavehash;
  }

  // Publish job on supported chain
  function addJob(address feeToken, address currency, uint256 value) external onlyOnMainChain() {

    // TODO: check if job is available on other chains 
    // TODO: allowed on main chain

    Job storage newJob = jobs[jobCount];
    newJob.owner = msg.sender;
    newJob.feeToken = feeToken;
    newJob.currency = currency;
    newJob.value = value;
    newJob.originChain = block.chainid; // TODO: use chain selectors

    // Todo, transfer fees and funds to protocol

    IERC20(feeToken).transferFrom(msg.sender, FEES_VAULT, JOB_POSTING_FEE_AMOUNT);
    IERC20(currency).transferFrom(msg.sender, FEES_VAULT, value);


    emit JobAdded(jobCount, msg.sender);
    jobCount++;

    reputation[msg.sender].posted += 1;
  }

    function _ccipReceive(Client.Any2EVMMessage memory message) internal override {

    (Actions action, bytes memory payload) = abi.decode(message.data, (Actions, bytes));

    if(action == Actions.APPLY) { _recieveJobApplicationMessage(message, payload);  return;}
    if(action == Actions.ASSIGN) { _recieveAplicationSelectionMessage(message, payload);  return;}
    if(action == Actions.DELIVER) { _recieveJobDeliverMessage(message, payload);  return;}
    // if(action == Actions.DELIVER) { _recieveDeliverJobMessage(message, payload);  return;}
    // if(action == Actions.CLAIM) { _recieveClaimJobMessage(message, payload);  return;}
    // if(action == Actions.QUIT) { _recieveQuitJobMessage(message, payload);  return;}


    // QUIT,
    // CLAIM


    emit MessageReceived(message.messageId);
  }

  ///////////////////
  // JOB Application
  ///////////////////

  function applyForJob(uint256 jobId) external {

    if(onChildChain()) {
      bytes memory payload = abi.encodePacked(jobId, msg.sender, chainSelector);
      bytes memory message = abi.encodePacked(Actions.APPLY, payload);
      _sendDataPayFeeToken(MAIN_CHAIN_SELECTOR, abi.encode(MAIN_CONTRACT_ADDRESS), message);
    }else{
      _saveJobApplication(jobId, msg.sender, chainSelector);
    }

  }


  function _recieveJobApplicationMessage(Client.Any2EVMMessage memory message, bytes memory payload) internal {

    (uint256 jobId, address sender, uint64 _chainSelector) = abi.decode(payload, (uint256, address, uint64));
    // (string memory action, uint256 jobId, address sender) = abi.decode(data, (string, uint256, address));
    _saveJobApplication(jobId, sender, _chainSelector);
  }

  function _saveJobApplication(uint256 jobId, address _sender, uint64 _chainSelector) internal {

    if(jobCount < jobId) revert InvalidJob();

    // jobApplications[jobId] = new JobApplication(_sender, _chainSelector);

    applicationSenders[jobId].push(_sender);
    applicationChainSeletor[jobId].push(_chainSelector);

    jobs[jobId].applicantCount += 1;
    reputation[_sender].applied += 1;

  }

  ///////////////////////////
  // JobApplication Selected
  ///////////////////////////

  function selectApplicant(uint256 jobId) external {

    if(onChildChain()) {
      bytes memory payload = abi.encodePacked(jobId, msg.sender, chainSelector);
      bytes memory message = abi.encodePacked(Actions.APPLY, payload);
      _sendDataPayFeeToken(MAIN_CHAIN_SELECTOR, abi.encode(MAIN_CONTRACT_ADDRESS), message);
    }else{
      _saveAplicationSelection(jobId, msg.sender, chainSelector);
    }

  }
  function _recieveAplicationSelectionMessage(Client.Any2EVMMessage memory message, bytes memory payload) internal {

    (uint256 jobId, address sender, uint64 _chainSelector) = abi.decode(payload, (uint256, address, uint64));
    _saveAplicationSelection(jobId, sender, _chainSelector);
  }

  function _saveAplicationSelection(uint256 jobId, address sender, uint64 _chainSelector) internal {

    Job storage job = jobs[jobId];
    if(job.status != Status.TAKEABLE) revert IncorrectJobStatus(0);

    job.taker = sender;
    job.destinyChain = _chainSelector;
    job.status = Status.TAKEN;
    reputation[sender].assigned += 1;

    // TODO: send message to origin chain

  }

  ///////////////////////////
  // Job deliver
  ///////////////////////////


  function deliverWork(
    uint256 jobId,
    string memory jobTitle
  ) external {

    if(onChildChain()) {
      bytes memory payload = abi.encodePacked(jobId, msg.sender, chainSelector, jobTitle);
      bytes memory message = abi.encodePacked(Actions.DELIVER, payload);
      _sendDataPayFeeToken(MAIN_CHAIN_SELECTOR, abi.encode(MAIN_CONTRACT_ADDRESS), message);
    }else{
      _saveJobDeliver(jobId, msg.sender, chainSelector, jobTitle);
    }

  }

  function _saveJobDeliver(
    uint256 jobId,
    address sender,
    uint64 _chainSelector,
    string memory jobTitle
  ) internal {

    Job storage job = jobs[jobId];

    require(job.taker == sender, "Worker is not selected applicang");
    if(job.status != Status.TAKEN || job.status != Status.DELIVERED) revert IncorrectJobStatus(0);

    job.status = Status.DELIVERED;
    reputation[sender].delivered += 1;

    uint64 attestationID = attestCompletedWork(job.owner, job.taker, jobTitle, job.value);

  }

  function _recieveJobDeliverMessage(
    Client.Any2EVMMessage memory message,
    bytes memory payload
  ) internal {

    (
      uint256 jobId,
      address sender,
      uint64 _chainSelector,
      string memory jobTitle
    ) = abi.decode(payload, (uint256, address, uint64, string));

    _saveJobDeliver(jobId, sender, chainSelector, jobTitle);
  }

  function _saveJobDeliverMessage(uint256 jobId, address sender, uint64 _chainSelector) internal {
    Job storage job = jobs[jobId];
    require(job.taker == sender, "Invalid Job deliverer");
    require(job.status == Status.TAKEN || job.status == Status.DELIVERED, "Unvalid Job Status");
    job.status = Status.DELIVERED;

  }


  ///////////////////////////
  // Listing
  ///////////////////////////


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


  function getJobApplications(uint256 jobId, uint256 startPosition, uint256 size) public view returns (
    uint256 applicationsCount,
    address[] memory applicants,
    uint64[] memory chainSelectors
  ) {

    Job memory _job = jobs[jobId];
    applicationsCount = _job.applicantCount;

    require(startPosition < applicationSenders[jobId].length, "Start position out of bounds");

    uint256 endPosition = startPosition + size;
    if (endPosition > applicationsCount) {
      endPosition = applicationsCount;
    }

    uint256 resultLength = endPosition - startPosition;

    applicants = new address[](resultLength); 
    chainSelectors = new uint64[](resultLength); 

    for (uint256 i = 0; i < resultLength; i++) {

      applicants[i] = applicationSenders[jobId][startPosition + i];
      chainSelectors[i] = applicationChainSeletor[jobId][startPosition + i];
    }

  }

  function attestCompletedWork(
    address owner,
    address worker,
    string memory jobTitle,
    uint256 price
  ) public  returns(uint64) {

    bytes memory data = abi.encode(owner, worker, jobTitle, price);

    bytes[] memory recipients = new bytes[](2);
    recipients[0] = abi.encode(owner);
    recipients[1] = abi.encode(worker);

    Attestation memory a = Attestation({
      schemaId: schemaId,
      linkedAttestationId: 0,
      attestTimestamp: 0,
      revokeTimestamp: 0,
      attester: address(this),
      validUntil: 0,
      dataLocation: DataLocation.ONCHAIN,
      revoked: false,
      recipients: recipients,
      data: data // SignScan assumes this is from `abi.encode(...)`
    });
    uint64 attestationId = spInstance.attest(a, "", "", "");
    return attestationId;
  }

  function setSPInstance(address instance) external onlyOwner {
    spInstance = ISP(instance);
  }

  function setSchemaID(uint64 schemaId_) external onlyOwner {
    schemaId = schemaId_;
  }


  /// @notice sends data to receiver on dest chain. Assumes address(this) has sufficient feeToken.
  function _sendDataPayFeeToken(
    uint64 destChainSelector,
    bytes memory receiver,
    bytes memory data
  ) internal  {
  // TODO: 
  // ) external validChain(destChainSelector) {

    Client.EVMTokenAmount[] memory tokenAmounts = new Client.EVMTokenAmount[](0);
    Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
      receiver: receiver,
      data: data,
      tokenAmounts: tokenAmounts,
      extraArgs: s_chains[destChainSelector],
      feeToken: address(s_feeToken)
    });
    // Optional uint256 fee = i_ccipRouter.getFee(destChainSelector, message);
    // Can decide if fee is acceptable.
    // address(this) must have sufficient feeToken or the send will revert.
    bytes32 messageId = IRouterClient(i_ccipRouter).ccipSend(destChainSelector, message);
    emit MessageSent(messageId);
  }

}

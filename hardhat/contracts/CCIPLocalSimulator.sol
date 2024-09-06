// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// import {Test, console2} from "forge-std/Test.sol";

import {IRouterClient, WETH9, LinkToken, BurnMintERC677Helper} from "@chainlink/local/src/ccip/CCIPLocalSimulator.sol";
import {CCIPLocalSimulator} from "@chainlink/local/src/ccip/CCIPLocalSimulator.sol";

contract Demo {
  CCIPLocalSimulator public ccipLocalSimulator;

  // Struct Chain { uint256 chainId; };

  address router;
  address linkToken;
  uint256 destinyChainSelector;

  function setUp() public {
    ccipLocalSimulator = new CCIPLocalSimulator();

    (
      uint64 chainSelector,
      IRouterClient sourceRouter,
      IRouterClient destinationRouter,
      WETH9 wrappedNative,
      LinkToken linkToken,
      BurnMintERC677Helper ccipBnM,
      BurnMintERC677Helper ccipLnM
    ) = ccipLocalSimulator.configuration();

    string memory someText = "Hello World";

    address sender = address(0);

    // reciever.allowlistSender(address(sender), true);
    // bytes messageId = sender.send(address(reciever), someText, destinantionChainSelector, address(ccipBnMToken), amountToSend);
    // string memory receivedText = receiver.text();

    // assertEq(receivedText, someText);

    // TODO: parametrize faucet call
    // ccipLocalSimulator.requestLinkFromFaucet(receiver, amount);
  }
}

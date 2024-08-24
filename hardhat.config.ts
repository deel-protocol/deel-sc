import * as dotenv from "dotenv";
dotenv.config();

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

import "@nomicfoundation/hardhat-chai-matchers";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
//import "@nomiclabs/hardhat-solhint";
import "hardhat-contract-sizer";
import "hardhat-watcher";
import "hardhat-abi-exporter";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      // allowUnlimitedContractSize: true,
      forking: {
        url: `https://opt-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      },
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      //accounts: { mnemonic: process.env.MNEMONIC },
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
    },
    opsepolia: {
      url: `https://opt-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
    },
    optimism_sepolia: {
      url: `https://opt-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      gasPrice: 500,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
    },
  },
  watcher: {
    compilation: {
      tasks: ["compile"],
    },
    // test: {
    //   tasks: [{ command: "test", params: { testFiles: ["{path}"], bail: true } }],
    //   files: ["./test/**/*"],
    //   verbose: true,
    // },
    buildtest: {
      tasks: [
        "compile",
        { command: "test", params: { parallel: false, bail: false } },
      ],
      files: ["./test/**/*", "./contracts/**/*"],
      verbose: true,
      clearOnStart: true,
      // start: string; // Run any desirable command each time before the task runs
      runOnLaunch: true,
    },
  },
  abiExporter: {
    path: "abis",
    runOnCompile: true,
    clear: true,
    flat: true,
    only: [
      "Kinto"
    ],
    spacing: 2,
    pretty: false,
    // format: "minimal"
  },
  etherscan: {
    apiKey: `${process.env.ETHERSCAN_API_KEY}`,
    customChains: [
      {
        network: "optimism_sepolia",
        chainId: 11155420,
        urls: {
          apiURL: "https://api-sepolia-optimistic.etherscan.io/api",
          browserURL: "https://sepolia-optimism.etherscan.io/",
        },
      },
    ],
  },
  verify: {
    etherscan: {
      apiKey: `${process.env.ETHERSCAN_API_KEY}`,
    },
  },
  sourcify: {
    enabled: true,
  },
};

export default config;

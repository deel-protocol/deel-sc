import * as dotenv from "dotenv";
dotenv.config();
import { HardhatUserConfig } from "hardhat/config";

import "@nomicfoundation/hardhat-chai-matchers";
import "@nomicfoundation/hardhat-ethers";
//import "@nomicfoundation/hardhat-foundry";
import "@nomicfoundation/hardhat-ignition";
import "@nomicfoundation/hardhat-verify";
import "@typechain/hardhat";
import "hardhat-abi-exporter";
import "hardhat-deploy";
import "hardhat-deploy-ethers";
import "hardhat-gas-reporter";
import "hardhat-watcher";
import "solidity-coverage";

// If not set, it uses ours Alchemy's default API key.
// You can get your own at https://dashboard.alchemyapi.io
const providerApiKey = process.env.ALCHEMY_API_KEY || "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF";
// If not set, it uses the hardhat account 0 private key.
const deployerPrivateKey =
  process.env.DEPLOYER_PRIVATE_KEY ?? "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
// If not set, it uses ours Etherscan default API key.
const etherscanApiKey = process.env.ETHERSCAN_API_KEY || "DNXJA8RX2Q3VZ4URQIWP7Z68CJXQZSC6AW";

const basescanApiKey = process.env.BASESCAN_API_KEY;

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.1",
      },
      {

        version: "0.8.24",
        settings: {
          optimizer: {
            enabled: true,
            // https://docs.soliditylang.org/en/latest/using-the-compiler.html#optimizer-options
            runs: 200,
          },

        },
      }
    ],
  },
  //defaultNetwork: "localhost",
  namedAccounts: {
    deployer: {
      // By default, it will take the first Hardhat account as the deployer
      default: 0,
    },
  },
  networks: {
    // View the networks that are pre-configured.
    // If the network you are looking for is not here you can add new network settings
    hardhat: {
      forking: {
        url: `https://eth-mainnet.alchemyapi.io/v2/${providerApiKey}`,
        enabled: process.env.MAINNET_FORKING_ENABLED === "true",
      },
    },
    //mainnet: {
    //  url: `https://eth-mainnet.alchemyapi.io/v2/${providerApiKey}`,
    //  accounts: [deployerPrivateKey],
    //},
    //arbitrum: {
    //  url: `https://arb-mainnet.g.alchemy.com/v2/${providerApiKey}`,
    //  accounts: [deployerPrivateKey],
    //},
    //optimism: {
    //  url: `https://opt-mainnet.g.alchemy.com/v2/${providerApiKey}`,
    //  accounts: [deployerPrivateKey],
    //},
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`,
      accounts: [deployerPrivateKey],
    },
    arbitrumSepolia: {
      url: `https://arb-sepolia.g.alchemy.com/v2/${providerApiKey}`,
      accounts: [deployerPrivateKey],
    },
    optimismSepolia: {
      url: `https://opt-sepolia.g.alchemy.com/v2/${providerApiKey}`,
      accounts: [deployerPrivateKey],
    },
    //polygon: {
    //  url: `https://polygon-mainnet.g.alchemy.com/v2/${providerApiKey}`,
    //  accounts: [deployerPrivateKey],
    //},
    //polygonMumbai: {
    //  url: `https://polygon-mumbai.g.alchemy.com/v2/${providerApiKey}`,
    //  accounts: [deployerPrivateKey],
    //},
    //polygonZkEvm: {
    //  url: `https://polygonzkevm-mainnet.g.alchemy.com/v2/${providerApiKey}`,
    //  accounts: [deployerPrivateKey],
    //},
    //polygonZkEvmTestnet: {
    //  url: `https://polygonzkevm-testnet.g.alchemy.com/v2/${providerApiKey}`,
    //  accounts: [deployerPrivateKey],
    //},
    //gnosis: {
    //  url: "https://rpc.gnosischain.com",
    //  accounts: [deployerPrivateKey],
    //},
    //chiado: {
    //  url: "https://rpc.chiadochain.net",
    //  accounts: [deployerPrivateKey],
    //},
    //base: {
    //  url: "https://mainnet.base.org",
    //  accounts: [deployerPrivateKey],
    //},
    baseSepolia: {
      url: "https://sepolia.base.org",
      accounts: [deployerPrivateKey],
    },
    //scrollSepolia: {
    //  url: "https://sepolia-rpc.scroll.io",
    //  accounts: [deployerPrivateKey],
    //},
    //scroll: {
    //  url: "https://rpc.scroll.io",
    //  accounts: [deployerPrivateKey],
    //},
    //pgn: {
    //  url: "https://rpc.publicgoods.network",
    //  accounts: [deployerPrivateKey],
    //},
    //pgnTestnet: {
    //  url: "https://sepolia.publicgoods.network",
    //  accounts: [deployerPrivateKey],
    //},
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
      "CCIPClient",
      "DeelProtocol",
      "Kinto",
    ],
    spacing: 2,
    pretty: false,
    // format: "minimal"
  },
  // configuration for harhdat-verify plugin
  etherscan: {
    apiKey: {
      "baseSepolia": `${basescanApiKey}`,
      "sepolia": `${etherscanApiKey}`,
    },
    customChains: [
      {
        network: "optimismSepolia",
        chainId: 11155420,
        urls: {
          apiURL: "https://api-sepolia-optimistic.etherscan.io/api",
          browserURL: "https://sepolia-optimism.etherscan.io/",
        },
      },
      //{
      //  network: "baseSepolia",
      //  chainId: 84532,
      //  urls: {
      //    apiURL: "https://api-sepolia-optimistic.etherscan.io/api",
      //    browserURL: "https://sepolia-optimism.etherscan.io/",
      //  },
      //},
    ],
  },
  // configuration for etherscan-verify from hardhat-deploy plugin
  verify: {
    etherscan: {
      apiKey: `${etherscanApiKey}`,
    },
  },
  sourcify: {
    enabled: true,
  },
};

export default config;

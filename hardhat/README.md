# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.ts
```

## Chainlink Lanes

CCIP Documentation: https://docs.chain.link/ccip
Chainlink Faucet: https://chain.link/faucets
Local Simulator: https://github.com/smartcontractkit/chainlink-local

Complete list of testnet Lanes: https://docs.chain.link/ccip/supported-networks/v1_2_0/testnet

### Lanes on Sepolia testnet

| Router address | 0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59 |
| ---            | ---                                        |
| Chain selector | 16015286601757825753                       |
| Chain id       | 11155111                                   |
| Fee tokens     | LINK, WETH, ETH                            |

#### Arbitrum testnet

| Parameter                  | Value                                      |
| ---                        | ---                                        |
| OnRamp address             | 0xe4Dd3B16E09c016402585a8aDFdB4A18f772a07e |
| Destination chain selector | 3478487238524512106                        |

| Aggregate Rate Limit | Value                          |
| ---                  | ---                            |
| Capacity             | 1,000,000,000,000,000,000 USD  |
| Refill rate          | 1000000000000000000 USD/second |

Transferable tokens
| Symbol   | Token Address                              | Decimals | Mechanism   | Rate Limit Capacity | Rate Limit Refill Rate |
| ---      | ---                                        | ---      | ---         | ---                 | ---                    |
| CCIP-BnM | 0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05 | 18       | Burn & Mint | 100,000 CCIP-BnM    | 167 CCIP-BnM/second    |
| CCIP-LnM | 0x466D489b6d36E7E3b824ef491C225F5830E81cC1 | 18       | Lock & Mint | 100,000 CCIP-LnM    | 167 CCIP-LnM/second    |
| GHO      | 0xc4bF5CbDaBE595361438F8c6a187bDc330539c60 | 18       | Lock & Mint | N/A                 | N/A                    |
| USDC     | 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238 | 6        | Burn & Mint | 100,000 USDC        | 167 USDC/second        |

#### Base Sepolia

| Parameter                  | Value                                      |
| ---                        | ---                                        |
| OnRamp address             | 0x2B70a05320cB069e0fB55084D402343F832556E7 |
| Destination chain selector | 10344971235874465080                       |

| Aggregate Rate Limit | Value          |
| ---                  | ---            |
| Capacity             | 100,000 USD    |
| Refill rate          | 167 USD/second |

Transferable tokens
| Symbol   | Token Address                              | Decimals | Mechanism       | Rate Limit Capacity | Rate Limit Refill Rate |
| ---      | ---                                        | ---      | ---             | ---                 | ---                    |
| CCIP-BnM | 0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05 | 18       | Burn & Mint     | 100,000 CCIP-BnM    | 167 CCIP-BnM/second    |
| CCIP-LnM | 0x466D489b6d36E7E3b824ef491C225F5830E81cC1 | 18       | Lock & Mint     | 100,000 CCIP-LnM    | 167 CCIP-LnM/second    |
| GHO      | 0xc4bF5CbDaBE595361438F8c6a187bDc330539c60 |          | 18	Lock & Mint | N/A                  | N/A                    |
| USDC     | 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238 | 6        | Burn & Mint     | 100,000 USDC        | 167 USDC/second        |

#### Optimism Sepolia testnet

| Parameter                  | Value                                      |
| ---                        | ---                                        |
| OnRamp address             | 0x69CaB5A0a08a12BaFD8f5B195989D709E396Ed4d |
| Destination chain selector | 5224473277236331295                        |

| Aggregate Rate Limit | Value          |
| ---                  | ---            |
| Capacity             | 100,000 USD    |
| Refill rate          | 167 USD/second |

Transferable tokens
| Symbol   | Token Address                              | Decimals | Mechanism   | Rate Limit Capacity | Rate Limit Refill Rate |
| ---      | ---                                        | ---      | ---         | ---                 | ---                    |
| CCIP-BnM | 0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05 | 18       | Burn & Mint | 100,000 CCIP-BnM    | 167 CCIP-BnM/second    |
| CCIP-LnM | 0x466D489b6d36E7E3b824ef491C225F5830E81cC1 | 18       | Lock & Mint | 100,000 CCIP-LnM    | 167 CCIP-LnM/second    |
| USDC     | 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238 | 6        | Burn & Mint | 100,000 USDC        | 167 USDC/second        |


#### BNB Chain testnet

| Parameter                  | Value                                      |
| ---                        | ---                                        |
| OnRamp address             | 0xD990f8aFA5BCB02f95eEd88ecB7C68f5998bD618 |
| Destination chain selector | 13264668187771770619                       |

| Aggregate Rate Limit | Value          |
| ---                  | ---            |
| Capacity             | 100,000 USD    |
| Refill rate          | 167 USD/second |

Transferable tokens
| Symbol   | Token Address                              | Decimals | Mechanism   | Rate Limit Capacity | Rate Limit Refill Rate |
| ---      | ---                                        | ---      | ---         | ---                 | ---                    |
| CCIP-BnM | 0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05 | 18       | Burn & Mint | 100,000 CCIP-BnM    | 167 CCIP-BnM/second    |
| CCIP-LnM | 0x466D489b6d36E7E3b824ef491C225F5830E81cC1 | 18       | Lock & Mint | 100,000 CCIP-LnM    | 167 CCIP-LnM/second    |




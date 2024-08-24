import * as dotenv from "dotenv";
dotenv.config();
import { ethers } from "hardhat";

// Define constants for constructor arguments
const MY_TOKEN_INITIAL_SUPPLY = ethers.parseUnits("1000000", 18); // 1 million tokens with 18 decimals
const WORLD_VERIFY_EXTERNAL_NULLVERIFIER = 1234567;
let VERIFYING_COMMAND;
let NETWOWRK_NAME;

let ADDRESS_OP_SEPO_WORLD_ID_ROUTER =
  process.env.ADDRESS_OP_SEPO_WORLD_ID_ROUTER;
let WORLDID_APP_ID = process.env.WORLDID_APP_ID;
let WORLDID_ACTION_ID = process.env.WORLDID_ACTION_ID;
let DAO_QUORUM = 3;
let VOTING_PERIOD = 691200; // 8 days

async function main() {
  NETWOWRK_NAME = ethers.provider._networkName;
  VERIFYING_COMMAND = "npx hardhat verify --network " + NETWOWRK_NAME;

  console.log("Deploying contracts on ", NETWOWRK_NAME);

  // Deploy Kinto contract
  const Kinto = await ethers.getContractFactory("Kinto");
  const kinto = await Kinto.deploy();
  await kinto.waitForDeployment();
  console.log("Kinto deployed to:", kinto.target);

  console.log("\n", "----------------------------------");
  console.log("Verification commands:");
  console.log("\n", "Kinto");
  console.log( VERIFYING_COMMAND, ` ${kinto.target} `);


  console.log("----------------------------------", "\n");

  if (ethers.provider._networkName == "optimism_sepolia") {

    console.log("Verifying My Token");
    await hre.run("verify:verify", {
      address: kinto.target,
    });

  } else {
    console.log("Network is not Optimism Sepolia. Skipping verification");
  }

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

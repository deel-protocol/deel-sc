import * as dotenv from "dotenv";
dotenv.config();
import { ethers } from "hardhat";

let chainData: {
baseSepolia:{
  router:0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93,
  onRampRouter:"",
  feeToken: 0xE4aB69C077896252FAFBD49EFD26B5D171A32410,
  selector:10344971235874465080,
  chainid:84532,
},
sepolia: {
  router:0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59,
  onRampRouter:0x6486906bB2d85A6c0cCEf2A2831C11A2059ebfea,
  selector:16015286601757825753,
  chainid:11155111,
},
arbitrumSepolia: {
  router:0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165,
  onRampRouter:0x58622a80c6DdDc072F2b527a99BE1D0934eb2b50
  selector:3478487238524512106,
  chainid:421614,
 }
}

async function main() {
  //NETWORK_NAME = 
  let chainName = ethers.provider._networkName;

  console.log(chainName);


  const DeelProtocol = await ethers.getContractFactory("DeelProtocol");

  const deel = await DeelProtocol.deploy(
    hre.ethers.zeroAddress,
    hre.ethers.zeroAddress,
    "10344971235874465080",
    hre.ethers.zeroAddress
  );

  //const deel = await DeelProtocol.deploy(
  //  "0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93",
  //  "0xE4aB69C077896252FAFBD49EFD26B5D171A32410",
  //  "10344971235874465080",
  //  hre.ethers.zeroAddress
  //);


  await deel.waitForDeployment();

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

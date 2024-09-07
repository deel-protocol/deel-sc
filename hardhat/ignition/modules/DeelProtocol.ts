import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DeelProtocolModule = buildModule("DeelProtocolModule", (m) => {

  const router = '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59';
  const feeToken = '0x779877A7B0D9E8603169DdbD7836e478b4624789';
  const chainSelector = 16015286601757825753n;

  const deelProtocol = m.contract("DeelProtocol", [router, feeToken, chainSelector] );

  return { deelProtocol };
});

export default DeelProtocolModule;

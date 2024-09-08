import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DeelProtocolModule = buildModule("DeelProtocolModule", (m) => {

  const router = '0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93';
  const feeToken = '0xE4aB69C077896252FAFBD49EFD26B5D171A32410';
  const chainSelector = 10344971235874465080n;

  const deelProtocol = m.contract("DeelProtocol", [router, feeToken, chainSelector, router] );

  return { deelProtocol };
});

export default DeelProtocolModule;

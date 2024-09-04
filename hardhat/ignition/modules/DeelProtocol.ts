import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DeelProtocolModule = buildModule("DeelProtocolModule", (m) => {

  const deelProtocol = m.contract("DeelProtocol");

  return { deelProtocol };
});

export default DeelProtocolModule;

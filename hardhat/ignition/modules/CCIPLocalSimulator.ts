import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const CCIPLocalSimulatorModule = buildModule("CCIPLocalSimulator", (m) => {

  const ccipLocalSimulator = m.contract("CCIPLocalSimulator");

  return { ccipLocalSimulator };
});

export default CCIPLocalSimulatorModule;

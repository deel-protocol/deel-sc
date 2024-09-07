import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";

//CCIPSimulator

let zeroAddress = ethers.ZeroAddress;

let owner;
let boss1Address;
let worker1Address;

let jobValue1  = ethers.parseUnits("1000", 18); // 1 Thousand tokens

let routerAddress;
let feeTokenAddress;

let networks = [
  {
    chainId: 11155111,
    selector: 16015286601757825753n,
    routerAddress:"",
    isMain: true,
  },
  {
    chainId: 11155111,
    selector: 16015286601757825753n,
    routerAddress:"",
    isMain: true,
  },
]

//await expect().not.to.be.reverted;
//await expect().to.be.revertedWith();
//await expect();
//expect().to.equal();
//await expect(contract.call()).to.be.revertedWithCustomError( contract, "SomeCustomError");
// contract CCIPSimulator is CCIPLocalSimulator {

describe("DeelProtocol", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function stockDeployment() {
    const [owner, boss1Address, worker1Address ] = await hre.ethers.getSigners();

    const CCIP = await hre.ethers.getContractFactory("CCIPSimulator");
    const ccip = await CCIP.deploy();
    let ccipConfig = await ccip.configuration();

    const Deel = await hre.ethers.getContractFactory("DeelProtocol");
    const deel = await Deel.deploy(ccipConfig[1], ccipConfig[4], networks[0].chainId);

    return { deel, owner, boss1Address, worker1Address };
  }

  async function populateJobs() {
    const [owner, boss1Address, worker1Address ] = await hre.ethers.getSigners();

    const CCIP = await hre.ethers.getContractFactory("CCIPSimulator");
    const ccip = await CCIP.deploy();
    let ccipConfig = await ccip.configuration();

    const Deel = await hre.ethers.getContractFactory("DeelProtocol");
    const deel = await Deel.deploy(ccipConfig[1], ccipConfig[4], networks[0].chainId);

    for( let i = 0; i < 10; i++) {
      let newValue = jobValue1 + BigInt(i);
      await deel.connect(boss1Address).addJob(zeroAddress, zeroAddress, newValue);
    }

    let jobCount = await deel.jobCount();

    return { deel, owner, boss1Address, worker1Address, jobCount};
  }


  describe.skip("Deployment (Validates constructor WIP)", function () {
    it.skip("Should set the right unlockTime", async function () {
      const {deel, owner, boss1Address, worker1Address} = await loadFixture(stockDeployment);

      expect(await deel.jobCount()).to.equal(0);
    });
  });

  describe("Job Management", function () {
    describe("Adding Jobs", function () {

      it("Should Store the correct values to the job on mainchain", async function () {

        const { deel, owner, boss1Address } = await loadFixture(stockDeployment);

        // TODO: use other wallet
        let sender = owner;

        await deel.connect(boss1Address).addJob(zeroAddress, zeroAddress, jobValue1);

        let job = await deel.jobs(0);

        expect(job.owner).to.be.equal(boss1Address, "Job owner doesn't match");
        expect(job.feeToken).to.be.equal(zeroAddress, "Invalid Fee Token Address");
        expect(job.currency).to.be.equal(zeroAddress, "Invalid Currency Token Address");
        expect(job.value).to.be.equal(jobValue1, "Incorrect job value");

        // TODO: validate chainid
        //expect(job.originChain).to.be.equal(boss1Address, "Job owner doesn't match");
        //newJob.originChain = block.chainid;

      });

      it.skip("Should transfer tokens to contract", async function () {
      });

      it.skip("Should Store the correct values to the job on childchain", async function () {
      });

    });

    describe("Job listing", function () {
      it("Should list all jobs correctly", async function () {
        const { deel, owner, boss1Address, jobCount} = await loadFixture(populateJobs);

        let list = await deel.listJobs(0, 10);

        let values = list.map((item) => { return item.value });

        // Test all values match
        for(let i = 0; i < 10; i++) {
          expect(values[i]).to.be.equals(jobValue1+BigInt(i));
        };


      });

      it("Should not return a full page when the slice falls out of bounds", async function () {

        const { deel, owner, boss1Address, jobCount} = await loadFixture(populateJobs);

        let list = [];
        list = await deel.listJobs(0, 10);
        expect(list.length).to.be.equal(10);

        list = await deel.listJobs(5, 10);
        expect(list.length).to.be.equal(5);

        list = await deel.listJobs(8, 10);
        expect(list.length).to.be.equal(2);

        await expect(deel.listJobs(10, 10)).to.be.revertedWith("Start position out of bounds");
      });
    });

    describe("Mainchain Job application ", function () {

      it("Should count job application reputation on mainchain", async function () {

        const { deel, owner, boss1Address, worker1Address, jobCount} = await loadFixture(populateJobs);

        await deel.connect(worker1Address).applyForJob(2);
        let newRep = await deel.reputation(worker1Address.address);

        expect(newRep.applied).to.be.equal(1);

      });

      it("Should record job Application on mainchain", async function () {

        const { deel, owner, boss1Address, worker1Address, jobCount} = await loadFixture(populateJobs);

        let jobId = 2;
        await deel.connect(worker1Address).applyForJob(jobId);

        let applicationSender = await deel.applicationSenders(jobId, 0);
        let applicationChainSeletor  = await deel.applicationChainSeletor(jobId, 0);
        let currentChainSelector  = await deel.chainSelector();

        expect(applicationSender).to.be.equal(worker1Address.address, "Job applicant doensn't match");
        expect(applicationChainSeletor).to.be.equal(currentChainSelector, "Wrong applicant chainSelector");

        let appliedJob = await deel.jobs(jobId);

        expect(appliedJob.applicantCount).to.be.equal(1, "Job application count is incorrect");

      });

    });


    describe("Mainchain Select Applicant", function () {

      it("Should record job as assigned", async function () {
      });

    });

    describe.skip("Childchain Job application", function () {

      it.skip("Should count job application reputation", async function () {

        //const { deel, owner, boss1Address, worker1Address, jobCount} = await loadFixture(populateJobs);
        //
        //await deel.connect(worker1Address).applyForJob(2);
        //let newRep = await deel.reputation(worker1Address.address);
        //
        //expect(newRep.applied).to.be.equal(1);

      });

      it.skip("Should record job Application", async function () {

        //const { deel, owner, boss1Address, worker1Address, jobCount} = await loadFixture(populateJobs);
        //
        //let jobId = 2;
        //await deel.connect(worker1Address).applyForJob(jobId);
        //
        //let applicationSender = await deel.applicationSenders(jobId, 0);
        //let applicationChainSeletor  = await deel.applicationChainSeletor(jobId, 0);
        //let currentChainSelector  = await deel.chainSelector();
        //
        //expect(applicationSender).to.be.equal(worker1Address.address, "Job applicant doensn't match");
        //expect(applicationChainSeletor).to.be.equal(currentChainSelector, "Wrong applicant chainSelector");
        //
        //let appliedJob = await deel.jobs(jobId);
        //
        //expect(appliedJob.applicantCount).to.be.equal(1, "Job application count is incorrect");

      });

    });

  });
});

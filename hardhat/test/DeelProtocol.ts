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
let boss1;
let worker1;

let jobValue1  = ethers.parseUnits("1000", 18); // 1k tokens
let mintValue  = ethers.parseUnits("1", 18); // 100 tokens

//     000000000000000000
//1000 000000000000000000n

let routerAddress;
let feeTokenAddress;

let networks = [
  {
    name: "sepolia",
    chainId: 11155111,
    selector: 16015286601757825753n,
    routerAddress:"",
    isMain: true,
  },
  {
    name:"base sepolia",
    chainId: 11155111,
    selector: 10344971235874465080,
    routerAddress:"",
    isMain: true,
  },
]

describe("DeelProtocol", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function stockDeployment() {
    const [owner, boss1, worker1 ] = await hre.ethers.getSigners();

    const CCIP = await hre.ethers.getContractFactory("CCIPSimulator");
    const ccip = await CCIP.deploy();
    let ccipConfig = await ccip.configuration();

    const WETH9 = await hre.ethers.getContractFactory("WETH9");
    const feeToken = await WETH9.attach(ccipConfig[3]);

    const ERC20 = await hre.ethers.getContractFactory("ERC20");
    const valueToken = await ERC20.attach(ccipConfig[4]);

    //console.log(57, "here", await feeToken.balanceOf(owner));
    await feeToken.connect(boss1).deposit({ value: 10n*mintValue});
    //console.log(59, "here", await feeToken.balanceOf(owner));

    await feeToken.connect(boss1).deposit({ value: 10n*mintValue});
    await feeToken.connect(worker1).deposit({ value: 10n*mintValue});

    await ccip.requestLinkFromFaucet(boss1.address, jobValue1*10n);
    await ccip.requestLinkFromFaucet(worker1.address, jobValue1*10n);


    //0 chainselector
    //1 sourceRouter
    //2 destinationRouter
    //3 feeToken
    //4 linkToken

    const Deel = await hre.ethers.getContractFactory("DeelProtocol");
    const deel = await Deel.deploy(ccipConfig[1], feeToken.target, 11155111, zeroAddress);

    await feeToken.connect(boss1).approve(deel.target, jobValue1);
    await valueToken.connect(boss1).approve(deel.target, jobValue1);

    //console.log("Fixture 1 End");
    return { deel, owner, boss1, worker1, feeToken, valueToken};
  }

  async function multichainSimulation() {
    const [owner, boss1, worker1 ] = await hre.ethers.getSigners();

    const CCIP = await hre.ethers.getContractFactory("CCIPSimulator");
    const ccip = await CCIP.deploy();
    let ccipConfig = await ccip.configuration();

    const ERC20 = await hre.ethers.getContractFactory("ERC20");
    const feeToken = await ERC20.attach(ccipConfig[3]);
    const valueToken = await ERC20.attach(ccipConfig[4]);

    await ccip.requestLinkFromFaucet(boss1.address, mintValue);
    await ccip.requestLinkFromFaucet(worker1.address, mintValue);

    //0 chainselector
    //1 sourceRouter
    //2 destinationRouter
    //3 feeToken
    //4 linkToken

    const Deel = await hre.ethers.getContractFactory("DeelProtocol");

    const deelMainnet = await Deel.deploy(ccipConfig[2], feeToken.target, networks[0].chainId);
    const deelChildNet = await Deel.deploy(ccipConfig[1], feeToken.target, networks[1].chainId);

    //console.log("Fixture 1 End");
    return { deelMainnet, deelChildNet, owner, boss1, worker1, feeToken, valueToken};
  }

  async function populateJobs() {
    const [owner, boss1, worker1 ] = await hre.ethers.getSigners();


    const CCIP = await hre.ethers.getContractFactory("CCIPSimulator");
    const ccip = await CCIP.deploy();
    let ccipConfig = await ccip.configuration();

    const Deel = await hre.ethers.getContractFactory("DeelProtocol");
    const deel = await Deel.deploy(ccipConfig[1], ccipConfig[4], networks[0].chainId, zeroAddress);

    await ccip.requestLinkFromFaucet(boss1.address, jobValue1*11n);
    await ccip.requestLinkFromFaucet(worker1.address, mintValue);

    const ERC20 = await hre.ethers.getContractFactory("ERC20");
    const valueToken = await ERC20.attach(ccipConfig[4]);

    const WETH9 = await hre.ethers.getContractFactory("WETH9");
    const feeToken = await WETH9.attach(ccipConfig[3]);


    await feeToken.connect(boss1).deposit({ value: 10n*mintValue});
    await feeToken.connect(boss1).approve(deel.target, jobValue1);
    await valueToken.connect(boss1).approve(deel.target, jobValue1*11n);

    for( let i = 0; i < 10; i++) {
      let newValue = jobValue1 + BigInt(i);
      //console.log(138, "i", i);
      //console.log(138, "nV  ", newValue);
      //console.log(138, "feeT", await feeToken.balanceOf(boss1.address));
      //console.log(138, "valT", await valueToken.balanceOf(boss1.address));
      await deel.connect(boss1).addJob(feeToken.target, valueToken.target, newValue);
    }

    let jobCount = await deel.jobCount();

    //console.log("Fixture 2 End");
    return { deel, owner, boss1, worker1, jobCount};
  }


  describe.skip("Deployment (Validates constructor WIP)", function () {
    it.skip("Should set the right unlockTime", async function () {
      const {deel, owner, boss1, worker1} = await loadFixture(stockDeployment);

      expect(await deel.jobCount()).to.equal(0);
    });
  });

  describe("Job Management", function () {
    describe("Adding Jobs", function () {

      // TODO:HERE
      it("Should Store the correct values to the job on mainchain", async function () {

        const { deel, owner, boss1, worker1, feeToken, valueToken } = await loadFixture(stockDeployment);

        //console.log(await valueToken.balanceOf(boss1));
        //console.log(await feeToken.balanceOf(boss1));
        //console.log(jobValue1);

        await deel.connect(boss1).addJob(feeToken.target, valueToken.target, jobValue1);

        let job = await deel.jobs(0);

        expect(job.owner).to.be.equal(boss1, "Job owner doesn't match");
        expect(job.feeToken).to.be.equal(feeToken.target, "Invalid Fee Token Address");
        expect(job.currency).to.be.equal(valueToken.target, "Invalid Currency Token Address");
        expect(job.value).to.be.equal(jobValue1, "Incorrect job value");

        // TODO: validate chainid
        // TODO check chainselectors
        //expect(job.originChain).to.be.equal(boss1, "Job owner doesn't match");
        //newJob.originChain = block.chainid;

      });

      it("Should transfer tokens to contract", async function () {

        const { deel, owner, boss1, worker1, feeToken, valueToken } = await loadFixture(stockDeployment);


        let feeBalanceStart = await feeToken.balanceOf(deel.target);
        let valueBalanceStart = await valueToken.balanceOf(deel.target);

        // STEPS GO HERE
        await deel.connect(boss1).addJob(feeToken.target, valueToken.target, jobValue1);

        let feeBalanceEnd = await feeToken.balanceOf(deel.target);
        let valueBalanceEnd = await valueToken.balanceOf(deel.target);

        //console.log("feeBalanceStart", feeBalanceStart);
        //console.log("feeBalanceEnd", feeBalanceEnd);
        //console.log("valueBalanceStart", valueBalanceStart);
        //console.log("valueBalanceEnd", valueBalanceEnd);

        expect(valueBalanceStart).to.be.equals( 0);
        expect(feeBalanceStart).to.be.equals(0);

        expect(valueBalanceEnd).to.be.equals(jobValue1);
        expect(feeBalanceEnd).to.be.equals(43000000000000);

      });

      it.skip("Should Store the correct values to the job on childchain", async function () {
      });

    });

    describe("Job listing", function () {
      it("Should list all jobs correctly", async function () {
        const { deel, owner, boss1, jobCount} = await loadFixture(populateJobs);

        let list = await deel.listJobs(0, 10);

        let values = list.map((item) => { return item.value });

        // Test all values match
        for(let i = 0; i < 10; i++) {
          expect(values[i]).to.be.equals(jobValue1+BigInt(i));
        };


      });

      it("Should not return a full page when the slice falls out of bounds", async function () {

        const { deel, owner, boss1, jobCount} = await loadFixture(populateJobs);

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

        const { deel, owner, boss1, worker1, jobCount} = await loadFixture(populateJobs);

        await deel.connect(worker1).applyForJob(2);
        let newRep = await deel.reputation(worker1.address);

        expect(newRep.applied).to.be.equal(1);

      });

      it("Should record job Application on mainchain", async function () {

        const { deel, owner, boss1, worker1, jobCount} = await loadFixture(populateJobs);

        let jobId = 2;
        await deel.connect(worker1).applyForJob(jobId);

        let applicationSender = await deel.applicationSenders(jobId, 0);
        let applicationChainSeletor  = await deel.applicationChainSeletor(jobId, 0);
        let currentChainSelector  = await deel.chainSelector();

        expect(applicationSender).to.be.equal(worker1.address, "Job applicant doensn't match");
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

        //const { deel, owner, boss1, worker1, jobCount} = await loadFixture(populateJobs);
        //
        //await deel.connect(worker1).applyForJob(2);
        //let newRep = await deel.reputation(worker1.address);
        //
        //expect(newRep.applied).to.be.equal(1);

      });

      it.skip("Should record job Application", async function () {

        //const { deel, owner, boss1, worker1, jobCount} = await loadFixture(populateJobs);
        //
        //let jobId = 2;
        //await deel.connect(worker1).applyForJob(jobId);
        //
        //let applicationSender = await deel.applicationSenders(jobId, 0);
        //let applicationChainSeletor  = await deel.applicationChainSeletor(jobId, 0);
        //let currentChainSelector  = await deel.chainSelector();
        //
        //expect(applicationSender).to.be.equal(worker1.address, "Job applicant doensn't match");
        //expect(applicationChainSeletor).to.be.equal(currentChainSelector, "Wrong applicant chainSelector");
        //
        //let appliedJob = await deel.jobs(jobId);
        //
        //expect(appliedJob.applicantCount).to.be.equal(1, "Job application count is incorrect");

      });

    });

  });
});

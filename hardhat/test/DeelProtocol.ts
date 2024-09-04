import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";

let zeroAddress = ethers.ZeroAddress;

let owner;
let boss1Address;
let worker1Address;

let jobValue1  = ethers.parseUnits("1000", 18); // 1 Thousand tokens

let routerAddress;
let feeTokenAddress;

//await expect().not.to.be.reverted;
//await expect().to.be.revertedWith();
//await expect();
//expect().to.equal();
//await expect(contract.call()).to.be.revertedWithCustomError( contract, "SomeCustomError");

describe("DeelProtcol", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function stockDeployment() {
    const [owner, boss1Address, worker1Address ] = await hre.ethers.getSigners();

    const Deel = await hre.ethers.getContractFactory("DeelProtocol");
    const deel = await Deel.deploy();

    return { deel, owner, boss1Address, worker1Address, };
  }

  async function populateJobs() {
    const [owner, boss1Address, worker1Address ] = await hre.ethers.getSigners();

    const Deel = await hre.ethers.getContractFactory("DeelProtocol");
    const deel = await Deel.deploy();

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

      it("Should Store the correct values to the job", async function () {

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

    });

    describe("Job Taking", function () {
      it.skip("Should emit an event on withdrawals", async function () {
        const { deel, owner, boss1Address, jobCount} = await loadFixture(populateJobs);
        expect(jobCount).to.be.equal(10);

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
  });
});

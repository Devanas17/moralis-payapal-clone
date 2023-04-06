const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

describe("Paypal", async () => {
  let deployer, addr1, addr2;
  let paypal;
  beforeEach(async () => {
    [deployer, addr1, addr2] = await ethers.getSigners();
    const Paypal = await ethers.getContractFactory("Paypal");
    paypal = await Paypal.deploy();
    await paypal.deployed();
  });

  describe("Deployment", () => {
    it("Should set the owner", async () => {
      const result = await paypal.getOwner();
      expect(result).to.be.equal(deployer.address);
    });
  });

  describe("Add Names", () => {
    beforeEach(async () => {
      const addName = await paypal.connect(addr1).addName("Aman");
      await addName.wait();
    });

    it("Should set the name", async () => {
      const name = await paypal.getMyName(addr1.address);
      expect(name.name).to.equal("Aman");
      expect(name.hasName).to.equal(true);
    });

    it("Should not set the name", async () => {
      const name = await paypal.getMyName(addr2.address);
      expect(name.name).to.equal("");
      expect(name.hasName).to.equal(false);
    });
  });

  describe("Creating Request", () => {
    beforeEach(async () => {
      const addName = await paypal.connect(addr1).addName("Aman");
      await addName.wait();
      const createRequest = await paypal
        .connect(addr1)
        .createRequest(addr1.address, tokens(1), "First Request");

      await createRequest.wait();
    });

    it("Should get  request", async () => {
      const getRequests = await paypal.getMyRequests(addr1.address);

      const requestor = await getRequests[0][0];

      const amount = await getRequests[1][0].toString();
      const message = await getRequests[2][0];
      const name = await getRequests[3][0];

      expect(requestor).to.equal(addr1.address);
      expect(amount).to.equal(tokens(1));
      expect(message).to.equal("First Request");
      expect(name).to.equal("Aman");
    });
  });
});

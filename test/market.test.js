const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("ERC20 token staking", function () {

  let admin;
  let buyer;
  let contract;

  beforeEach(async function () {
    // getting admin address
    [admin, buyer] = await ethers.getSigners();

    // deploying staking contract
    const NftContract = await ethers.getContractFactory("NFTMarket");
    contract = await NftContract.deploy();
    await contract.deployed();

  });


  describe("NFT Marketplace", function () {
    it("Should List Item", async function () {
      const createToken = await contract.listItem("Test", "Test Desc", ethers.BigNumber.from("100000000000000000000"), "TestUri")
      await createToken.wait()
      const tokenId = 1
      const token = await contract.items(tokenId)
      expect(token.owner).to.equals(admin.address)
    })

    it("Should Buy Item", async function () {
      const price = ethers.BigNumber.from("100000000000000000000")
      const tokenId = 1
      const createToken = await contract.listItem("Test", "Test Desc", price, "TestUri")
      await createToken.wait()
      const buyItem = await contract.connect(buyer).buyItem(tokenId, {value: price})
      const token = await contract.items(tokenId)
      expect(token.owner).to.equals(buyer.address)
    })

    it("Should resell Item", async function () {
      const price = ethers.BigNumber.from("100000000000000000000")
      const tokenId = 1
      let token
      const createToken = await contract.listItem("Test", "Test Desc", price, "TestUri")
      await createToken.wait()

      await contract.connect(buyer).buyItem(tokenId, {value: price})
      token = await contract.items(tokenId)
      expect(token.forSale).to.equals(false)
      
      const newPrice = ethers.BigNumber.from("10000000000000000000")
      await contract.connect(buyer).resellItem(tokenId, newPrice)
      token = await contract.items(tokenId)
      expect(token.forSale).to.equals(true)
    })
  })

})

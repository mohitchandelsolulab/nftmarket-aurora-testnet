const hre = require("hardhat");

async function main() {

  const NFTMarketContract = await hre.ethers.getContractFactory("NFTMarket");
  const contract = await NFTMarketContract.deploy();

  await contract.deployed();

  console.log("contract deployed to:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

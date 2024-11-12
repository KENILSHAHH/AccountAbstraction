/** @format */

const hre = require('hardhat');

async function main() {
  // const NFT = await hre.ethers.deployContract('NFT');
  // await NFT.waitForDeployment();
  // console.log(`NFT deployed to ${NFT.target}`);
  // const paymaster = await hre.ethers.deployContract('Paymaster');
  // await paymaster.waitForDeployment();

  // console.log(`paymaster deployed to ${paymaster.target}`);

  const AccountFactory = await hre.ethers.deployContract('AccountFactory');

  await AccountFactory.waitForDeployment();

  console.log(`Account Factory deployed to ${AccountFactory.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

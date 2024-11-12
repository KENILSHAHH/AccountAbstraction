/** @format */

const hre = require('hardhat');

const FACTORY_ADDRESS = '0x16feE653f3E79BAE1F6019765ba993a48636bc34';
const EP_ADDRESS = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789';
const PM_ADDRESS = '0x69032Afff72CEbF8700050fA8840f2e10944e43B';
const NFT_ADDRESS = '0x96BD0c7aC2784D294DCeF91Ba4C85dDB5BcDb918';
async function main() {
  const entryPoint = await hre.ethers.getContractAt('EntryPoint', EP_ADDRESS);
  const AccountFactory = await hre.ethers.getContractFactory('AccountFactory');
  //  const NFT = await hre.ethers.getContractFactory("EGG", NFTAddress);

  const [signer] = await hre.ethers.getSigners();

  let initCode =
    FACTORY_ADDRESS +
    AccountFactory.interface
      .encodeFunctionData('createAccount', [signer.address])
      .slice(2);

  let sender;
  try {
    await entryPoint.getSenderAddress(initCode);
  } catch (ex) {
    sender = '0x' + ex.data.slice(-40);
  }

  const code = await ethers.provider.getCode(sender);
  if (code !== '0x') {
    initCode = '0x';
  }
  // await entryPoint.depositTo(PM_ADDRESS, {
  //   value: hre.ethers.parseEther('0.5'),
  // });
  console.log({ sender });
  const Account = await hre.ethers.getContractFactory('Account');
  const NFT = await hre.ethers.getContractFactory('NFT');
  const userOp = {
    sender, // smart account address
    nonce: '0x' + (await entryPoint.getNonce(sender, 0)).toString(16),
    initCode,
    callData: Account.interface.encodeFunctionData('mintNft'),
    paymasterAndData: PM_ADDRESS,
    signature:
      '0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c',
  };

  const { preVerificationGas, verificationGasLimit, callGasLimit } =
    await ethers.provider.send('eth_estimateUserOperationGas', [
      userOp,
      EP_ADDRESS,
    ]);

  userOp.preVerificationGas = preVerificationGas;
  userOp.verificationGasLimit = verificationGasLimit;
  userOp.callGasLimit = callGasLimit;

  const { maxFeePerGas } = await ethers.provider.getFeeData();
  console.log({ maxFeePerGas });

  const totalFee = maxFeePerGas;
  userOp.maxFeePerGas = '0x' + totalFee.toString(16);

  const maxPriorityFeePerGas = await ethers.provider.send(
    'rundler_maxPriorityFeePerGas'
  );
  userOp.maxPriorityFeePerGas = maxPriorityFeePerGas;

  const userOpHash = await entryPoint.getUserOpHash(userOp);

  userOp.signature = await signer.signMessage(hre.ethers.getBytes(userOpHash));

  const opHash = await ethers.provider.send('eth_sendUserOperation', [
    userOp,
    EP_ADDRESS,
  ]);

  setTimeout(async () => {
    const { transactionHash } = await ethers.provider.send(
      'eth_getUserOperationByHash',
      [opHash]
    );

    console.log(`https://amoy.polygonscan.com/tx/${transactionHash}`);
  }, 10000);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

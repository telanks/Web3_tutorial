//import ethers.js

const { ethers } = require("hardhat");

async function main() {
  //创建合约工场
  const fundMeFactory = await ethers.getContractFactory("FundMe");
  console.log("contract deploying");
  //部署合约
  const fundMe = await fundMeFactory.deploy(300);
  //等待合约部署完成
  fundMe.waitForDeployment();
  console.log(
    "contract has been deployed successfully,contract address is " +
      fundMe.target
  );
  console.log("Waiting for 5 confirmations");

  //verifyFundMe
  if (hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY) {
    await fundMe.deploymentTransaction().wait(5);
    //verifyFundMe(fundMe.target, [300]);
  } else {
    console.log("verification skip..");
  }

  // init 2 accounts
  const [firstAccount, secondAccount] = await ethers.getSigners();
  // fund contract with first account
  const fundTx = await fundMe.fund({ value: ethers.parseEther("0.05") });
  await fundTx.wait();
  // check balance of contract
  const balanceOfContract = ethers.provider.getBalance(fundMe.target);
  console.log(`Balance of the contract is ${balanceOfContract}`);

  // fund contract with second account
  const fundTxWithSecondAccount = await fundMe
    .connect(secondAccount)
    .fund({ value: ethers.parseEther("0.05") });
  await fundTxWithSecondAccount.wait();
  // check balance of contract
  const balanceOfContractAfterSecondFund = ethers.provider.getBalance(
    fundMe.target
  );
  console.log(`Balance of the contract is ${balanceOfContractAfterSecondFund}`);

  //check mapping funders
  const firstAccountBalanceInFundMe = await fundMe.fundersToAmount(
    firstAccount.address
  );
  const secondAccountBalanceInFundMe = await fundMe.fundersToAmount(
    secondAccount.address
  );
  console.log("Balance of first account " + firstAccountBalanceInFundMe);
  console.log("Balance of secound account " + secondAccountBalanceInFundMe);
}

async function verifyFundMe(fundMeAddr, args) {
  await hre.run("verify:verify", {
    address: fundMeAddr,
    constructorArguments: args,
  });
}

main()
  .then()
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });

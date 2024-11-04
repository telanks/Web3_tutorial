const { task } = require("hardhat/config");

task("interact-fundme", "interact with fundme contract")
  .addParam("addr", "fundme contract address")
  .setAction(async (taskArgs, hre) => {
    const fundMeFactory = await ethers.getContractFactory("FundMe");
    const fundMe = await fundMeFactory.attach(taskArgs.addr);

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
    console.log(
      `Balance of the contract is ${balanceOfContractAfterSecondFund}`
    );

    //check mapping funders
    const firstAccountBalanceInFundMe = await fundMe.fundersToAmount(
      firstAccount.address
    );
    const secondAccountBalanceInFundMe = await fundMe.fundersToAmount(
      secondAccount.address
    );
    console.log("Balance of first account " + firstAccountBalanceInFundMe);
    console.log("Balance of secound account " + secondAccountBalanceInFundMe);
  });

module.exports = {};

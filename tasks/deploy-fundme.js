const { task } = require("hardhat/config");
task("deploy-fundme", "deploy and verify fundme contract").setAction(
  async (taskArgs, hre) => {
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
    if (
      hre.network.config.chainId == 11155111 &&
      process.env.ETHERSCAN_API_KEY
    ) {
      await fundMe.deploymentTransaction().wait(5);
      await verifyFundMe(fundMe.target, [300]);
    } else {
      console.log("verification skip..");
    }
  }
);

async function verifyFundMe(fundMeAddr, args) {
  await hre.run("verify:verify", {
    address: fundMeAddr,
    constructorArguments: args,
  });
}

module.exports = {};

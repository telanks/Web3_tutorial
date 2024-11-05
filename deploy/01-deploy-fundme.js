// function deployFunction() {
//   console.log("this is a deploy function");
// }

const { network } = require("hardhat");
const {
  devlopmentChains,
  networkConfig,
  LOCK_TIME,
  CONFIRMATIONS,
} = require("../helper-hardhat-config");
// module.exports.default = deployFunction;

/**
 * 部署测试网络
 * getNamedAccounts: private key list
 * deployments 部署对象
 **/
module.exports = async ({ getNamedAccounts, deployments }) => {
  console.log("this is a deploy function");
  const firstAccount = (await getNamedAccounts()).firstAccount;
  console.log(`first account is ${firstAccount}`);
  const deploy = deployments.deploy;
  let mockDataFeedAddr;
  let confirmations;
  if (devlopmentChains.includes(network.name)) {
    const mockV3Aggregator = await deployments.get("MockV3Aggregator");
    mockDataFeedAddr = mockV3Aggregator.address;
    confirmations = 0;
  } else {
    mockDataFeedAddr = networkConfig[network.config.chainId].ethUsdDataFeed;
    confirmations = CONFIRMATIONS;
  }
  const fundMe = await deploy("FundMe", {
    from: firstAccount,
    args: [LOCK_TIME, mockDataFeedAddr],
    log: true,
    waitConfirmations: confirmations,
  });

  //remove deployments directory or add --reset flag if you redeploy contract
  if (hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY) {
    await hre.run("verify:verify", {
      address: fundMe.address,
      constructorArguments: [LOCK_TIME, mockDataFeedAddr],
    });
  } else {
    console.log("verification skip..");
  }
};

module.exports.tags = ["all", "fundme"];

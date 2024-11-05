const { network } = require("hardhat");
const {
  DECIMAL,
  INITIAL_ANSWER,
  devlopmentChains,
} = require("../helper-hardhat-config");
/**
 * 部署本地网络
 */
module.exports = async ({ getNamedAccounts, deployments }) => {
  if (devlopmentChains.includes(network.name)) {
    console.log("this is a deploy function");
    const firstAccount = (await getNamedAccounts()).firstAccount;
    console.log(`first account is ${firstAccount}`);
    const deploy = deployments.deploy;
    await deploy("MockV3Aggregator", {
      from: firstAccount,
      args: [DECIMAL, INITIAL_ANSWER],
      log: true,
    });
  } else {
    console.log("enviroment is not local, mock contract deployment is skip...");
  }
};

module.exports.tags = ["all", "mock"];

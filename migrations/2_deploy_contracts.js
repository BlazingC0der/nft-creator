var NFT = artifacts.require("./Nft.sol");

module.exports = function(deployer) {
  deployer.deploy(NFT);
};

const BetFlip = artifacts.require("BetFlip");
const BetFlipMockOutcome = artifacts.require("BetFlipMockOutcome");

module.exports = async function (deployer, _network, accounts) {
  const owner = accounts[0];
  deployer
    .deploy(BetFlip)
    .then(() => {
      web3.eth
        .sendTransaction({
          from: owner,
          to: BetFlip.address,
          value: web3.utils.toWei("1", "ether"),
        })
        .then(() => {
          console.log("Contract seeded by owner");
          web3.eth
            .getBalance(BetFlip.address)
            .then((newBalance) => {
              console.log("contract balance is now: ", newBalance);
            })
            .catch((err) => {
              console.error("Could not get contract balance - ", err);
            });

          deployer.deploy(BetFlipMockOutcome, 0).then(() => {
            console.log("deployed test contract");
          });
        })
        .catch((err) => {
          console.error("Contract funding error:", err);
        });
    })
    .catch((err) => {
      console.error("Contract deployment error:", err);
    });
};

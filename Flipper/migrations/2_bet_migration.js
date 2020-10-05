const Bet = artifacts.require("Bet");

module.exports = async function (deployer, _network, accounts) {
  const owner = accounts[0];
  deployer
    .deploy(Bet)
    .then(() => {
      web3.eth
        .sendTransaction({
          from: owner,
          to: Bet.address,
          value: web3.utils.toWei("10", "ether"),
        })
        .then(() => {
          console.log("Contract seeded by owner");
          web3.eth
            .getBalance(Bet.address)
            .then((newBalance) => {
              console.log("contract balance is now: ", newBalance);
            })
            .catch((err) => {
              console.error("Could not get contract balance - ", err);
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

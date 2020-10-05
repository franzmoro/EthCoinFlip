const truffleAssert = require("truffle-assertions");
const Bet = artifacts.require("Bet");

const HEADS = 0;
const TAILS = 1;
const minimumCost = web3.utils.toWei("1000", "gwei");

contract("Bet", async (accounts) => {
  let contractInstance;
  const owner = accounts[0];
  const gambler = accounts[1];

  before(async () => {
    contractInstance = await Bet.deployed();
  });

  it("should be possible to fund the account", async () => {
    const fundAmount = web3.utils.toWei("0.1", "ether");
    const initialBalance = await web3.eth.getBalance(contractInstance.address);

    await web3.eth.sendTransaction({
      from: owner,
      to: contractInstance.address,
      value: fundAmount,
    });

    const finalBalance = await web3.eth.getBalance(contractInstance.address);

    assert(
      parseInt(finalBalance) - parseInt(initialBalance) ===
        parseInt(fundAmount),
      "final balance should reflect funding amount"
    );
  });

  it("should be possible for the owner to withdraw the contract balance", async () => {
    await truffleAssert.passes(contractInstance.withdrawAll({ from: owner }));
  });

  it("should not be possible for anybody else to withdraw the contract balance", async () => {
    await truffleAssert.reverts(
      contractInstance.withdrawAll({ from: gambler })
    );
  });

  it("should revert placeBet if outcomes passed is neither Heads nor Tails", async () => {
    await truffleAssert.reverts(
      contractInstance.placeBet(2, { value: minimumCost, from: gambler })
    );
  });

  it("should revert placeBet if value is below threshold", async () => {
    await truffleAssert.reverts(
      contractInstance.placeBet(HEADS, {
        value: minimumCost - 1,
        from: gambler,
      })
    );
  });

  it(`should not revert placeBet if HEADS is passed`, async () => {
    const betAmount = minimumCost;

    // fund the contract
    await web3.eth.sendTransaction({
      from: owner,
      to: contractInstance.address,
      value: betAmount * 2,
    });

    await truffleAssert.passes(
      contractInstance.placeBet(HEADS, { value: betAmount, from: gambler })
    );
  });

  it(`should not revert placeBet if TAILS is passed`, async () => {
    const betAmount = web3.utils.toWei("0.01", "ether");

    // fund the contract
    await web3.eth.sendTransaction({
      from: owner,
      to: contractInstance.address,
      value: betAmount * 2,
    });

    await truffleAssert.passes(
      contractInstance.placeBet(TAILS, { value: betAmount, from: gambler })
    );
  });

  it("should not allow to bet more than the funds available", async () => {
    const balance = await web3.eth.getBalance(contractInstance.address);

    await truffleAssert.reverts(
      contractInstance.placeBet(HEADS, {
        value: balance * 10,
        from: gambler,
      })
    );
  });
});

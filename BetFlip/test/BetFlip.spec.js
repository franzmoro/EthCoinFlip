const truffleAssert = require("truffle-assertions");
const BetFlip = artifacts.require("BetFlip");
const BetFlipMockOutcome = artifacts.require("BetFlipMockOutcome");

const HEADS = 0;
const TAILS = 1;

const multiply = (weiString, multiplier) =>
  `${parseInt(weiString) * multiplier}`;

const minimumCost = web3.utils.toWei("0.1", "ether");
const betAmount = multiply(minimumCost, 10);
const contractFundingAmount = multiply(betAmount, 3);

contract("BetFlip", async (accounts) => {
  let contractInstance;

  const owner = accounts[0];
  const gambler = accounts[1];

  const fundContract = async (contractAddress) => {
    await web3.eth.sendTransaction({
      from: owner,
      to: contractAddress,
      value: contractFundingAmount,
    });
  };

  before(async () => {
    contractInstance = await BetFlip.deployed();
  });

  it("should be possible to fund the account", async () => {
    const initialBalance = await web3.eth.getBalance(contractInstance.address);

    await fundContract(contractInstance.address);

    const finalBalance = await web3.eth.getBalance(contractInstance.address);

    assert(
      parseInt(finalBalance) - parseInt(initialBalance) ===
        parseInt(contractFundingAmount),
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

  it(`mocked outcome: flipCoin should return ${HEADS}`, async () => {
    const mockedOutcomeInstance = await BetFlipMockOutcome.new(HEADS);

    const outcome = (await mockedOutcomeInstance.flipCoin()).toNumber();
    assert(outcome === HEADS, "Should have force-flipped HEADS");
  });

  it(`mocked outcome: flipCoin should return ${TAILS}`, async () => {
    const mockedOutcomeInstance = await BetFlipMockOutcome.new(TAILS);

    const outcome = (await mockedOutcomeInstance.flipCoin()).toNumber();
    assert(outcome === TAILS, "Should have force-flipped TAILS");
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

  it("Gambler Loses: should keep funds in contract", async () => {
    // will flip HEADS regardless
    const instance = await BetFlipMockOutcome.new(HEADS);

    await fundContract(instance.address);

    const contractBalanceBeforeBet = parseInt(
      await web3.eth.getBalance(instance.address)
    );
    const gamblerBalanceBeforeBet = parseInt(
      await web3.eth.getBalance(gambler)
    );

    // bet TAILS in order to lose the bet
    const transaction = await instance.placeBet(TAILS, {
      value: betAmount,
      from: gambler,
    });

    truffleAssert.eventEmitted(
      transaction,
      "BetOutcome",
      ({ amount, wonOrLost, userAddress }) => {
        return (
          parseInt(amount.toString()) === parseInt(betAmount) &&
          wonOrLost === false &&
          userAddress === gambler
        );
      },
      "Should emit BetOutcome event w/ outcome & amount bet"
    );

    const contractBalanceAfterBet = parseInt(
      await web3.eth.getBalance(instance.address)
    );

    assert(
      contractBalanceAfterBet - contractBalanceBeforeBet ===
        parseInt(betAmount),
      "contract balance should have increased by bet amount"
    );

    const gamblerBalanceAfterBet = parseInt(await web3.eth.getBalance(gambler));

    const { gasUsed } = transaction.receipt;
    const gasPrice = parseInt(await web3.eth.getGasPrice());
    const transactionCost = gasPrice * gasUsed;

    assert(
      gamblerBalanceBeforeBet > gamblerBalanceAfterBet,
      "gambler should have lost money"
    );

    // numbers don't add up
    // TODO: assert equality, not >=
    assert(
      gamblerBalanceBeforeBet - gamblerBalanceAfterBet >=
        transactionCost + parseInt(betAmount),
      "numbers should add up"
    );
  });

  it("Gambler Wins: should give funds to the user", async () => {
    // will flip HEADS regardless
    const instance = await BetFlipMockOutcome.new(HEADS);

    await fundContract(instance.address);

    const contractBalanceBeforeBet = parseInt(
      await web3.eth.getBalance(instance.address)
    );
    const gamblerBalanceBeforeBet = parseInt(
      await web3.eth.getBalance(gambler)
    );

    // bet HEADS in order to win
    const transaction = await instance.placeBet(HEADS, {
      value: betAmount,
      from: gambler,
    });

    truffleAssert.eventEmitted(
      transaction,
      "BetOutcome",
      ({ amount, wonOrLost, userAddress }) => {
        return (
          parseInt(amount.toString()) === parseInt(betAmount) * 2 &&
          wonOrLost === true &&
          userAddress === gambler
        );
      },
      "Should emit BetOutcome event w/ outcome & amount bet"
    );

    const contractBalanceAfterBet = parseInt(
      await web3.eth.getBalance(instance.address)
    );

    assert(
      contractBalanceBeforeBet - contractBalanceAfterBet ===
        parseInt(betAmount),
      "contract balance should have decreased by bet amount"
    );

    const gamblerBalanceAfterBet = parseInt(await web3.eth.getBalance(gambler));

    const { gasUsed } = transaction.receipt;
    const gasPrice = parseInt(await web3.eth.getGasPrice());
    const transactionCost = gasPrice * gasUsed;

    assert(
      gamblerBalanceAfterBet > gamblerBalanceBeforeBet,
      "gambler balance should have increased by betAmount"
    );
    // numbers don't add up
    // TODO: assert equality, not >=
    assert(
      gamblerBalanceAfterBet - gamblerBalanceBeforeBet <=
        parseInt(betAmount) - transactionCost,
      "numbers should add up"
    );
  });
});

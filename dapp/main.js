var accounts,
  web3,
  contractAddress = "0x8EFd14A92452c28029f45C7F13ec2C9101e59C16",
  HEADS = 0,
  TAILS = 1,
  minBetAmountEther = 0.1;

$(document).ready(async function () {
  web3 = new Web3(Web3.givenProvider);
  accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  contractInstance = new web3.eth.Contract(abi, contractAddress, {
    from: accounts[0],
  });
  updateContractBalance();
  $("#placeBet").click(handleSubmitBet);
  $("#betAmount").keyup(displayRewardAmount);
  $("#tryAgainButton").click(clearEverything);
});

function updateContractBalance() {
  web3.eth
    .getBalance(contractAddress)
    .then(function (contractBalance) {
      console.log("contractBalance retrieved:", contractBalance);
      $("#contractBalance").text(web3.utils.fromWei(contractBalance));
    })
    .catch(function (err) {
      console.error("Could not retrieve contractBalance:", err);
    });
}

function showUserFunds() {
  web3.eth.getBalance(accounts[0]).then((balance) => {
    //
  });
}

function displayRewardAmount() {
  $("#rewardAmount").text(getReward());
}

function handleSubmitBet() {
  var betAmountInputEther = getBetAmount();
  var outcomeInput = parseInt($("#userBet").val());

  if (isNaN(betAmountInputEther) || betAmountInputEther < minBetAmountEther) {
    console.error("bet amount needs to be greater than", minBetAmountEther);
    return;
  }
  if ([HEADS, TAILS].indexOf(outcomeInput) === -1) {
    console.error("you need to pick an outcome");
    // TODO error message showing
    return;
  }

  contractInstance.methods
    .placeBet(outcomeInput)
    .send({ value: web3.utils.toWei(betAmountInputEther.toString(), "ether") })
    .on("transactionHash", console.log)
    .on("confirmation", console.log)
    .on("receipt", function (receipt) {
      $("#betSection").hide();

      console.log("receipt", receipt);
      var receiptValues = receipt.events.BetOutcome.returnValues;
      if (receiptValues.wonOrLost === true) {
        $("#winAmount").text(web3.utils.fromWei(receiptValues.amount));
        $("#winSection").show();
      } else if (receiptValues.wonOrLost === false) {
        $("#loseSection").show();
      }
      updateContractBalance();
      $("#tryAgainButton").show();
    });
}

function getBetAmount() {
  return Number($("#betAmount").val());
}
function getReward() {
  return getBetAmount() * 2;
}

function clearEverything() {
  $("#tryAgainButton").hide();
  $("#winSection").hide();
  $("#loseSection").hide();

  $("#rewardAmount").text(0);
  $("#winAmount").text(0);
  $("#betAmount").val("");
  $("#userBet").val("");
  $("#betSection").show();
}

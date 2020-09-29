let userBet;
let actualOutcome;
let reward;

var HEADS = "0";
var TAILS = "1";

$placeBetButton().addEventListener("click", handleSubmitBet);
$betAmount().addEventListener("keyup", showReward);
$tryAgainButton().addEventListener("click", clearEverything);

function showReward() {
  $rewardAmount().innerHTML = getReward();
}

function handleSubmitBet() {
  var betInput = getBetAmount();
  var userBetInput = $userBetDropdown().value;

  if (isNaN(betInput) || betInput <= 0) {
    console.error("bet amount needs to be greater than 0");
    return;
  }
  if ([HEADS, TAILS].indexOf(userBetInput) === -1) {
    console.error("you need to pick an outcome");
    // TODO error message showing
    return;
  }

  // TODO payment
  hide($betSection());

  userBet = userBetInput;
  reward = getReward();

  var actualOutcome = flipCoin();

  if (actualOutcome === userBetInput) {
    $winAmount().innerHTML = reward;
    show($winSection());
  } else {
    show($loseSection());
  }
  show($tryAgainButton());
}

function $betSection() {
  return document.getElementById("betSection");
}
function $betAmount() {
  return document.getElementById("betAmount");
}
function $userBetDropdown() {
  return document.getElementById("userBet");
}
function $placeBetButton() {
  return document.getElementById("placeBet");
}
function $rewardAmount() {
  return document.getElementById("rewardAmount");
}
function $winSection() {
  return document.getElementById("winSection");
}
function $loseSection() {
  return document.getElementById("loseSection");
}
function $winAmount() {
  return document.getElementById("winAmount");
}
function $tryAgainButton() {
  return document.getElementById("tryAgainButton");
}

function getBetAmount() {
  var valueString = $betAmount().value;
  // TODO validation not done here

  return Number(valueString);
}
function getReward() {
  return getBetAmount() * 2;
}

function flipCoin() {
  return Math.random() > 0.5 ? TAILS : HEADS;
}

function hide($el) {
  $el.style.display = "none";
}
function show($el) {
  $el.style.display = "block";
}

function clearEverything() {
  hide($tryAgainButton());
  hide($winSection());
  hide($loseSection());
  $rewardAmount().innerHTML = 0;
  $winAmount().innerHTML = 0;
  $betAmount().value = "";
  $userBetDropdown().value = "";
  show($betSection());

  userBet = actualOutcome = reward = undefined;
}

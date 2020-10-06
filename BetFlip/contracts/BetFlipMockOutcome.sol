// SPDX-License-Identifier: UNLICENSED
pragma solidity "0.7.0";

import "./BetFlip.sol";

contract BetFlipMockOutcome is BetFlip {
  uint256 flipCoinResult;

  constructor (uint256 flipCoinForcedResult) {
    flipCoinResult = flipCoinForcedResult;
  }

  function flipCoin() override public view returns (uint256) {
    return flipCoinResult;
  }
}

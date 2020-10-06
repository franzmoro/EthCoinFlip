// SPDX-License-Identifier: UNLICENSED
pragma solidity "0.7.0";

import "./Ownable.sol";

contract BetFlip is Ownable {
    uint256 public balance;

    event BetOutcome(address userAddress, uint256 amount, bool wonOrLost);

    modifier minimum(uint256 amount) {
        require(msg.value >= amount, "Not enough Ether provided.");
        _;
    }

    function placeBet(uint256 bettedOutcome) public payable minimum(0.1 ether) {
        require(address(this).balance > 0, "User balance must be above zero");
        require(
            address(this).balance >= msg.value * 2,
            "The contract does not have enough funds"
        );
        require(
            bettedOutcome == 0 || bettedOutcome == 1,
            "user must bet on either Heads (0) or Tails (1)"
        );

        if (bettedOutcome == flipCoin()) {
            msg.sender.transfer(msg.value * 2);
            // TODO: count tx fee?
            balance -= msg.value * 2;
            emit BetOutcome(msg.sender, msg.value * 2, true);
        } else {
            balance += msg.value;
            emit BetOutcome(msg.sender, msg.value, false);
        }
    }

    // TODO: use an oracle
    function flipCoin() public virtual view returns (uint256) {
        return block.timestamp % 2;
    }

    function withdrawAll() public onlyOwner returns (uint256) {
        uint256 toWithdraw = balance;
        balance = 0;
        msg.sender.transfer(toWithdraw);

        return toWithdraw;
    }

    // receivable function - necessary to fund the contract
    receive() external payable {
        require(msg.value > 0);
        balance += msg.value;
        assert(balance > 0);
        assert(balance == address(this).balance);
    }
}

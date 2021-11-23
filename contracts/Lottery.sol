// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract Lottery {
    address public manager;
    address[] public players;
    
    constructor() {
        // msg object contains properties that describe the sender of a tx, plus details about the tx
        // Not only at contract creation, but also interacting/calling a contract/function in a contract
        // msg.data -> tx data
        // msg.gas -> how much gas current function invocation has available
        // msg.sender -> sender
        // msg.value -> amount of eth (in wei) that was sent along with the function invocation
        
        manager = msg.sender;
    }
    
    // payable keyword - when someone calls this function they might send eth along with it
    function enter() public payable {
        
        // Require - used for validation. Can pass a bool expression, only continues if expression evaluates to true.
        require(msg.value > 0.01 ether, "Not enough eth provided, minimum is 0.01 to enter");
        
        players.push(msg.sender);
    }
    
    // Generate and return a random number. view -> doesn't modify any contract data
    function random() private view returns (uint256) {
        return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, players)));
    }
    
    function pickWinner() public restricted {
        address winnerNonPayable = players[random() % players.length];
        address payable winner = payable(winnerNonPayable);
        winner.transfer(address(this).balance);
        players = new address[](0);
    }
    modifier restricted() {
        require(msg.sender == manager, "Only the manager (contract deployer) can decide when a winner is picked");
        _;
    }
    function getPlayers() public view returns (address[] memory) {
        return players;
    }
}
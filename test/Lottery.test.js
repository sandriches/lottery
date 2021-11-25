const assert = require("assert");
const ganache = require("ganache-cli");
const { difference } = require("lodash");
const Web3 = require("web3");
const { abi, evm } = require("../compile");

const web3 = new Web3(ganache.provider());

let lottery;
let accounts;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  lottery = await new web3.eth.Contract(abi)
    .deploy({ data: evm.bytecode.object })
    .send({ from: accounts[0], gas: "1000000" });
});

describe("Lottery Contract", () => {
  it("verifies the contract was successfully deployed to the network", () => {
    assert.ok(lottery.options.address);
  });
  it("allows multiple accounts to enter", async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei("0.02", "ether"),
    });
    const players = await lottery.methods.getPlayers().call({
      from: accounts[0],
    });
    assert.equal(accounts[0], players[0]);
    assert.equal(1, players.length);
  });

  it("allows multiple accounts to enter", async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei("0.02", "ether"),
    });
    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei("0.02", "ether"),
    });
    await lottery.methods.enter().send({
      from: accounts[2],
      value: web3.utils.toWei("0.02", "ether"),
    });
    const players = await lottery.methods.getPlayers().call({
      from: accounts[0],
    });
    assert.equal(accounts[0], players[0]);
    assert.equal(accounts[1], players[1]);
    assert.equal(accounts[2], players[2]);
    assert.equal(3, players.length);
  });

  it("doesn't allow an account to enter with too little ether", async () => {
    try {
      await lottery.methods.enter().send({
        from: accounts[0],
        value: "100",
      });
      assert(false);
    } catch (error) {
      assert(error);
    }
  });

  it("only the manager can pick the winner", async () => {
    try {
      await lottery.methods.pickWinner().send({
        from: accounts[2],
      });
      assert(false);
    } catch (error) {
      assert(error);
    }
  });

  it("sends money to the winner of the lottery, resets players array", async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei("2", "ether"),
    });

    // getBalance() can be used with external accounts or contracts.
    const initialBalance = await web3.eth.getBalance(accounts[0]);
    await lottery.methods.pickWinner().send({
      from: accounts[0],
    });
    const finalBalance = await web3.eth.getBalance(accounts[0]);
    const difference = finalBalance - initialBalance;

    // Difference between initial and final balance should be 2 eth, minus the gas fees.
    assert(difference > web3.utils.toWei("1.9", "ether"));

    // Check that the balance is empty and players array has been reset
    const initialisedLotteryBalance = await web3.eth.getBalance(
      lottery.options.address
    );
    const players = await lottery.methods.getPlayers().call();
    assert(initialisedLotteryBalance == 0);
    assert(players.length == 0);
  });
});

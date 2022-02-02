import logo from "./logo.svg";
import "./App.css";
import React from "react";
import lottery from "./lottery";
import web3 from "./web3";

class App extends React.Component {
  state = {
    manager: "",
    players: 0,
    balance: "",
  };
  async componentDidMount() {
    // don't need to specify a 'from' argument inside call(), as metamask has a default account set.
    const manager = await lottery.methods.manager().call();
    const players = await lottery.methods.getPlayers().call().length();
    const balance = await web3.eth.getBalance(lottery.options.address);

    this.setState({ manager, players, balance });
  }
  render() {
    return (
      <div>
        <h1>Lottery Contract</h1>
        <p>Contract managed by {this.state.manager}</p>
        <p>Currently there are {this.state.players} players.</p>
        <p>
          There is {web3.utils.fromWei(this.state.balance, "ether")} in the pool
          right now.
        </p>
      </div>
    );
  }
}
export default App;

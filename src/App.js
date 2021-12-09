import logo from "./logo.svg";
import "./App.css";
import React from "react";
import lottery from "./lottery";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = { manager: "" };
  }
  async componentDidMount() {
    // don't need to specify a 'from' argument inside call(), as metamask has a default account set.
    const manager = await lottery.methods.manager().call();

    this.setState({ manager });
  }
  render() {
    return (
      <div>
        <h1>Lottery Contract</h1>
        <p>Contract managed by {this.state.manager}</p>
      </div>
    );
  }
}
export default App;

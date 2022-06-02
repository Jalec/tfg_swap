import React, { Component } from 'react';
import ethLogo from '../eth-logo.png';
import tfgLogo from '../tfg-logo.png';

class Buy extends Component {
  constructor(props) {
    super(props);
    this.state = { 
        output: '0'
    };
  }

  render() {
    return (
      <form className="mb-3" onSubmit={(event) => {
        event.preventDefault();
        let etherAmount;
        etherAmount = this.input.value.toString();
        console.log("Abans de ferhi el toWei(ETH):" + etherAmount);
        let m_tokensToBuy = etherAmount / this.props.exchangeRate;
        etherAmount = window.web3.utils.toWei(etherAmount, 'Ether');
        console.log("Despres de ferhi el toWei(ETH):" + etherAmount);
        console.log("Abans de ferhi el toWei(TokensToBuy):" + m_tokensToBuy.toFixed(4));
        let a = m_tokensToBuy * 1000000000000000000;
        console.log(a);
        this.props.buyTokens(etherAmount, a);
    }}>
      <div>
        <label className="float-left"><b>Input</b></label>
        <span className="float-right text-muted">
          Balance: {window.web3.utils.fromWei(this.props.ethBalance, 'Ether')}
        </span>
      </div>
      <div className="input-group mb-4">
        <input
          type="text"
          onChange={(event) =>{
              console.log("changing...");
              const etherAmount = this.input.value.toString();
              this.setState({
                  output: etherAmount / (65/parseInt(this.props.ethereumPrice))
              })
          }}
          ref={(input) => {
              this.input = input;
          }}
          className="form-control form-control-lg"
          placeholder="0"
          required />
        <div className="input-group-append">
          <div className="input-group-text">
            <img src={ethLogo} height='32' alt=""/>
            &nbsp;&nbsp;&nbsp; ETH
          </div>
        </div>
      </div>
      <div>
        <label className="float-left"><b>Output</b></label>
        <span className="float-right text-muted">
          Balance: {window.web3.utils.fromWei(this.props.tokenBalance, 'Ether')}
        </span>
      </div>
      <div className="input-group mb-2">
        <input
          type="text"
          className="form-control form-control-lg"
          placeholder="0"
          value={this.state.output}
          disabled
        />
        <div className="input-group-append">
          <div className="input-group-text">
            <img src={tfgLogo} height='32' alt=""/>
            &nbsp;&nbsp;&nbsp; TFG
          </div>
        </div>
      </div>
      <div className="mb-5">
        <span className="float-left text-muted">Exchange Rate</span>
        <span className="float-right text-muted">1 TFG Token (65$) = {(65 / this.props.ethereumPrice).toFixed(4)} ETH</span>
      </div>
      <button type="submit" className="btn btn-primary btn-block btn-lg">Swap</button>
      </form>
    );
  }
}

export default Buy;

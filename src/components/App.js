import React, { Component } from 'react';
import Web3 from 'web3';
import Token from '../abis/Token.json';
import TFGSwap from '../abis/TFGSwap.json';
import Navbar from './Navbar.js';
import Dex from './Dex.js';
import Lottery from './Lottery.js';
import './App.css';

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  } 

  async loadBlockchainData() {
    const web3 = new Web3(window.web3.currentProvider);

    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0]});

    const ethBalance = await web3.eth.getBalance(this.state.account);
    this.setState({ ethBalance });

    //Load Token
    const networkId = await web3.eth.net.getId();
    const tokenData = Token.networks[networkId];
    if(tokenData){
      const token = new web3.eth.Contract(Token.abi, tokenData.address);
      this.setState({ token });
      let tokenBalance = await token.methods.balanceOf(this.state.account).call();
      console.log(tokenBalance.toString());
      this.setState({ tokenBalance: tokenBalance.toString() });
    } else {
      window.alert('Token contract not deployed to detected network.')
    }

    //Load TFGSwap
    const TFGprice = 65;
    const tfgSwapData = TFGSwap.networks[networkId];
    if(tfgSwapData){
      const tfgSwap = new web3.eth.Contract(TFGSwap.abi, tfgSwapData.address);
      this.setState({ tfgSwap });
      let ethereumPrice = await tfgSwap.methods.getLatestPrice().call();
      let proba = await tfgSwap.methods.name.call();
      console.log(proba);
      this.setState({ ethereumPrice: ethereumPrice.toString() });
      let exchangeRate = TFGprice / this.state.ethereumPrice;
      this.setState({ exchangeRate });
    } else {
      window.alert('TFGSwap contract not deployed to detected network.')
    }

    this.setState({ loading: false });   
  }

  async loadWeb3() {
    if(window.ethereum) {
      window.web3 = new Web3(window.ethereum);  
      await window.ethereum.enable();
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
  }

  buyTokens= (etherAmount, n_tokensToBuy) => {
    this.setState({ loading: true });
    let tokensToBuy = n_tokensToBuy.toString();
    console.log(tokensToBuy);
    this.state.tfgSwap.methods.buyTokens(tokensToBuy.toString()).send({ value: etherAmount, from: this.state.account }).on('transactionHash', (hash) =>{
      this.setState({ loading: false });
    });
  }

  sellTokens= (tokenAmount, n_etherToRedeem) => {
    this.setState({ loading: true });
    let etherToRedeem = n_etherToRedeem.toString();
    console.log(tokenAmount);
    console.log(etherToRedeem);
    this.state.token.methods.approve(this.state.tfgSwap.address, tokenAmount).send({ from: this.state.account }).on('transactionHash', (hash) =>{
      this.state.tfgSwap.methods.sellTokens(tokenAmount, etherToRedeem).send({ from: this.state.account }).on('transactionHash', (hash) =>{
        this.setState({ loading: false });
    })
    });
  }

  constructor(props) {
    super(props);
    this.state = { 
      account:'',
      token: {},
      tfgSwap: {},
      ethereumPrice: '0',
      exchangeRate: '0',
      ethBalance: '0',
      tokenBalance: '0',
      loading: true,
      currentPage: 'dex'
    };
  }

  render() {
    let content;
    if(this.state.loading) {
      content= <p id="loader" className="text-center">Loading...</p>
    } else if (this.state.currentPage === 'dex') {
      content = <Dex 
      ethBalance={this.state.ethBalance} 
      tokenBalance={this.state.tokenBalance}
      ethereumPrice={this.state.ethereumPrice}
      exchangeRate={this.state.exchangeRate}
      buyTokens={this.buyTokens}
      sellTokens={this.sellTokens} 
      />
    } else if (this.state.currentPage === 'lp') {
      content = <Lottery />
    }
    return (
      <div>

        <Navbar account={this.state.account} />
        
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
              <div className="content mr-auto ml-auto">
                <div class="btn-group btn-group-lg d-flex justify-content-center mt-5" role="group" aria-label="Basic example">
                  <button type="button" class="btn btn-secondary" 
                    onClick={(event)=>{
                    this.setState({ currentPage: 'dex' });
                    }}>
                      Dex
                  </button>
                  <button type="button" class="btn btn-secondary" 
                    onClick={(event)=>{
                    this.setState({ currentPage: 'lp' });
                    }}>
                      LP
                  </button>
                </div>
                {content}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;

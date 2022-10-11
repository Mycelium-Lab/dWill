import logo from './logo.svg';
import './App.css';
import Connect from './Utils/Connect';
import AllHeritage from './Utils/AllHeritage';
import NewWill from './Will/NewWill';
import { Component } from 'react';
import TheWill from './Contract/TheWill.json'

import { ethers } from "ethers";

class App extends Component {

  state = { 
    signer: null, 
    contract: null
  };

  componentDidMount = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner()
      // token 
      const contract = new ethers.Contract('0x5FbDB2315678afecb367f032d93F642f64180aa3', TheWill.abi, signer)
      this.setState({
        signer, contract
      })
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    } 
  };

  //new will
  async addNewWill(data) {
    const { contract } = this.state
    // address heir, 
    //     address token,
    //     uint256 timeWhenWithdraw, 
    //     uint256 amount
    await contract.addAnHeir()
  }

  addNewWill = this.addNewWill.bind(this)

  render(){
      return(
        <div className="App">
          <header className="header">
            <div className='header_boxes'>
              <div>
                Heritage
              </div>
              <AllHeritage/>
              <Connect/>
            </div>
          </header>
          <div>
            Reset timers
          </div>
          <div>
            Your will
          </div>
          <div>
            <NewWill addNewWill={this.addNewWill} giveApprove={this.giveApprove}/>
          </div>
        </div>
    );
  }
}

export default App;

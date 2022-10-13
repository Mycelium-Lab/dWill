import logo from './logo.svg';
import './App.css';
import Connect from './Utils/Connect';
import NewWill from './Will/NewWill';
import { Component } from 'react';
import TheWill from './Contract/TheWill.json'

import { ethers } from "ethers";
import Inheritances from './Getters/Inheritances';
import Wills from './Getters/Wills';

class App extends Component {

  state = { 
    signer: null, 
    contract: null,
    total: ''
  };

  componentDidMount = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner()
      // token 
      const contract = new ethers.Contract('0x5FbDB2315678afecb367f032d93F642f64180aa3', TheWill.abi, signer)
      let _total = 0;
      (await contract.queryFilter('AddAnHeir')).forEach(v => _total += parseFloat(ethers.utils.formatEther(v.args.amount.toString())))
      this.setState({
        signer, contract, total: _total
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
                TheWill
              </div>
              <div>
                  <div>
                      Всего завещано
                  </div>
                  <div>
                      {this.state.total} USD
                  </div>
              </div>
              <Connect/>
            </div>
          </header>
          <div>
            Reset timers
          </div>
          <div>
            <NewWill addNewWill={this.addNewWill} giveApprove={this.giveApprove}/>
          </div>
          <div>
            <Inheritances/>
          </div>
          <div>
            <Wills/>
          </div>
        </div>
    );
  }
}

export default App;

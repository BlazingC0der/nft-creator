import React, { Component } from "react"
import NFT from './contracts/NFT.json'
import getWeb3 from "./getWeb3"
import "./App.scss"
require("dotenv").config()

class App extends Component {
  constructor() {
    super()
    this.state = { web3: null, accounts: null, contract: null, PublicKey: "", PrivateKey: "", TokenUri: "", ContractAddress: "0x2d2532A51e140d7eB2336417A93c036aB3d0Deb3", hash: "", NftContract: null }
  }

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      // const contract = require("./contracts/NFT.json")
      // console.log(contract.abi)
      /* const PublicKey = process.env.PUBLIC_KEY
      const PrivateKey = process.env.PRIVATE_KEY */
      // const TokenUri = "https://i.kym-cdn.com/entries/icons/original/000/021/807/ig9OoyenpxqdCQyABmOQBZDI0duHk2QZZmWg2Hxd4ro.jpg"
      // const ApiUrl = process.env.API_URL
      // const { createAlchemyweb3 } = require("@alch/alchemy-web3")
      // const web3 = await createAlchemyweb3(ApiUrl)
      // this.setState({ web3: web3 })
      const web3 = await getWeb3()
      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts()

      // Get the contract instance.
      const networkId = await web3.eth.net.getId()
      const deployedNetwork = NFT.networks[networkId]
      const instance = new web3.eth.Contract(
        NFT.abi,
        deployedNetwork && deployedNetwork.address,
      )
      this.setState({ web3, accounts, contract: instance }, this.runExample)
      /* onst NFTcontract = await new web3.eth.Contract(contract.abi, this.state.ContractAddress)
      this.setState({ NftContract: NFTcontract }) */
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      )
      console.error(error)
    }
  }

  runExample = async () => {
    const { accounts, contract } = this.state

    /* // Stores a given value, 5 by default.
    await contract.methods.set(5).send({ from: accounts[0] })

    // Get the value from the contract to prove it worked.
    const response = await contract.methods.get().call()

    // Update state with the result.
    this.setState({ storageValue: response }) */
  }

  MintNft = async (key, uri) => {
    const contract = require("./contracts/NFT.json")
    const NftContract = await new this.state.web3.eth.Contract(contract.abi, this.state.ContractAddress)
    const nonce = this.state.web3.eth.getTransactionCount(this.state.PublicKey, "latest")
    const tx = {
      to: this.state.PublicKey,
      from: this.state.ContractAddress,
      nonce: nonce,
      gas: 500000,
      data: NftContract.methods.safeMint(key, uri).encodeABI
    }
    const signPromise = this.state.web3.eth.accounts.signTransaction(tx, this.state.PrivateKey)
    signPromise.then((signedTx) => {
      let Hash = ""
      this.state.web3.eth.sendSignedTransaction(
        signedTx.rawTransaction,
        function async(err, TxHash) {
          if (!err) {
            console.log(
              "The hash of your transaction is: ",
              TxHash,
              "\nCheck Alchemy's Mempool to view the status of your transaction!"
            )
            Hash = TxHash
          } else {
            console.log(
              "Something went wrong when submitting your transaction:",
              err
            )
          }
        }
      )
      this.setState({ hash: Hash })
    })
      .catch((err) => {
        console.log(" Promise failed:", err)
      })
  }

  PrivateKeyHandle = (e) => {
    this.setState({ PrivateKey: e.target.value.length > 0 ? e.target.value : "" })
  }

  PublicKeyHandle = (e) => {
    this.setState({ PublicKey: e.target.value.length > 0 ? e.target.value : "" })
  }

  UriHandle = (e) => {
    this.setState({ TokenUri: e.target.value })
  }

  deployment = async (key, uri) => {
    await this.MintNft(key, uri)
    document.querySelector(".msg").style.display = "block"
    document.querySelector("form").style.display = "none"
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading web3, accounts, and contract...</div>
    }
    return (
      <div className="App">
        <div className="InputWrapper">
          <form onSubmit={(e) => { e.preventDefault(); this.deployment(this.state.PublicKey, this.state.TokenUri) }}>
            <input type="password" name="pvk" id="pvk" onChange={this.PrivateKeyHandle} placeholder="Priavte Key" required />
            <input type="text" name="pbk" id="pbk" onChange={this.PublicKeyHandle} required placeholder="Public Key" />
            <input type="url" name="uri" id="uri" onChange={this.UriHandle} required placeholder="Token URI" />
            <input type="submit" value="deploy" id="btn" />
          </form>
          <div className="msg">
            <span className="material-symbols-outlined" style={{ fontSize: "5vmax" }}>
              check_circle
            </span>
            <h1>SUCCESS</h1>
            <span style={{ fontSize: "1.5vmax" }}>{"The hash of your transaction is: " + this.state.hash}</span>
          </div>
        </div>
      </div>
    )
  }
}

export default App

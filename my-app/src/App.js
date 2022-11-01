import "bulma/css/bulma.min.css"
import './App.css';
import Web3 from 'web3'
import {useEffect, useState, useCallback} from 'react'
import detectEthereumProvider from '@metamask/detect-provider'
import { loadContract } from "./utils/load-contract";



function App() {
  const [web3Api, setWeb3Api] = useState({
    provider: null,
    web3: null,
    contract: null,
  })
  const [account, setAccount] = useState(null)
  const [balance, setBalance] = useState(null)

  useEffect(() => {
    const loadProvider = async () => {
      const provider = await detectEthereumProvider();
      const  contract  = await loadContract("Faucet", provider)

      if (provider) {
        provider.request({method: "eth_requestAccounts"})
        setWeb3Api({
          web3: new Web3(provider),
          provider,
          contract
        })

      } else {
        console.log("Please Install MetaMask")
      }


      // The NPM package we installed eliminates all of this code, but we should understand how we connect our application. 
      // if (window.ethereum) {
      //   provider = window.ethereum
      //   try {
      //     await provider.request({method: "eth_requestAccounts"});
      //   } catch {
      //     console.error("User Access Denied")
      //   }
      // } else if(window.web3) {
      //   provider = window.web3.currentProvider
      // } else if (!process.env.production) {
      //   provider = new Web3.providers.HttpProvider("http://localhost:7545")
      // }

    }

    loadProvider()
  }, [])

  useEffect(() => {
    const loadBalance = async () => {
      const { contract, web3 } = web3Api
      const balance = await web3.eth.getBalance(contract.address)

      setBalance(web3.utils.fromWei(balance, "ether"))
    }

    web3Api.contract && loadBalance()
  }, [web3Api, balance])
  
  useEffect(() => {
    const getAccount = async () => {
      const accounts = await web3Api.web3.eth.getAccounts()
      setAccount(accounts[0])
    }

    web3Api.web3 && getAccount()
  }, [web3Api.web3])

  const addFunds = useCallback(async () => {
    const { contract, web3 } = web3Api
    await contract.addFunds({
      from: account,
      value: web3.utils.toWei("1", "ether")
    })

    window.location.reload()
  }, [web3Api, account])

  const withdraw = useCallback(async () => {
    const { contract, web3 } = web3Api
    const withdrawAmount = web3.utils.toWei("0.1", "ether")
    await contract.withdraw(withdrawAmount, {
      from: account,
    })

    window.location.reload()
  }, [web3Api, account])

  return (
    <>
      <div className="faucet-wrapper" >
        <div className="faucet">
          <span>
            <strong>Account: </strong>
          </span>
          <h1>
            {account 
            ? account
            : 
            <button 
              className="button is-info"
              onClick={() => web3Api.provider.request({method: "eth_requestAccounts"})}
            >
              Connect MetaMask
            </button>
            }
          </h1>
          <div className="balance-view is-size-2 mb-5">
            Current Balance: <strong>{balance}</strong> ETH
          </div>
    
          <button 
            className="button is-link mr-2"
            onClick={() => addFunds()}  
          >Donate 1 ETH</button>
          <button 
            className="button is-primary"
            onClick={() => withdraw()}
            >Withdraw</button>
        </div>
      </div>
    </>
  );
}

export default App;

import React, { useEffect, useState } from 'react'

import Providers from '../../api/providers'

import { connect } from '../StateProvider'
import { getAPI } from '../../api'
import { getAppContracts } from '../../api/Contracts'

import ConfigDisplayerHOC from '../hoc/ConfigDisplayHOC'

function WalletIntegration({ 
  dispatchers: { 
    appLoading, 
    grabUserState, 
    registerProviders, 
    saveContract, 
    setActiveProvider,
    saveTotalPoolShares,
  }, 
  state: { activeProvider }, 
  children,
}) {
  const [error, setError] = useState(undefined)
  const [initialising, setInitialising] = useState(false)
  const [activeProviderSet, setActiveProviderState] = useState(undefined)

  // Fire once on load
  useEffect(() => {
    // returns [ Provider{}, ... ]
    const providersArray = Object.values(Providers)
    // register each providerObject into state
    providersArray.forEach(() => { registerProviders(providersArray) })
  }, [])

  const saveContractToState = contracts => Object.keys(contracts).forEach(name => saveContract({ name, contract: contracts[name] }))

  /**
   * onChange Event Handler
   * @param { providerInfo } @type { ProviderObject }
   * @memberof WalletIntegration
   */
  const onChange = async (providerInfo) => {
    try {
      // Set loader
      appLoading(true)
      
      // State setters
      setError(undefined)
      setInitialising(true)

      const chosenProvider = Providers[providerInfo]
      // initialize providers and return specific Web3 instances
      await chosenProvider.initialize()

      // Save activeProvider to State
      setActiveProvider(providerInfo)
      
      // Save web3 provider + notify state locally
      setActiveProviderState(true)

      // interface with contracts & connect entire DX API
      // grabbing eth here to show contrived example of state
      const contracts = await getAppContracts()

      // registers/saves contracts to StateProvider
      saveContractToState(contracts)

      // INIT main API
      await getAPI()

      // First time grab userState
      await grabUserState()

      // Test - TODO: remove
      await saveTotalPoolShares()

      appLoading(false)

      return setInitialising(false)
    } catch (err) {
      console.error(err)
      appLoading(false)
      
      setInitialising(false)
      return setError(error)
    }
  }

  const walletSelector = () => (
    <div className="walletChooser">
      <h2>Please select a wallet</h2>
      <div className={!initialising ? 'lightBlue' : ''}>
        {Object.keys(Providers).map((provider, i) => {
          const providerObj = Providers[provider]
          return (
            <div
              className="poolContainer"
              role="container"
              key={i}
              onClick={() => onChange(provider)}
            >
              <h4 className="providerChoice">{`${providerObj.providerName}`}</h4>
            </div>
          )
        })}
      </div>
      {error && <h3>{error.message}</h3>}
    </div>
  )
  
  if (error) return <h1>An error occurred: {error}</h1>
  
  if ((activeProvider && activeProviderSet) && !initialising) return children
  
  return walletSelector()
}

const mapProps = ({
  // state properties
  state: {
    PROVIDER: { activeProvider },
    DX_MGN_POOL,
    loading,
  },
  // dispatchers
  appLoading,
  grabUserState,
  grabDXState,
  registerProviders,
  setActiveProvider,
  getDXTokenBalance,
  saveContract,
  saveTotalPoolShares,
}) => ({
  // state properties
  state: {
    DX_MGN_POOL,
    activeProvider,
    loading,
  },
  // dispatchers
  dispatchers: {
    appLoading,
    grabUserState,
    grabDXState,
    registerProviders,
    setActiveProvider,
    getDXTokenBalance,
    saveContract,
    saveTotalPoolShares,
  },
})

export default connect(mapProps)(process.env.NODE_ENV !== 'production'
  ? ConfigDisplayerHOC(WalletIntegration)
  : WalletIntegration)

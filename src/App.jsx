import React from 'react'
import { hot } from 'react-hot-loader'

import { DutchXVerificationHOC as withDXVerification } from '@gnosis.pm/dutchx-verification-react'

import AppOnlineStatusBar from './components/display/AppOnlineStatus'
import Blocked from './components/display/Modals/Blocked'
import Home from './components/display/Home'
import StateProvider from './components/StateProvider'

import { 
  GlobalSubscription,
  GlobalSub,
} from './subscriptions'

import { LOCALFORAGE_KEYS } from './globals'

const SubscribedApp = () =>
  // App is NOT blocked - render
  <GlobalSubscription source={GlobalSub}>
    {subState =>
      <StateProvider subState={subState}>       
        <AppOnlineStatusBar />
        <Home />
      </StateProvider>
    }
  </GlobalSubscription>

const ModalWrappedApp = withDXVerification(SubscribedApp)(LOCALFORAGE_KEYS.VERIFICATION_SETTINGS, LOCALFORAGE_KEYS.COOKIE_SETTINGS)

const App = ({
  disabledReason,
}) => (
  disabledReason 
    ?
  // App is blocked 
  <Blocked /> 
    :
  <ModalWrappedApp />
)

export default hot(module)(App)

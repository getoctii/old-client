import React, { Suspense } from 'react'
import { useMedia } from 'react-use'
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom'
import { Authenticate } from './authentication/Authenticate'
import { PrivateRoute } from './authentication/PrivateRoute'
import Community from './community/Community'
import { UI } from './state/ui'
import NewConversation from './conversation/NewConversation'
import Settings from './settings/Settings'
import Conversation from './conversation/Conversation'
import Sidebar from './sidebar/Sidebar'
import { NewCommunity } from './sidebar/NewCommunity'
import { AnimatePresence } from 'framer-motion'
import Loader from './components/Loader'
import { Auth } from './authentication/state'
import Home from './marketing/Home'
import Status from './components/Status'
import { isPlatform } from '@ionic/react'
import Incoming from './call/Incoming'
import { Call } from './state/call'
import Current from './call/Current'
import EventSource from './events'
import Context from './components/Context'
import Image from './chat/embeds/Image'

const Modals = () => {
  const uiStore = UI.useContainer()

  return (
    <>
      <AnimatePresence>
        {uiStore.modal.name === 'newConversation' && <NewConversation />}
        {uiStore.modal.name === 'newCommunity' && <NewCommunity />}
        {uiStore.modal.name === 'previewImage' && (
          <Image.Preview {...uiStore.modal.props} />
        )}
        {uiStore.modal.name === 'incomingCall' && (
          <Incoming {...uiStore.modal.props} />
        )}
      </AnimatePresence>
      {uiStore.modal.name === 'status' && <Status />}

      {uiStore.contextMenu && <Context.Menu {...uiStore.contextMenu} />}
    </>
  )
}

export const Router = () => {
  const auth = Auth.useContainer()
  const isMobile = useMedia('(max-width: 940px)')
  const isPWA = useMedia('(display-mode: standalone)')
  const call = Call.useContainer()
  return (
    <BrowserRouter>
      {auth.authenticated && <EventSource />}
      <Context.Global />
      {isPlatform('capacitor') || isPWA ? (
        <Redirect path='/home' to='/authenticate/login' />
      ) : (
        <Route path='/home' component={Home} />
      )}
      <Route path='/authenticate' component={Authenticate} />
      <div id='main'>
        <Modals />
        {auth.authenticated && !isMobile && (
          <>
            <Suspense fallback={<></>}>
              {call.callState !== 'idle' && <Current />}
            </Suspense>
          </>
        )}
        {auth.authenticated && !isMobile && <Sidebar />}
        {/* debug reasons */}
        <Suspense fallback={<></>}>
          <Switch>
            <PrivateRoute
              path='/settings'
              component={() => (
                <>
                  {isMobile && <Sidebar />}
                  <Suspense fallback={<Loader />}>
                    <Settings />
                  </Suspense>
                </>
              )}
            />
            <PrivateRoute
              path='/communities/:id'
              component={() => <Community />}
            />
            <PrivateRoute
              path={'/(conversations)?/:id?'}
              component={() => <Conversation />}
              redirect={
                isPlatform('capacitor') || isPWA
                  ? '/authenticate/login'
                  : '/home'
              }
              exact
            />
          </Switch>
        </Suspense>
      </div>
    </BrowserRouter>
  )
}

import React, { Suspense } from 'react'
import { useMedia } from 'react-use'
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom'
import { Authenticate } from './authentication/Authenticate'
import { PrivateRoute } from './authentication/PrivateRoute'
import { Conversations } from './conversation/Conversations'
import Community from './community/Community'
import Empty from './conversation/empty/Empty'
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

export const Router = () => {
  const uiStore = UI.useContainer()
  const auth = Auth.useContainer()
  const isMobile = useMedia('(max-width: 940px)')
  const call = Call.useContainer()
  return (
    <BrowserRouter>
      {auth.authenticated && <EventSource />}
      {isPlatform('capacitor') ? (
        <Redirect path='/home' to='/authenticate/login' />
      ) : (
        <Route path='/home' component={Home} />
      )}
      <Route path='/authenticate' component={Authenticate} />
      <div id='main'>
        <AnimatePresence>
          {uiStore.modal.name === 'newConversation' && <NewConversation />}
          {uiStore.modal.name === 'newCommunity' && <NewCommunity />}
          {uiStore.modal.name === 'incomingCall' && (
            <Incoming {...uiStore.modal.props} />
          )}
        </AnimatePresence>
        {auth.authenticated && !isMobile && (
          <>
            <Suspense fallback={<></>}>
              {call.callState !== 'idle' && <Current />}
            </Suspense>
          </>
        )}

        {uiStore.modal.name === 'status' && <Status />}
        {auth.authenticated && !isMobile && <Sidebar />}
        {/* debug reasons */}
        <Suspense fallback={<></>}>
          <Switch>
            <PrivateRoute
              path='/'
              component={() => (
                <>
                  {isMobile && <Sidebar />}
                  <Suspense fallback={<Loader />}>
                    <Conversations />
                    {!isMobile && <Empty />}
                  </Suspense>
                </>
              )}
              redirect={
                isPlatform('capacitor') ? '/authenticate/login' : '/home'
              }
              exact
            />
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
              path='/conversations/:channelID'
              component={() => <Conversation />}
            />
            <PrivateRoute
              path='/communities/:id'
              component={() => <Community />}
            />
          </Switch>
        </Suspense>
      </div>
    </BrowserRouter>
  )
}

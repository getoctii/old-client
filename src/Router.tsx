import React, { memo, Suspense, useEffect } from 'react'
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
import { Plugins } from '@capacitor/core'
import { clientGateway, ModalTypes } from './utils/constants'
import AddParticipant from './chat/AddParticipant'
import { Confirmation } from './components/Confirmation'
import Downloads from './marketing/Downloads'
import Invite from './invite/Invite'
import Admin from './admin/Admin'

const { PushNotifications } = Plugins

const ResolveModal = ({ name, props }: { name: ModalTypes; props?: any }) => {
  const isMobile = useMedia('(max-width: 740px)')
  switch (name) {
    case ModalTypes.ADD_PARTICIPANT:
      return <AddParticipant {...props} />
    case ModalTypes.DELETE_MESSAGE:
      return <Confirmation {...props} />
    case ModalTypes.INCOMING_CALL:
      return !isMobile ? <Incoming {...props} /> : <></>
    case ModalTypes.NEW_COMMUNITY:
      return <NewCommunity />
    case ModalTypes.NEW_CONVERSATION:
      return <NewConversation />
    case ModalTypes.PREVIEW_IMAGE:
      return <Image.Preview {...props} />
    case ModalTypes.STATUS:
      return <Status />
    default:
      return <></>
  }
}

const Modals = () => {
  const uiStore = UI.useContainer()
  useEffect(() => {
    // @ts-ignore
    window.setModal = uiStore.setModal
  }, [uiStore])
  if (uiStore.modal) {
    return (
      <AnimatePresence>
        <ResolveModal {...uiStore.modal} />
      </AnimatePresence>
    )
  } else if (uiStore.contextMenu) {
    return <Context.Menu {...uiStore.contextMenu} />
  } else {
    return <></>
  }
}

const IncomingCall = () => {
  const auth = Auth.useContainer()
  const call = Call.useContainer()
  const uiStore = UI.useContainer()
  const isMobile = useMedia('(max-width: 740px)')

  return auth.authenticated && isMobile ? (
    <>
      <Suspense fallback={<></>}>
        {call.callState !== 'idle' && <Current />}
        {uiStore.modal?.name === ModalTypes.INCOMING_CALL && (
          <Incoming {...uiStore.modal.props} />
        )}
      </Suspense>
    </>
  ) : (
    <></>
  )
}

export const Router = memo(() => {
  const auth = Auth.useContainer()
  const isMobile = useMedia('(max-width: 740px)')
  const isPWA = useMedia('(display-mode: standalone)')
  const call = Call.useContainer()
  useEffect(() => {
    if (auth.authenticated && isPlatform('capacitor')) {
      PushNotifications.addListener('registration', async (token) => {
        await clientGateway.post(
          `/users/${auth.id}/notifications`,
          new URLSearchParams({
            token: token.value,
            platform: 'ios'
          }),
          {
            headers: {
              authorization: auth.token
            }
          }
        )
      })

      if (localStorage.getItem('requested-notifications') !== 'true') {
        PushNotifications.requestPermission()
          .then(({ granted }) => {
            if (granted) {
              PushNotifications.register()
              localStorage.setItem('requested-notifications', 'true')
            }
          })
          .catch(console.error)
      }
    }
    return () => {
      if (isPlatform('capacitor')) PushNotifications.removeAllListeners()
    }
  }, [auth])

  return (
    <BrowserRouter>
      <IncomingCall />
      {auth.authenticated && <EventSource />}
      <Context.Global />
      <Switch>
        {isPlatform('mobile') || isPWA ? (
          <Redirect path='/home' to='/authenticate/login' />
        ) : (
          <Route path='/home' component={Home} />
        )}
        {isPlatform('mobile') || isPWA ? (
          <Redirect path='/downloads' to='/authenticate/login' />
        ) : (
          <PrivateRoute path='/downloads' component={Downloads} />
        )}
        <Route path={'/invite/:invite/:code?'} component={Invite} />
        <Route path='/authenticate' component={Authenticate} />
        <div id='main'>
          <Modals />
          {auth.authenticated && !isMobile && <Sidebar />}
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
              <PrivateRoute path={'/admin'} component={Admin} />
              <PrivateRoute path='/communities/:id' component={Community} />
              <PrivateRoute
                path={'/(conversations)?/:id?'}
                component={Conversation}
                redirect={
                  isPlatform('mobile') || isPWA
                    ? '/authenticate/login'
                    : '/home'
                }
                exact
              />
            </Switch>
          </Suspense>
          {auth.authenticated && !isMobile && (
            <>
              <Suspense fallback={<></>}>
                {call.callState !== 'idle' && <Current />}
              </Suspense>
            </>
          )}
        </div>
      </Switch>
    </BrowserRouter>
  )
})

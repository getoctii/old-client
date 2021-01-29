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
import { NewGroup } from './community/settings/groups/NewGroup'
import Invite from './invite/Invite'
import Admin from './admin/Admin'
import ManageGroups from './community/ManageGroups'
import { NewChannel } from './community/NewChannel'
import NewInvite from './community/NewInvite'
import { Permission } from './utils/permissions'
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
    case ModalTypes.NEW_PERMISSION:
      return <NewGroup />
    case ModalTypes.PREVIEW_IMAGE:
      return <Image.Preview {...props} />
    case ModalTypes.STATUS:
      return <Status />
    case ModalTypes.NEW_CHANNEL:
      return <NewChannel />
    case ModalTypes.NEW_INVITE:
      return <NewInvite />
    case ModalTypes.DELETE_CHANNEL:
      return <Confirmation {...props} />
    case ModalTypes.MANAGE_MEMBER_GROUPS:
      return <ManageGroups {...props} />
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
          {
            token: token.value,
            platform: 'ios'
          },
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
    <div id='main'>
      <BrowserRouter>
        <Context.Global />
        <Switch>
          {!isPlatform('capacitor') && !isPWA ? (
            <Route path='/home' component={Home} exact />
          ) : (
            <Redirect path='/home' to='/authenticate/login' exact />
          )}
          {isPlatform('capacitor') || isPWA ? (
            <Redirect path='/downloads' to='/authenticate/login' exact />
          ) : (
            <PrivateRoute path='/downloads' component={Downloads} exact />
          )}
          <Route
            path={'/invite/:invite/:code?'}
            component={() => (
              <>
                {auth.authenticated && <Sidebar />}
                <Invite />
              </>
            )}
            exact
          />
          <Route path='/authenticate' component={Authenticate} />
          {!auth.authenticated && (
            <Redirect
              path='/'
              to={isPlatform('capacitor') ? '/authenticate/login' : '/home'}
            />
          )}
        </Switch>
        {auth.authenticated && (
          <Permission.Provider>
            <IncomingCall />
            <EventSource />
            <Modals />
            <Suspense fallback={<></>}>
              <Switch>
                <PrivateRoute
                  path='/settings'
                  sidebar
                  component={() => (
                    <>
                      {isMobile && <Sidebar />}
                      <Suspense fallback={<Loader />}>
                        <Settings />
                      </Suspense>
                    </>
                  )}
                />
                <PrivateRoute path={'/admin'} sidebar component={Admin} />
                <PrivateRoute
                  path='/communities/:id'
                  sidebar
                  component={Community}
                />
                <PrivateRoute
                  sidebar
                  path={'/conversations/:id?'}
                  component={() => (
                    <Suspense fallback={<></>}>
                      <Conversation />
                    </Suspense>
                  )}
                  redirect={
                    isPlatform('mobile') || isPWA
                      ? '/authenticate/login'
                      : '/home'
                  }
                  exact
                />
                <Redirect path={'/'} to={'/conversations'} exact />
              </Switch>
            </Suspense>
            {!isMobile && (
              <>
                <Suspense fallback={<></>}>
                  {call.callState !== 'idle' && <Current />}
                </Suspense>
              </>
            )}
          </Permission.Provider>
        )}
      </BrowserRouter>
    </div>
  )
})

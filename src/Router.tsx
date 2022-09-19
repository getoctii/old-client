import {
  FC,
  memo,
  Suspense,
  useEffect,
  useMemo,
  useState,
  useCallback
} from 'react'
import { useLocation, useMedia } from 'react-use'
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom'
import { Authenticate } from './authentication/Authenticate'
import { PrivateRoute } from './authentication/PrivateRoute'
import Community from './community/Community'
import { UI } from './state/ui'
import Settings from './settings/Settings'
import Conversation from './conversation/Conversation'
import Sidebar from './sidebar/Sidebar'
import { AnimatePresence } from 'framer-motion'
import Loader from './components/Loader'
import { Auth } from './authentication/state'
import Home from './marketing/Home'
import { isPlatform } from '@ionic/react'
import { Call } from './state/call'
import Current from './call/Current'
import EventSource from './events'
import Context from './components/Context'
import { Plugins } from '@capacitor/core'
import { clientGateway } from './utils/constants'
import Downloads from './marketing/Downloads'
import Invite from './invite/Invite'
import Admin from './admin/Admin'
import { useQuery } from 'react-query'
import { getCommunities, getParticipants } from './user/remote'
import OnBoarding from './marketing/OnBoarding'
import { useSuspenseStorageItem } from './utils/storage'
import Modal from './components/Modals'
import { Permission } from './utils/permissions'
import Hub from './hub/Hub'
const { PushNotifications } = Plugins

const ContextMenuHandler: FC = () => {
  const uiStore = UI.useContainer()

  return uiStore.contextMenu ? (
    <Permission.Provider>
      <Context.Menu {...uiStore.contextMenu} />
    </Permission.Provider>
  ) : (
    <></>
  )
}

const IncomingCall: FC = () => {
  const auth = Auth.useContainer()
  const call = Call.useContainerSelector(({ room }) => ({ room }))
  const isMobile = useMedia('(max-width: 740px)')
  return auth.authenticated && isMobile ? (
    <>
      <Suspense fallback={<></>}>{call.room && <Current />}</Suspense>
    </>
  ) : (
    <></>
  )
}

const MarketingRouter: FC = () => {
  const auth = Auth.useContainer()
  const isPWA = useMedia('(display-mode: standalone)')

  return (
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
  )
}

const OnboardingHandler: FC<{
  onboardingStateChange: (state: boolean) => void
}> = ({ onboardingStateChange }) => {
  const auth = Auth.useContainer()

  const [onboardingComplete] = useSuspenseStorageItem<boolean>(
    'onboarding-complete',
    false
  )
  const { data: communities } = useQuery(
    ['communities', auth.id, auth.token],
    getCommunities
  )
  const { data: participants } = useQuery(
    ['participants', auth.id, auth.token],
    getParticipants
  )
  const filteredParticipants = useMemo(
    () =>
      participants?.filter((part) => part.conversation.participants.length > 1),
    [participants]
  )

  const showOnBoarding = useMemo(() => {
    return (
      (communities?.length ?? 0) < 1 &&
      (filteredParticipants?.length ?? 0) < 1 &&
      !onboardingComplete
    )
  }, [communities?.length, filteredParticipants?.length, onboardingComplete])

  useEffect(() => {
    onboardingStateChange(showOnBoarding)
  }, [showOnBoarding, onboardingStateChange])

  return <></>
}

const AppRouter: FC = () => {
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
          .then(async ({ granted }) => {
            if (granted) {
              await PushNotifications.register()
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

  const [showOnBoarding, setShowOnBoarding] = useState(false)

  const onboardingHandler = useCallback((state: boolean) => {
    setShowOnBoarding(state)
  }, [])

  return (
    <>
      <OnboardingHandler onboardingStateChange={onboardingHandler} />
      <EventSource />
      <Suspense fallback={<></>}>
        {showOnBoarding ? (
          <OnBoarding />
        ) : (
          <>
            <Switch>
              <PrivateRoute
                path='/settings'
                render={() => (
                  <>
                    {isMobile && <Sidebar />}
                    <Suspense fallback={<Loader />}>
                      <Settings />
                    </Suspense>
                  </>
                )}
              />
              <PrivateRoute path={'/admin'} render={Admin} />
              <PrivateRoute path='/communities/:id' render={Community} />
              <PrivateRoute
                path={'/conversations'}
                render={Conversation}
                redirect={
                  isPlatform('mobile') || isPWA
                    ? '/authenticate/login'
                    : '/home'
                }
              />
              <PrivateRoute
                path={'/hub'}
                render={() => (
                  <>
                    {isMobile && <Sidebar />}
                    <Suspense fallback={<Loader />}>
                      <Hub />
                    </Suspense>
                  </>
                )}
              />
              <Redirect path={'/'} to={'/conversations'} exact />
            </Switch>
          </>
        )}
      </Suspense>
      {!isMobile && (
        <>
          <Suspense fallback={<></>}>{call.room && <Current />}</Suspense>
        </>
      )}
      <IncomingCall />
    </>
  )
}

const SidebarWrapper: FC = () => {
  const location = useLocation()

  if (
    location.pathname === '/home' ||
    location.pathname === '/downloads' ||
    location.pathname?.startsWith('/invite')
  )
    return <></>

  return <Sidebar />
}

export const Router: FC = memo(() => {
  const auth = Auth.useContainer()
  const isMobile = useMedia('(max-width: 740px)')
  return (
    <div id='main'>
      <BrowserRouter>
        <Context.Global />
        {!isMobile && auth.authenticated && <SidebarWrapper />}
        <MarketingRouter />
        {auth.authenticated && <AppRouter />}
        <Suspense fallback={<></>}>
          <AnimatePresence>
            <Modal key='modals' />
            <ContextMenuHandler key='contextmenu' />
          </AnimatePresence>
        </Suspense>
      </BrowserRouter>
    </div>
  )
})

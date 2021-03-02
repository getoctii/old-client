import React from 'react'
import ReactDOM from 'react-dom'
import './index.scss'
import 'typeface-inter'
import * as serviceWorkerRegistration from './utils/serviceWorkerRegistration'
import { Router } from './Router'
import { ReactQueryDevtools } from 'react-query-devtools'
import { Auth } from './authentication/state'
import { queryCache, ReactQueryConfigProvider } from 'react-query'
import Loader from './components/Loader'
import Error from './components/Error'
import { UI } from './state/ui'
import '@sentry/browser'
import * as Sentry from '@sentry/react'
import SentryRRWeb from '@sentry/rrweb'
import { LocalNotifications } from '@capacitor/core'
import Theme from './theme/hook'
import Typing from './state/typing'
import { ScrollPosition } from './state/scroll'
import { Call } from './state/call'
import { Chat } from './chat/state'
import { Integrations } from '@sentry/tracing'
import { AxiosError } from 'axios'
import { HelmetProvider } from 'react-helmet-async'
// @ts-ignore
import smoothscroll from 'smoothscroll-polyfill'
import { isPlatform } from '@ionic/react'
import { ModalTypes } from './utils/constants'

smoothscroll.polyfill()

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn:
      'https://6f9ffeb08c814b15971d8241698bee28@o271654.ingest.sentry.io/5541960',
    integrations: [new SentryRRWeb(), new Integrations.BrowserTracing()],
    release: process.env.REACT_APP_VERSION,
    tracesSampleRate: 0.5
  })
}

console.log(
  `%cHey!

If anyone told you to paste something here, they're deceiving you. Anything pasted here has access to your account. Thank you for using Octii!

With love,
Lleyton

P.S. If you do know what you're doing, maybe you should join us :P.
lleyton@innatical.com
`,
  'font-size: 18px; font-family: Inter, sans-serif; font-weight: 600'
)

LocalNotifications.requestPermission().catch(() =>
  console.warn('Notifications not supported')
)

document.oncontextmenu = (event) => {
  event.preventDefault()
}

ReactDOM.render(
  <React.StrictMode>
    <ReactQueryConfigProvider
      config={{
        shared: {
          suspense: true
        },
        queries: {
          refetchOnWindowFocus: false
        }
      }}
    >
      <Sentry.ErrorBoundary
        onReset={() => queryCache.resetErrorBoundaries()}
        fallback={({
          resetError,
          error
        }: {
          resetError: () => void
          error: AxiosError
        }) => <Error resetErrorBoundary={resetError} error={error} />}
      >
        <React.Suspense fallback={<Loader />}>
          <HelmetProvider>
            <Auth.Provider>
              <UI.Provider>
                <Typing.Provider>
                  <Call.Provider>
                    <Chat.Provider>
                      <Theme.Provider>
                        <ScrollPosition.Provider>
                          <Router />
                        </ScrollPosition.Provider>
                      </Theme.Provider>
                    </Chat.Provider>
                  </Call.Provider>
                </Typing.Provider>
              </UI.Provider>
            </Auth.Provider>
          </HelmetProvider>
          <ReactQueryDevtools />
        </React.Suspense>
      </Sentry.ErrorBoundary>
    </ReactQueryConfigProvider>
  </React.StrictMode>,
  document.getElementById('root')
)

if (!isPlatform('capacitor')) {
  serviceWorkerRegistration.register({
    onUpdate: (registration) => {
      const waitingServiceWorker = registration.waiting
      if (waitingServiceWorker) {
        waitingServiceWorker.addEventListener('statechange', (event) => {
          // @ts-ignore
          if (event?.target?.state === 'activated') {
            window.location.reload()
          }
        })
      }
      // @ts-ignore
      window.waitingServiceWorker = waitingServiceWorker
      // @ts-ignore
      window.setModal({ name: ModalTypes.UPDATE })
    }
  })
}

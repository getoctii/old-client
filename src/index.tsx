// import './wdyr'
import React from 'react'
import ReactDOM from 'react-dom'
import './index.scss'
import 'typeface-inter'
import * as serviceWorker from './serviceWorker'
import { Router } from './Router'
import { ReactQueryDevtools } from 'react-query-devtools'
import { Auth } from './authentication/state'
import { queryCache, ReactQueryConfigProvider } from 'react-query'
import Loader from './components/Loader'
import Error from './components/Error'
import EventSource from './EventSource'
import { UI } from './state/ui'
import '@sentry/browser'
import * as Sentry from '@sentry/react'
import SentryRRWeb from '@sentry/rrweb'
import { LocalNotifications } from '@capacitor/core'
import Theme from './theme/hook'
import Typing from './state/typing'

Sentry.init({
  dsn:
    'https://ed58056045ea4fb599148359fa30aac0@o271654.ingest.sentry.io/5400867',
  integrations: [new SentryRRWeb()],
  release: process.env.REACT_APP_VERSION
})

console.log(
  '%c+',
  `background: url("https://file.coffee/u/wkV2Mrh7bl.png") no-repeat; background-size: 500px 696px; color: transparent; font-size: 1px; padding: 348px 250px; ${
    /^((?!chrome|android).)*safari/i.test(navigator.userAgent) &&
    'line-height: 696px;'
  }`
)
console.log(
  `%cHey!

If anyone told you to paste something here, they're deceiving you. Anything pasted here has access to your account. Thank you for using Octii!

With love,
Octii-chan and Lleyton

P.S. If you do know what you're doing, maybe you should join us :P.
lleyton@innatical.com

P.P.S. Thanks to https://twitter.com/TheDragonGirl24 for the amazing art!
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
          refetchOnWindowFocus: process.env.NODE_ENV === 'production'
        }
      }}
    >
      <Sentry.ErrorBoundary
        onReset={() => queryCache.resetErrorBoundaries()}
        fallback={({ resetError }) => <Error resetErrorBoundary={resetError} />}
      >
        <React.Suspense fallback={<Loader />}>
          <Auth.Provider>
            <UI.Provider>
              <Typing.Provider>
                <Theme.Provider>
                  <Router />
                  <EventSource />
                </Theme.Provider>
              </Typing.Provider>
            </UI.Provider>
          </Auth.Provider>
          <ReactQueryDevtools />
        </React.Suspense>
      </Sentry.ErrorBoundary>
    </ReactQueryConfigProvider>
  </React.StrictMode>,
  document.getElementById('root')
)

serviceWorker.unregister()

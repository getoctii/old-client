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
import { ErrorBoundary } from 'react-error-boundary'
import Loader from './components/Loader'
import Error from './components/Error'
import EventSource from './EventSource'
import { UI } from './uiStore'
import * as Sentry from '@sentry/react'
import { LocalNotifications } from '@capacitor/core'
import Theme from './theme/hook'

Sentry.init({
  dsn:
    'https://ed58056045ea4fb599148359fa30aac0@o271654.ingest.sentry.io/5400867',
  release: process.env.VERSION ?? undefined
})

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
        }
      }}
    >
      <ErrorBoundary
        onReset={() => queryCache.resetErrorBoundaries()}
        fallbackRender={({ resetErrorBoundary }) => (
          <Error resetErrorBoundary={resetErrorBoundary} />
        )}
      >
        <React.Suspense fallback={<Loader />}>
          <Auth.Provider>
            <UI.Provider>
              <Theme.Provider>
                <Router />
                <EventSource />
              </Theme.Provider>
            </UI.Provider>
          </Auth.Provider>
          <ReactQueryDevtools />
        </React.Suspense>
      </ErrorBoundary>
    </ReactQueryConfigProvider>
  </React.StrictMode>,
  document.getElementById('root')
)

serviceWorker.unregister()

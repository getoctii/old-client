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
              <Router />
              <EventSource />
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

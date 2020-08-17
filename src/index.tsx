import React from 'react'
import ReactDOM from 'react-dom'
import './index.scss'
import 'typeface-inter'
import * as serviceWorker from './serviceWorker'
import { Router } from './Router'
import { ReactQueryDevtools } from 'react-query-devtools'
import { Auth } from './authentication/state'
import { ReactQueryConfigProvider, queryCache } from 'react-query'
import { ErrorBoundary } from 'react-error-boundary'
import Loader from './components/Loader'
import Error from './components/Error'

ReactDOM.render(
  <React.StrictMode>
    <ReactQueryConfigProvider config={{
      shared: {
        suspense: true
      }
    }}>
      <ErrorBoundary
        onReset={() => queryCache.resetErrorBoundaries()}
        fallbackRender={({ error, resetErrorBoundary }) => <Error error={error} resetErrorBoundary={resetErrorBoundary} />}
      >
        <React.Suspense fallback={<Loader />}>
          <Auth.Provider>
            <Router/>
          </Auth.Provider>
          <ReactQueryDevtools />
        </React.Suspense>
      </ErrorBoundary>
    </ReactQueryConfigProvider>
  </React.StrictMode>,
  document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()

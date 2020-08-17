import React from 'react'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import { Authenticate } from './authentication/Authenticate'
import { PrivateRoute } from './authentication/PrivateRoute'
import { Sidebar } from './sidebar/Sidebar'
import { Community } from './community/Community'
import { ErrorBoundary } from 'react-error-boundary'
import { queryCache } from 'react-query'
import { SyncLoader } from 'react-spinners'
import Loader from './components/Loader'

export const Router = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route path='/authenticate' component={Authenticate} />
        <div id='main'>
          <Sidebar />
          <PrivateRoute path='/' component={Community} />
          <PrivateRoute path='/:id' component={Community} />
        </div>
      </Switch>
    </BrowserRouter>
  )
} 
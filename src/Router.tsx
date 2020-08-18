import React from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { Authenticate } from './authentication/Authenticate'
import { PrivateRoute } from './authentication/PrivateRoute'
import { Sidebar } from './sidebar/Sidebar'
import { Community } from './community/Community'
import Empty from './community/empty/Empty'

export const Router = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route path='/owo' component={() => <h1>owo</h1>}/>
        <Route path='/authenticate' component={Authenticate}/>
        <div id='main'>
          <Sidebar/>
          <PrivateRoute path='/' component={Empty} exact/>
          <PrivateRoute path='/conversations/:id' component={Community}/>
        </div>
      </Switch>
    </BrowserRouter>
  )
} 
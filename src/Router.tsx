import React from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { Authenticate } from './authentication/Authenticate'
import { PrivateRoute } from './authentication/PrivateRoute'
import { Sidebar } from './sidebar/Sidebar'
import { Community } from './community/Community'
import Empty from './community/empty/Empty'
import { UI } from './uiStore'
import NewConversation from './sidebar/menus/NewConversation'

export const Router = () => {
  const uiStore = UI.useContainer()
  return (
    <BrowserRouter>
      <Switch>
        <Route path='/owo' component={() => <h1>owo</h1>}/>
        <Route path='/authenticate' component={Authenticate}/>
        <div id='main'>
          {uiStore.modal === 'newConversation' && <NewConversation />}
          <Sidebar/>
          <PrivateRoute path='/' component={Empty} exact/>
          <PrivateRoute path='/conversations/:id' component={Community}/>
        </div>
      </Switch>
    </BrowserRouter>
  )
} 
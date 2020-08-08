import React, { useState, useEffect } from 'react'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import { Authenticate } from './authentication/Authenticate'
import { PrivateRoute } from './authentication/PrivateRoute'
import axios from 'axios'
import { Sidebar } from './sidebar/Sidebar'
import { Community } from './community/Community'

export const Router = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/authenticate" component={Authenticate}/>
        <div id='main'>
          <Sidebar></Sidebar>
          <PrivateRoute path="/" component={Community}/>
        </div>
      </Switch>
    </BrowserRouter>
  )
} 
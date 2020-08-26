import React, { useEffect } from 'react'
import { useMedia } from 'react-use'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { Authenticate } from './authentication/Authenticate'
import { PrivateRoute } from './authentication/PrivateRoute'
import { Sidebar } from './sidebar/Sidebar'
import { Community } from './community/Community'
import Empty from './community/empty/Empty'
import { UI } from './uiStore'
import NewConversation from './sidebar/menus/NewConversation'
import { Plugins, KeyboardResize, KeyboardStyle } from '@capacitor/core'
import { isPlatform } from '@ionic/react'
import Settings from './settings/Settings'

const { Keyboard, StatusBar } = Plugins

export const Router = () => {
  const uiStore = UI.useContainer()
  const isMobile = useMedia('(max-width: 800px)')
  const isDarkMode = useMedia('(prefers-color-scheme: dark)')
  useEffect(() => {
    if (isPlatform('mobile')) {
      StatusBar.setOverlaysWebView({ overlay: true })
      Keyboard.setResizeMode({ mode: KeyboardResize.Native })
      Keyboard.setStyle({
        style: isDarkMode ? KeyboardStyle.Dark : KeyboardStyle.Light
      })
    }
  }, [isDarkMode])

  return (
    <BrowserRouter>
      <Switch>
        <Route path="/authenticate" component={Authenticate} />
        <div id="main">
          {uiStore.modal === 'newConversation' && <NewConversation />}
          {uiStore.modal === 'settings' && <Settings />}
          {!isMobile && <Sidebar />}
          <PrivateRoute path="/" component={isMobile ? Sidebar : Empty} exact />
          <PrivateRoute path="/conversations/:id" component={Community} />
        </div>
      </Switch>
    </BrowserRouter>
  )
}

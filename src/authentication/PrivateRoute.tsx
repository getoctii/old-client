import React from 'react'
import { Auth } from './state'
import { Route, Redirect } from 'react-router-dom'
import Sidebar from '../sidebar/Sidebar'
import { useMedia } from 'react-use'
import { Suspense } from 'react'

export const PrivateRoute = ({
  component: Component,
  path,
  exact = false,
  redirect,
  sidebar
}: {
  component: React.FC
  path: string
  exact?: boolean
  redirect?: string
  sidebar?: boolean
}) => {
  const isMobile = useMedia('(max-width: 740px)')
  const auth = Auth.useContainer()
  return auth.authenticated ? (
    <Route
      path={path}
      component={() => (
        <Suspense fallback={<></>}>
          {!isMobile && sidebar && <Sidebar />}
          <Component />
        </Suspense>
      )}
      exact={exact}
    />
  ) : (
    <Redirect to={{ pathname: redirect ? redirect : '/authenticate' }} />
  )
}

import React from 'react'
import { Auth } from './state'
import { Route, Redirect } from 'react-router-dom'
import { Suspense } from 'react'

export const PrivateRoute = ({
  component: Component,
  path,
  exact = false,
  redirect
}: {
  component: React.FC
  path: string
  exact?: boolean
  redirect?: string
}) => {
  const auth = Auth.useContainer()
  return auth.authenticated ? (
    <Route
      path={path}
      component={() => (
        <Suspense fallback={<></>}>
          <Component />
        </Suspense>
      )}
      exact={exact}
    />
  ) : (
    <Redirect to={{ pathname: redirect ? redirect : '/authenticate' }} />
  )
}

import React, { FC, useMemo } from 'react'
import { Auth } from './state'
import { Route, Redirect } from 'react-router-dom'
import { Suspense } from 'react'

export const PrivateRoute: FC<{
  component?: React.FC
  render?: React.FC
  path: string
  exact?: boolean
  redirect?: string
}> = ({
  component: Component,
  path,
  exact = false,
  redirect,
  render: Render
}) => {
  const auth = Auth.useContainer()
  const memoedComponent = useMemo(
    () =>
      Component
        ? () => (
            <Suspense fallback={<></>}>
              <Component />
            </Suspense>
          )
        : undefined,
    [Component]
  )
  const memoedRender = useMemo(
    () =>
      Render
        ? () => (
            <Suspense fallback={<></>}>
              <Render />
            </Suspense>
          )
        : undefined,
    [Render]
  )
  return auth.authenticated ? (
    memoedComponent ? (
      <Route path={path} exact={exact} component={memoedComponent} />
    ) : memoedRender ? (
      <Route path={path} exact={exact} render={memoedRender} />
    ) : (
      <></>
    )
  ) : (
    <Redirect to={{ pathname: redirect ? redirect : '/authenticate' }} />
  )
}

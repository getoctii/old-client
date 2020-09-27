import React from 'react'
import styles from './Authenticate.module.scss'
import { Link, Switch, Route, Redirect, useLocation } from 'react-router-dom'
import { Login } from './forms/Login'
import { Register } from './forms/Register'
import { Auth } from './state'

export const Authenticate = () => {
  const location = useLocation()
  const auth = Auth.useContainer()
  if (auth.authenticated) return <Redirect to='/' />
  return (
    <div className={styles.wrapper}>
      <main className={styles.card}>
        <h1>Octii</h1>
        <h2>
          by <b>Innatical</b>
        </h2>
        <Switch>
          <Route name='Login' path={'/authenticate/login'} component={Login} />
          <Route
            name='Register'
            path={'/authenticate/register'}
            component={Register}
          />
          <Route
            exact
            component={() => <Redirect to={'/authenticate/login'} />}
          />
        </Switch>
        <nav>
          {location.pathname !== '/authenticate/register' ? (
            <Link to={'/authenticate/register'}>Not Registered?</Link>
          ) : (
            <></>
          )}
          {location.pathname !== '/authenticate/login' ? (
            <Link to={'/authenticate/login'}>Already Registered?</Link>
          ) : (
            <></>
          )}
        </nav>
      </main>
    </div>
  )
}

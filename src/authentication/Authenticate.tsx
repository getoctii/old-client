import { FC } from 'react'
import styles from './Authenticate.module.scss'
import { Link, Switch, Route, Redirect, useRouteMatch } from 'react-router-dom'
import { Login } from './forms/Login'
import { Register } from './forms/Register'
import { Auth } from './state'

export const Authenticate: FC = () => {
  const match = useRouteMatch<{ page: 'login' | 'register' }>(
    '/authenticate/:page'
  )
  const auth = Auth.useContainer()
  if (auth.authenticated) return <Redirect to='/' />
  return (
    <div className={styles.wrapper}>
      <main className={styles.card}>
        <picture>
          <img alt='Octii' src='/logo.svg' />
        </picture>
        <h1>{match?.params.page === 'register' ? 'Register' : 'Login'}</h1>
        <Switch>
          <Route path={'/authenticate/login'} component={Login} />
          <Route path={'/authenticate/register'} component={Register} />
          <Route
            exact
            component={() => <Redirect to={'/authenticate/login'} />}
          />
        </Switch>
        <nav>
          {match?.params.page === 'login' ? (
            <Link to={'/authenticate/register'}>Not Registered?</Link>
          ) : (
            <></>
          )}
          {match?.params.page === 'register' ? (
            <Link to={'/authenticate/login'}>Already Registered?</Link>
          ) : (
            <></>
          )}
        </nav>
      </main>

      <aside>
        <div className={styles.left}>
          <h1>
            <span className={styles.simple}>Simple.</span>
            <br />
            <span className={styles.private}>Private.</span>
            <br />
            <span className={styles.extensible}>Extensible.</span>
          </h1>
          <h3>Public Alpha</h3>
        </div>
        <div className={styles.timeline}>
          <div>
            Beta 1 <div className={styles.circle} />
          </div>
          <div>
            Beta 2 <div className={styles.circle} />
          </div>
          <div>
            Beta 3 <div className={`${styles.circle}`} />
          </div>
          <div>
            Public Alpha
            <div className={`${styles.circle} ${styles.current}`} />
          </div>
          <div>
            Public Beta <div className={`${styles.circle} ${styles.next}`} />
          </div>
          <div>
            Release <div className={`${styles.circle} ${styles.next}`} />
          </div>
        </div>
      </aside>
    </div>
  )
}

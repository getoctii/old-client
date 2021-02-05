import React from 'react'
import { useHistory } from 'react-router-dom'
import { Auth } from '../authentication/state'
import Button from '../components/Button'
import styles from './Navbar.module.scss'

const Navbar = () => {
  const history = useHistory()
  const auth = Auth.useContainer()
  return (
    <div className={styles.navbar}>
      <div className={styles.branding}>
        <h1>Octii</h1>
      </div>
      <Button
        type='button'
        onClick={() =>
          auth.authenticated ? history.push('/') : history.push('/authenticate')
        }
      >
        {auth.authenticated ? 'Access' : 'Login'}
      </Button>
    </div>
  )
}

export default Navbar

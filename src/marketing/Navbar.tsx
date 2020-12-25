import React from 'react'
import { useHistory } from 'react-router-dom'
import Button from '../components/Button'
import styles from './Navbar.module.scss'

const Navbar = () => {
  const history = useHistory()
  return (
    <div className={styles.navbar}>
      <div className={styles.branding}>
        <picture>
          <source srcSet='/logo.webp' type='image/webp' />
          <img alt='Octii' src='/logo.png' />
        </picture>
        <h1>Octii</h1>
      </div>
      <Button type='button' onClick={() => history.push('/authenticate')}>
        Login
      </Button>
    </div>
  )
}

export default Navbar

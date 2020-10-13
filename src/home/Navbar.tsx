import React from 'react'
import Button from '../components/Button'
import styles from './Navbar.module.scss'

const Navbar = () => {
  return (
    <div className={styles.navbar}>
      <div className={styles.branding}>
        <img src='/logo512.png' />
        <h1>Octii</h1>
      </div>
      <Button type='button'>Get Notified</Button>
    </div>
  )
}

export default Navbar

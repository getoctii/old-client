import React from 'react'
import { useHistory } from 'react-router-dom'
import styles from './Footer.module.scss'

const Footer = () => {
  const history = useHistory()
  return (
    <div className={styles.footer}>
      <div className={styles.container}>
        <h3>
          Made with <span className={styles.heart}>♥</span> by{' '}
          <a href='https://innatical.com'>Innatical</a>
        </h3>
        <ul className={styles.menus}>
          {/* <li onClick={() => history.push('/privacy')}>Privacy Policy</li> */}
          {/* <li onClick={() => history.push('/terms')}>Terms of Service</li> */}
        </ul>
      </div>
    </div>
  )
}

export default Footer

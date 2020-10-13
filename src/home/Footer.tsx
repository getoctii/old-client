import React from 'react'
import styles from './Footer.module.scss'

// WHAT ARE U DOING, IM GOING INSANE

const Footer = () => {
  return (
    <div className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.branding}>
          <p>© 2020 Innatical</p>
          <h3>Made with ❤️ by Innatical</h3>
        </div>
        <ul className={styles.menus}>
          <li>Privacy Policy</li>
          <li>Terms of Service</li>
        </ul>
      </div>
    </div>
  )
}

export default Footer

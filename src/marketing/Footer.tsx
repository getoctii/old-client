import React from 'react'
import styles from './Footer.module.scss'

const Footer = () => {
  return (
    <div className={styles.footer}>
      <div className={styles.container}>
        <h3>
          Made with <span className={styles.heart}>♥</span> by{' '}
          <a href='https://innatical.com'>Innatical</a>
        </h3>
      </div>
    </div>
  )
}

export default Footer

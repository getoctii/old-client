import React from 'react'
import Navbar from './Navbar'
import styles from './Downloads.module.scss'
import Button from '../components/Button'
import Footer from './Footer'

const Downloads = () => {
  return (
    <div className={styles.downloads}>
      <div className={styles.hero}>
        <Navbar />
        <div className={styles.info}>
          <h1>Downloads</h1>
          <p>This following are downloads to Octii </p>
        </div>
      </div>
      <div className={styles.body}>
        <ul>
          <li>
            <h3>macOS</h3>
            <p>
              Note: You might have to click View then Force Update in the menu
              to update the client.
            </p>
            <Button
              type='button'
              onClick={() =>
                (window.location.href =
                  'http://cdn.innatical.com/neko/octii.dmg')
              }
            >
              Download for macOS
            </Button>
          </li>
          <li>
            <h3>iOS</h3>
            <p>
              Note: iOS app is currently in TestFlight, you can request access
              in the Innatical Labs Discord.
            </p>
          </li>
          <li>
            <h3>Linux</h3>
            <p>
              Note: We do not currently support linux. Support will be added
              later.
            </p>
          </li>
          <li>
            <h3>Windows</h3>
            <Button
              type='button'
              onClick={() =>
                (window.location.href =
                  'http://cdn.innatical.com/neko/octii.zip')
              }
            >
              Download for Windows
            </Button>
          </li>
          <li>
            <h3>Android</h3>
            <p>
              Note: We do not currently support Android. Support will be added
              later.
            </p>
          </li>
        </ul>
      </div>
      <Footer />
    </div>
  )
}

export default Downloads

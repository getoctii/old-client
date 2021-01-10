import React from 'react'
import Navbar from './Navbar'
import styles from './Downloads.module.scss'
import Button from '../components/Button'

const Downloads = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.centered}>
        <Navbar />
        <h1>Downloads</h1>
        <ul>
          <li>
            <h3>macOS</h3>
            <p>Note: This version of the app does not include updates.</p>
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
            <p>
              Note: Windows app requires{' '}
              <a href='https://developer.microsoft.com/en-us/microsoft-edge/webview2/'>
                WebView2
              </a>
            </p>
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
    </div>
  )
}

export default Downloads

import React, { useState } from 'react'
import Modal from '../components/Modal'
import { Auth } from '../authentication/state'
import { UI } from '../uiStore'
import Sidebar from './Sidebar'
import styles from './Settings.module.scss'
import Profile from './Profile'
import Security from './Security'
import Themes from './Themes'

const Settings = () => {
  const ui = UI.useContainer()
  const [page, setPage] = useState('profile')
  return (
    <Modal
      fullscreen={true}
      onDismiss={() => ui.setModal('')}
    >
      <div className={styles.left}></div>
      <div className={styles.settings}>
        <Sidebar page={page} setPage={setPage} />
        {page === 'profile' && <Profile />}
        {page === 'security' && <Security />}
        {page === 'themes' && <Themes />}
      </div>
      <div className={styles.right}></div>
    </Modal>
  )
}

export default Settings

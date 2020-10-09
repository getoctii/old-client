import React, { useState } from 'react'
import Modal from '../components/Modal'
import { UI } from '../uiStore'
import Sidebar from './Sidebar'
import styles from './Settings.module.scss'
import Profile from './Profile'
import Security from './Security'
import Themes from './Themes'
import { useMedia } from 'react-use'

const Settings = () => {
  const ui = UI.useContainer()
  const isMobile = useMedia('(max-width: 800px)')
  const [page, setPage] = useState(isMobile ? '' : 'profile')
  return (
    <Modal
      className={styles.settingsModal}
      fullscreen={true}
      onDismiss={() => ui.setModal('')}
    >
      <div className={styles.left}></div>
      <div className={styles.settings}>
        {page !== '' && isMobile ? (
          <></>
        ) : (
          <Sidebar page={page} setPage={setPage} />
        )}
        {page === 'profile' && <Profile setPage={setPage} />}
        {page === 'security' && <Security setPage={setPage} />}
        {page === 'themes' && <Themes setPage={setPage} />}
      </div>
      <div className={styles.right}></div>
    </Modal>
  )
}

export default Settings

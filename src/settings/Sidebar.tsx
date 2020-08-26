import React from 'react'
import styles from './Sidebar.module.scss'
import { UI } from '../uiStore'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimesCircle, faUser, faShield, faPaintBrush } from '@fortawesome/pro-solid-svg-icons'

const Sidebar = ({ page, setPage }: { page: string, setPage: Function }) => {
  const ui = UI.useContainer()
  return (
    <div className={styles.sidebar}>
      <h2>Settings <span onClick={() => ui.setModal('')}><FontAwesomeIcon icon={faTimesCircle} /></span></h2>
      <div className={styles.list}>
        <div className={page === 'profile' ? styles.selected : ''} onClick={() => setPage('profile')}><FontAwesomeIcon icon={faUser} fixedWidth /> Profile</div>
        <div className={page === 'security' ? styles.selected : ''} onClick={() => setPage('security')}><FontAwesomeIcon icon={faShield} fixedWidth /> Security</div>
        <div className={page === 'themes' ? styles.selected : ''} onClick={() => setPage('themes')}><FontAwesomeIcon icon={faPaintBrush} fixedWidth /> Themes</div>
      </div>
    </div>
  )
}

export default Sidebar

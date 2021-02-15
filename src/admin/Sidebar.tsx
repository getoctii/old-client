import React from 'react'
import styles from './Sidebar.module.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useHistory, useRouteMatch } from 'react-router-dom'
import {
  faClipboardList,
  faNewspaper,
  faStreetView
} from '@fortawesome/pro-duotone-svg-icons'
import GitInfo from 'react-git-info/macro'
import dayjs from 'dayjs'

const gitInfo = GitInfo()

const Sidebar = () => {
  const history = useHistory()
  const match = useRouteMatch<{ page?: string }>('/admin/:page?')
  return (
    <div className={styles.sidebarWrapper}>
      <div className={styles.sidebar}>
        <h2>Admin Panel</h2>
        <div className={styles.list}>
          <div
            className={`${styles.tab} ${styles.lookup} ${
              match?.params.page === 'lookup' ? styles.selected : ''
            }`}
            onClick={() => history.push('/admin/lookup')}
          >
            <div className={styles.icon}>
              <FontAwesomeIcon icon={faStreetView} fixedWidth />
            </div>{' '}
            User Lookup
          </div>
          <hr />
          <div
            className={`${styles.tab} ${styles.codes} ${
              match?.params.page === 'codes' ? styles.selected : ''
            }`}
            onClick={() => history.push('/admin/codes')}
          >
            <div className={styles.icon}>
              <FontAwesomeIcon icon={faClipboardList} fixedWidth />
            </div>{' '}
            Codes
          </div>
          <hr />
          <div
            className={`${styles.tab} ${styles.news} ${
              match?.params.page === 'newsletters' ? styles.selected : ''
            }`}
            onClick={() => history.push('/admin/newsletters')}
          >
            <div className={styles.icon}>
              <FontAwesomeIcon icon={faNewspaper} fixedWidth />
            </div>{' '}
            Newsletter
          </div>
        </div>
        <p className={styles.buildInfo}>
          <strong>Branch:</strong> <kbd>{gitInfo.branch}</kbd>
          <br />
          <strong>Hash:</strong> <kbd>{gitInfo.commit.shortHash}</kbd>
          <br />
          <strong>Date:</strong>{' '}
          <kbd>{dayjs(gitInfo.commit.date).calendar()}</kbd>
          <br />
          <strong>Message:</strong>
          <br />
          <kbd>{gitInfo.commit.message}</kbd>
        </p>
      </div>
    </div>
  )
}

export default Sidebar

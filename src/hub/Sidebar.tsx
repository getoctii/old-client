import React from 'react'
import styles from './Sidebar.module.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStoreAlt, faAddressBook } from '@fortawesome/pro-duotone-svg-icons'
import { useHistory, useRouteMatch } from 'react-router-dom'
import Friends from './friends/Friends'

const Sidebar = () => {
  const history = useHistory()
  const match = useRouteMatch<{ page: string }>('/hub/:page')
  return (
    <div className={styles.sidebarWrapper}>
      <div className={styles.sidebar}>
        <h2>Hub</h2>
        <div className={styles.list}>
          <div
            className={`${styles.tab} ${styles.innpages} ${
              match?.params.page === 'innpages' ? styles.selected : ''
            }`}
            onClick={() => history.push('/hub/innpages')}
          >
            <div className={styles.icon}>
              <FontAwesomeIcon icon={faAddressBook} fixedWidth />
            </div>{' '}
            innpages
          </div>
          <hr />
          <div
            className={`${styles.tab} ${styles.store} ${
              match?.params.page === 'store' ? styles.selected : ''
            }`}
            onClick={() => history.push('/hub/store')}
          >
            <div className={styles.icon}>
              <FontAwesomeIcon icon={faStoreAlt} fixedWidth />
            </div>{' '}
            Store
          </div>
        </div>
        <Friends />
      </div>
    </div>
  )
}

export default Sidebar

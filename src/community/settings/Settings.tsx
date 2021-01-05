import React, { useState } from 'react'
import { General } from './General'
import Invites from './Invites'
import { Navbar } from './Navbar'
import { useMedia } from 'react-use'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft } from '@fortawesome/pro-solid-svg-icons'
import { useHistory, useParams } from 'react-router-dom'
import styles from './Settings.module.scss'
import { getCommunity } from '../remote'
import { Auth } from '../../authentication/state'
import { useQuery } from 'react-query'

export const Settings = () => {
  const [selected, setSelected] = useState('general')
  const isMobile = useMedia('(max-width: 940px)')
  const { token } = Auth.useContainer()
  const { id } = useParams<{ id: string }>()
  const community = useQuery(['community', id, token], getCommunity)
  const history = useHistory()
  return (
    <div className={styles.wrapper}>
      <div className={styles.settings}>
        {/* <h2>
        {isMobile && (
          <div
            className={styles.icon}
            onClick={() => isMobile && history.push(`/communities/${id}`)}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </div>
        )}
        Settings
      </h2> */}

        <div className={styles.header}>
          {isMobile ? (
            <div
              className={styles.icon}
              onClick={() => isMobile && history.push(`/communities/${id}`)}
            >
              <FontAwesomeIcon
                className={styles.backButton}
                icon={faChevronLeft}
              />
            </div>
          ) : (
            <div
              className={styles.icon}
              style={{ backgroundImage: `url('${community.data?.icon}')` }}
            />
          )}
          <div className={styles.title}>
            <small>{community.data?.name}</small>
            <h2>Settings</h2>
          </div>
        </div>

        <Navbar selected={selected} setSelected={setSelected} />
        {selected === 'general' && <General />}
        {selected === 'invites' && <Invites />}
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import { General } from './General'
import Invites from './Invites'
import { Navbar } from './Navbar'
import { useMedia } from 'react-use'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft } from '@fortawesome/pro-solid-svg-icons'
import { useHistory, useParams, useRouteMatch } from 'react-router-dom'
import styles from './Settings.module.scss'
import { getCommunity } from '../remote'
import { Auth } from '../../authentication/state'
import { useQuery } from 'react-query'
import Permissions from './permissions/Permissions'
import { PrivateRoute } from '../../authentication/PrivateRoute'

export const Settings = () => {
  const isMobile = useMedia('(max-width: 740px)')
  const { token } = Auth.useContainer()
  const { id } = useParams<{ id: string }>()
  const community = useQuery(['community', id, token], getCommunity)
  const history = useHistory()
  const { path } = useRouteMatch()

  return (
    <div className={styles.wrapper}>
      <div className={styles.settings}>
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
        <Navbar />
        <PrivateRoute path={`${path}/invites`} component={Invites} exact />
        <PrivateRoute
          path={`${path}/permissions`}
          component={Permissions}
          exact
        />
        <PrivateRoute path={`${path}/general`} component={General} exact />
      </div>
    </div>
  )
}

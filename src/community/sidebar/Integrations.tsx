import { faAddressBook, faUserCog } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useMemo } from 'react'
import { useHistory, useRouteMatch } from 'react-router-dom'
import styles from './Integrations.module.scss'
import { useHasPermission } from '../../utils/permissions'
import { Permissions } from '../../utils/constants'

const IntegrationsView = () => {
  const history = useHistory()
  const matchTab = useRouteMatch<{ id: string; tab: string }>(
    '/communities/:id/:tab?'
  )

  const [community, hasPermissions] = useHasPermission(matchTab?.params.id)

  return (
    <div className={styles.integrations}>
      <div
        key='members'
        className={
          matchTab?.params.tab === 'members'
            ? `${styles.members} ${styles.selected}`
            : styles.members
        }
        onClick={() => {
          if (community) history.push(`/communities/${community.id}/members`)
        }}
      >
        <h4>
          <div className={styles.icon}>
            <FontAwesomeIcon icon={faAddressBook} fixedWidth={true} />
          </div>
          Members
        </h4>
      </div>
      {hasPermissions([
        Permissions.MANAGE_PERMISSIONS,
        Permissions.MANAGE_COMMUNITY,
        Permissions.MANAGE_INVITES
      ]) && (
        <div>
          <hr
            className={matchTab?.params.tab === 'members' ? styles.hidden : ''}
          />
          <div
            key='settings'
            className={
              matchTab?.params.tab === 'settings'
                ? `${styles.settings} ${styles.selected}`
                : styles.settings
            }
            onClick={() => {
              if (community)
                history.push(`/communities/${community.id}/settings/general`)
            }}
          >
            <h4>
              <div className={styles.icon}>
                <FontAwesomeIcon icon={faUserCog} fixedWidth={true} />
              </div>
              Settings
            </h4>
          </div>
        </div>
      )}
    </div>
  )
}

const Placeholder = () => {
  const integrationOne = useMemo(() => Math.floor(Math.random() * 5) + 3, [])
  const integrationTwo = useMemo(() => Math.floor(Math.random() * 6) + 3, [])
  return (
    <div className={styles.placeholder}>
      <div className={styles.integration}>
        <div className={styles.icon} />
        <div
          className={styles.text}
          style={{ width: `${integrationOne}rem` }}
        />
      </div>
      <hr />
      <div className={styles.integration}>
        <div className={styles.icon} />
        <div
          className={styles.text}
          style={{ width: `${integrationTwo}rem` }}
        />
      </div>
    </div>
  )
}

const Integrations = { View: IntegrationsView, Placeholder }

export default Integrations

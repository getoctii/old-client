import { faAddressBook, faUserCog } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { Auth } from '../../authentication/state'
import { CommunityResponse } from '../remote'
import styles from './Integrations.module.scss'

export const Integrations = ({
  community
}: {
  community?: CommunityResponse
}) => {
  const auth = Auth.useContainer()
  const history = useHistory()
  const matchTab = useRouteMatch<{ id: string; tab: string }>(
    '/communities/:id/:tab'
  )
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
      {community?.owner_id === auth.id && (
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
                history.push(`/communities/${community.id}/settings`)
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

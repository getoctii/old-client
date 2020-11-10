import {
  faBell,
  faBellSlash,
  faEllipsisH,
  faHouseLeave
} from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Integrations from './Integrations'
import React, { useState } from 'react'
import { useMutation, useQuery } from 'react-query'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { Auth } from '../../authentication/state'
import { getCommunity } from '../remote'
import styles from './Sidebar.module.scss'
import Channels from './Channels'
import { clientGateway } from '../../constants'
import { useLocalStorage } from 'react-use'

const View = () => {
  const auth = Auth.useContainer()
  const match = useRouteMatch<{ id: string }>('/communities/:id')
  const history = useHistory()
  const [menu, setMenu] = useState(false)
  const [muted, setMuted] = useLocalStorage<string[]>('muted_communities', [])
  const community = useQuery(
    ['community', match?.params.id, auth.token],
    getCommunity
  )

  const [leaveCommunity] = useMutation(
    async () =>
      (
        await clientGateway.post(
          `/communities/${match?.params.id}/leave`,
          {},
          {
            headers: { Authorization: auth.token }
          }
        )
      ).data
  )
  return (
    <div className={styles.wrapper}>
      <div className={styles.sidebar}>
        <div className={styles.container}>
          <h3>
            {community.data?.name ? community.data?.name : ''}{' '}
            <span
              className={styles.leave}
              onClick={() => {
                setMenu(!menu)
              }}
            >
              <FontAwesomeIcon icon={faEllipsisH} className={styles.menuIcon} />
            </span>
          </h3>
          {menu && (
            <div className={styles.menu}>
              <div
                className={styles.menuItem}
                onClick={() => {
                  if (!community.data?.id) return
                  if (muted?.includes(community.data.id))
                    setMuted(
                      muted.filter(
                        (communities) => communities !== community.data?.id
                      )
                    )
                  else setMuted([...(muted || []), community.data.id])
                }}
              >
                {community.data && muted?.includes(community.data.id) ? (
                  <>
                    <span>Unmute Community</span>{' '}
                    <FontAwesomeIcon icon={faBell} />
                  </>
                ) : (
                  <>
                    <span>Mute Community</span>{' '}
                    <FontAwesomeIcon icon={faBellSlash} />
                  </>
                )}
              </div>
              {community.data?.owner_id !== auth.id && (
                <>
                  <hr />
                  <div
                    className={`${styles.menuItem} ${styles.danger}`}
                    onClick={() => {
                      leaveCommunity()
                      history.push('/')
                    }}
                  >
                    <span>Leave Community</span>{' '}
                    <FontAwesomeIcon icon={faHouseLeave} />
                  </div>
                </>
              )}
            </div>
          )}
          <Integrations.View community={community.data} />
          <Channels.View community={community.data} />
        </div>
      </div>
    </div>
  )
}

const Placeholder = () => {
  return (
    <div className={styles.placeholder}>
      <div className={styles.sidebar}>
        <div className={styles.container}>
          <div className={styles.name} />
        </div>
        <Integrations.Placeholder />
        <Channels.Placeholder />
      </div>
    </div>
  )
}

const Sidebar = { View, Placeholder }

export default Sidebar

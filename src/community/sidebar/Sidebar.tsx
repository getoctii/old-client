import { faHouseLeave } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Integrations } from './Integrations'
import React from 'react'
import Skeleton from 'react-loading-skeleton'
import { useMutation, useQuery } from 'react-query'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { Auth } from '../../authentication/state'
import { getCommunity } from '../remote'
import styles from './Sidebar.module.scss'
import { Channels } from './Channels'
import { clientGateway } from '../../constants'

export const Sidebar = () => {
  const auth = Auth.useContainer()
  const match = useRouteMatch<{ id: string }>('/communities/:id')
  const history = useHistory()
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
        <h3>
          {community.data?.name ? community.data?.name : <Skeleton />}{' '}
          {community.data?.owner_id !== auth.id && (
            <span
              className={styles.leave}
              onClick={() => {
                leaveCommunity()
                history.push('/')
              }}
            >
              <FontAwesomeIcon icon={faHouseLeave} />
            </span>
          )}
        </h3>
        <Integrations community={community.data} />
        <Channels community={community.data} />
      </div>
    </div>
  )
}

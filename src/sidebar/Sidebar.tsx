import React, { useState } from 'react'
import styles from './Sidebar.module.scss'
import { UI } from '../uiStore'
import { Auth } from '../authentication/state'
import { useQuery } from 'react-query'
import { clientGateway } from '../constants'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserCog, faInbox, faPlus } from '@fortawesome/pro-solid-svg-icons'
import { useHistory, useRouteMatch } from 'react-router-dom'
import Button from '../components/Button'

type UserResponse = {
  id: string
  avatar: string
  username: string
  discriminator: number
}

type MembersResponse = {
  id: string
  community: {
    id: string
    name: string
    icon?: string
    large: boolean
  }
}[]

export const Sidebar = () => {
  const ui = UI.useContainer()
  const auth = Auth.useContainer()
  const history = useHistory()
  const match = useRouteMatch<{
    tab?: string
    id?: string
  }>('/:tab/:id')
  const [selected, setSelected] = useState<string | undefined>(
    match?.params.tab === 'communities' ? match.params.id : match?.params.tab
  )
  const user = useQuery(
    ['users', auth.id],
    async (key, userID) =>
      (
        await clientGateway.get<UserResponse>(`/users/${userID}`, {
          headers: {
            Authorization: auth.token
          }
        })
      ).data
  )
  const communities = useQuery(
    ['communities'],
    async () =>
      (
        await clientGateway.get<MembersResponse>(`/users/${auth.id}/members`, {
          headers: {
            Authorization: auth.token
          }
        })
      ).data
  )
  return (
    <div className={styles.sidebar}>
      <Button
        className={styles.avatar}
        type='button'
        onClick={() => ui.setModal('settings')}
      >
        <img src={user.data?.avatar} alt={user.data?.username} />
        <div className={styles.overlay}>
          <FontAwesomeIcon icon={faUserCog} size='2x' />
        </div>
      </Button>
      <Button
        className={
          selected === 'conversations' || !selected
            ? `${styles.messages} ${styles.selected}`
            : styles.messages
        }
        type='button'
        onClick={() => {
          setSelected('conversations')
          history.push('/')
        }}
      >
        <FontAwesomeIcon className={styles.symbol} icon={faInbox} size='2x' />
      </Button>
      <Button
        className={styles.plus}
        type='button'
        onClick={() => ui.setModal('newCommunity')}
      >
        <FontAwesomeIcon className={styles.symbol} icon={faPlus} size='2x' />
      </Button>
      <div className={styles.separator} />
      {communities.data?.map((member) => {
        const community = member.community
        return (
          <Button
            type='button'
            key={community.id}
            style={{ backgroundImage: `url(${community.icon})` }}
            className={
              selected === community.id
                ? `${styles.icon} ${styles.selected}`
                : styles.icon
            }
            onClick={() => {
              setSelected(community.id)
              return history.push(`/communities/${community.id}`)
            }}
          />
        )
      })}
      <br />
    </div>
  )
}

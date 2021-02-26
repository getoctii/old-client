import React from 'react'
import { Auth } from '../authentication/state'
import { useQuery } from 'react-query'
import styles from './Mention.module.scss'
import { getChannel } from './remote'
import { useHistory } from 'react-router-dom'
import { useUser } from '../user/state'

const User = ({
  userID,
  selected,
  attributes,
  children
}: {
  userID: string
  selected?: boolean
  attributes?: any
  children?: React.ReactChild
}) => {
  const { id } = Auth.useContainer()
  const user = useUser(id ?? undefined)
  return (
    <span
      {...attributes}
      className={`${styles.mention} ${userID === id ? styles.isMe : ''} ${
        selected ? styles.selected : ''
      }`}
    >
      @{user?.username}
      {children}
    </span>
  )
}

const Channel = ({
  channelID,
  selected,
  attributes,
  children
}: {
  channelID: string
  selected?: boolean
  attributes?: any
  children?: React.ReactChild
}) => {
  const { token } = Auth.useContainer()
  const history = useHistory()
  const channel = useQuery(['channel', channelID, token], getChannel)
  return (
    <span
      {...attributes}
      className={`${styles.mention} ${styles.isMe} ${
        selected ? styles.selected : ''
      }`}
      onClick={() =>
        !attributes &&
        history.push(
          `/communities/${channel.data?.community_id}/channels/${channelID}`
        )
      }
    >
      #{channel.data?.name}
      {children}
    </span>
  )
}

const Mention = { User, Channel }

export default Mention

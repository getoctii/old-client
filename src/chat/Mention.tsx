import { FC } from 'react'
import { Auth } from '../authentication/state'
import { useQuery } from 'react-query'
import styles from './Mention.module.scss'
import { getChannel } from './remote'
import { useHistory } from 'react-router-dom'
import { useUser } from '../user/state'

const User: FC<{
  userID: string
  selected?: boolean
  attributes?: any
}> = ({ userID, selected, attributes, children }) => {
  const { id } = Auth.useContainer()
  const user = useUser(userID)
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

const Channel: FC<{
  channelID: string
  selected?: boolean
  attributes?: any
}> = ({ channelID, selected, attributes, children }) => {
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

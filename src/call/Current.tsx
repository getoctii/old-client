import {
  faMicrophone,
  faMicrophoneSlash,
  faVolume,
  faVolumeMute
} from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FC, useMemo } from 'react'
import { Call } from '../state/call'
import styles from './Current.module.scss'
import { getChannel } from '../chat/remote'
import { Auth } from '../authentication/state'
import { useQuery } from 'react-query'
import { useHistory } from 'react-router-dom'
import { fetchManyUsers, getParticipants } from '../user/remote'

const Current: FC = () => {
  const { token, id } = Auth.useContainer()
  const {
    state,
    setMuted,
    muted,
    setDeafened,
    deafened,
    setRoom,
    room
  } = Call.useContainerSelector(
    ({ state, setMuted, muted, setDeafened, deafened, setRoom, room }) => ({
      state,
      setMuted,
      muted,
      setDeafened,
      deafened,
      setRoom,
      room
    })
  )

  const history = useHistory()

  const { data: channel } = useQuery(
    ['channel', room?.channelID, token],
    getChannel,
    {
      enabled: !!room?.channelID
    }
  )

  const { data: participants } = useQuery(
    ['participants', id, token],
    getParticipants,
    {
      enabled: !!room?.conversationID
    }
  )

  const participant = useMemo(
    () =>
      participants?.find(
        (participant) => participant.conversation.id === room?.conversationID
      ),
    [participants, room]
  )

  const people = useMemo(
    () =>
      participant?.conversation.participants.filter((userID) => userID !== id),
    [participant, id]
  )

  const { data: users } = useQuery(
    ['users', people ?? [], token],
    fetchManyUsers
    // {
    //   enabled: !!people
    // }
  )

  console.log(people)

  return (
    <div className={styles.current}>
      <h3
        className={styles.pointer}
        onClick={() => {
          history.push(
            `/communities/${channel?.community_id}/channels/${channel?.id}`
          )
        }}
      >
        {users
          ? 'Call w/' + users?.map((i) => i.username).join(', ')
          : '#' + channel?.name}
      </h3>
      <p>
        {state === 'new' || !state
          ? 'Connecting to server...'
          : state === 'failed' || state === 'disconnected'
          ? 'Connection failure'
          : state === 'connected' ||
            state === 'completed' ||
            state === 'checking'
          ? 'Connected'
          : ''}
      </p>
      <nav>
        <button onClick={() => setMuted(!muted)}>
          {muted ? (
            <FontAwesomeIcon icon={faMicrophoneSlash} fixedWidth />
          ) : (
            <FontAwesomeIcon icon={faMicrophone} fixedWidth />
          )}
        </button>
        <button onClick={() => setDeafened(!deafened)}>
          {deafened ? (
            <FontAwesomeIcon icon={faVolumeMute} fixedWidth />
          ) : (
            <FontAwesomeIcon icon={faVolume} fixedWidth />
          )}
        </button>
        <button onClick={() => setRoom(null)}>End Call</button>
      </nav>
    </div>
  )
}

export default Current

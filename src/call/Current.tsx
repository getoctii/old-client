import {
  faMicrophone,
  faMicrophoneSlash,
  faVolume,
  faVolumeMute
} from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FC } from 'react'
import { Call } from '../state/call'
import styles from './Current.module.scss'
import { getChannel } from '../chat/remote'
import { Auth } from '../authentication/state'
import { useQuery } from 'react-query'
import { useHistory } from 'react-router-dom'

const Current: FC = () => {
  const { token } = Auth.useContainer()
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
        #{channel?.name}
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

import {
  faMicrophone,
  faMicrophoneSlash,
  faVolume,
  faVolumeMute
} from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FC, useEffect, useState } from 'react'
import { Call } from '../state/call'
import styles from './Current.module.scss'
import { useUser } from '../user/state'

const Current: FC = () => {
  const {
    state,
    setMuted,
    muted,
    setDeafened,
    deafened,
    setRoom
  } = Call.useContainerSelector(
    ({ state, setMuted, muted, setDeafened, deafened, setRoom }) => ({
      state,
      setMuted,
      muted,
      setDeafened,
      deafened,
      setRoom
    })
  )

  return (
    <div className={styles.current}>
      <h3>Call</h3>
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

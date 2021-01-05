import {
  faMicrophone,
  faMicrophoneSlash,
  faVolume,
  faVolumeMute
} from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useEffect, useState } from 'react'
import { Call } from '../state/call'
import styles from './Current.module.scss'
import { useQuery } from 'react-query'
import { Auth } from '../authentication/state'
import { getUser } from '../user/remote'

const Current = () => {
  const { token } = Auth.useContainer()
  const call = Call.useContainer()
  const user = useQuery(['users', call.otherUserID, token], getUser)
  const [audio] = useState(new Audio())

  useEffect(() => {
    console.log(audio, call.stream)
    if (audio && call.stream) {
      console.log('playing audio...')
      audio.srcObject = call.stream
      audio.play()
    }
  }, [audio, call.stream])
  return (
    <div className={styles.current}>
      <h3>Call w/{user.data?.username}</h3>
      <p>
        {call.callState === 'waiting'
          ? 'Connecting to peer...'
          : call.callState === 'ringing'
          ? 'Ringing...'
          : call.callState === 'connected'
          ? 'Connected'
          : ''}
      </p>
      <nav>
        <button onClick={() => call.setMuted(!call.muted)}>
          {call.muted ? (
            <FontAwesomeIcon icon={faMicrophoneSlash} fixedWidth />
          ) : (
            <FontAwesomeIcon icon={faMicrophone} fixedWidth />
          )}
        </button>
        <button onClick={() => call.setDeafened(!call.deafened)}>
          {call.deafened ? (
            <FontAwesomeIcon icon={faVolumeMute} fixedWidth />
          ) : (
            <FontAwesomeIcon icon={faVolume} fixedWidth />
          )}
        </button>
        <button onClick={() => call.endCall()}>End Call</button>
      </nav>
    </div>
  )
}

export default Current

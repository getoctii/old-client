import { faCheck, faTimes } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useEffect } from 'react'
import Button from '../components/Button'
import Modal from '../components/Modal'
import styles from './Incoming.module.scss'
import { Call } from '../state/call'
import { useQuery } from 'react-query'
import { Auth } from '../authentication/state'
import { getUser } from '../user/remote'
import { UI } from '../state/ui'
import { useAudio, useMedia } from 'react-use'

const Incoming = ({
  id,
  userID,
  peerID
}: {
  id: string
  userID: string
  peerID: string
}) => {
  const ui = UI.useContainer()
  const { token } = Auth.useContainer()
  const user = useQuery(['users', userID, token], getUser)
  const call = Call.useContainer()
  const [audio, , controls] = useAudio({
    src: 'https://file.coffee/u/JXS7hx53Kh.mpeg',
    autoPlay: true
  })
  const isMobile = useMedia('(max-width: 940px)')
  useEffect(() => {
    controls.volume(0.1)
  }, [controls])
  return isMobile ? (
    <>
      {audio}
      <div className={styles.incoming}>
        <img src={user?.data?.avatar} alt={user.data?.username} />
        <div className={styles.details}>
          <h3>{user?.data?.username} is calling...</h3>
          <p>Direct Call</p>
          <div className={styles.buttons}>
            <Button
              type='button'
              onClick={() => {
                if (call.callState !== 'idle') call.endCall()
                call.acceptRequest(id, userID, peerID)
                ui.clearModal()
              }}
            >
              <FontAwesomeIcon icon={faCheck} />
            </Button>
            <Button
              type='button'
              onClick={() => {
                // TODO: Maybe we should send a signal to the other peer that the call was declined.
                ui.clearModal()
              }}
            >
              <FontAwesomeIcon icon={faTimes} />
            </Button>
            <Button
              type='button'
              onClick={() => {
                ui.clearModal()
              }}
            >
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </>
  ) : (
    <Modal>
      {audio}
      <div className={styles.incoming}>
        <img src={user?.data?.avatar} alt={user.data?.username} />
        <div className={styles.details}>
          <h3>{user?.data?.username} is calling...</h3>
          <p>Direct Call</p>
          <div className={styles.buttons}>
            <Button
              type='button'
              onClick={() => {
                if (call.callState !== 'idle') call.endCall()
                call.acceptRequest(id, userID, peerID)
                ui.clearModal()
              }}
            >
              <FontAwesomeIcon icon={faCheck} />
            </Button>
            <Button
              type='button'
              onClick={() => {
                // TODO: Maybe we should send a signal to the other peer that the call was declined.
                ui.clearModal()
              }}
            >
              <FontAwesomeIcon icon={faTimes} />
            </Button>
            <Button
              type='button'
              onClick={() => {
                ui.clearModal()
              }}
            >
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default Incoming

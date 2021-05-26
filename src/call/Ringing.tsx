import styles from './Ringing.module.scss'
import Modal from '../components/Modal'
import {
  faPhone,
  faTimes,
  faUserFriends
} from '@fortawesome/pro-solid-svg-icons'
import Button from '../components/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FC, useMemo } from 'react'
import { useQuery } from 'react-query'
import { fetchManyUsers, getParticipants } from '../user/remote'
import { Auth } from '../authentication/state'
import { UI } from '../state/ui'
import { clientGateway } from '../utils/constants'
import { Call } from '../state/call'
import { useHistory } from 'react-router-dom'

const Ringing: FC<{ id: string }> = ({ id }) => {
  const auth = Auth.useContainer()
  const ui = UI.useContainer()
  const { data: participants } = useQuery(
    ['participants', auth.id, auth.token],
    getParticipants
  )

  const participant = useMemo(
    () =>
      participants?.find((participant) => participant.conversation.id === id),
    [participants, id]
  )

  const people = useMemo(
    () =>
      participant?.conversation.participants.filter(
        (userID) => userID !== auth.id
      ),
    [participant, auth.id]
  )

  const { data: users } = useQuery(
    ['users', people ?? [], auth.token],
    fetchManyUsers
  )

  const call = Call.useContainer()
  const history = useHistory()

  return (
    <Modal onDismiss={() => {}} icon={faPhone} title={'Incoming Call'}>
      <div className={styles.container}>
        {users?.length === 1 ? (
          <img src={users[0].avatar} alt={users[0].username} />
        ) : (
          <div className={styles.gc}>
            <FontAwesomeIcon icon={faUserFriends} size={'2x'} />
          </div>
        )}
        <h1>{users?.map((i) => i.username).join(', ')}</h1>
        <div className={styles.buttons}>
          <Button
            type={'button'}
            className={styles.primary}
            onClick={async () => {
              const {
                data
              }: {
                data: { room_id: string; token: string; server: string }
              } = await clientGateway.post(
                `/channels/${participant?.conversation.voice_channel_id}/join`,
                {},
                {
                  headers: {
                    Authorization: auth.token
                  }
                }
              )
              call.setRoom({
                token: data.token,
                id: data.room_id,
                server: data.server,
                conversationID: id,
                channelID: participant?.conversation.voice_channel_id
              })
              call.play()
              ui.setModal(undefined)
              history.push(`/conversations/${id}`)
            }}
          >
            <FontAwesomeIcon icon={faPhone} fixedWidth />
          </Button>
          <Button
            type={'button'}
            className={styles.danger}
            onClick={() => {
              ui.setModal(undefined)
            }}
          >
            <FontAwesomeIcon icon={faTimes} fixedWidth />
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default Ringing

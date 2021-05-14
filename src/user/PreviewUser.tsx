import Modal from '../components/Modal'
import Button from '../components/Button'
import { useUser } from './state'
import Icon from './Icon'
import { Auth } from '../authentication/state'
import styles from './PreviewUser.module.scss'
import { ParticipantsResponse } from '../user/remote'
import { useHistory } from 'react-router-dom'
import { createConversation } from '../conversation/remote'
import { queryCache } from 'react-query'
import { UI } from '../state/ui'
import { Relationships } from '../friends/relationships'
import { useCallback, useMemo } from 'react'

const PreviewUser = ({ id }: { id: string }) => {
  const user = useUser(id)
  const auth = Auth.useContainer()
  const ui = UI.useContainer()
  const history = useHistory()
  const {
    newRelationship,
    deleteRelationship,
    lookupRelationship
  } = Relationships.useContainer()

  const relationshipType = useMemo(() => lookupRelationship(id), [
    id,
    lookupRelationship
  ])

  const icon = useCallback(
    () => <Icon avatar={user?.avatar} state={user?.state}></Icon>,
    [user]
  )

  return (
    <Modal
      title={`${user?.username}#${
        user?.discriminator === 0
          ? 'inn'
          : String(user?.discriminator).padStart(4, '0')
      }`}
      icon={icon}
      subtitle={user?.status}
      onDismiss={() => {}}
      bottom={
        user?.id !== auth.id ? (
          <Button
            className={`${styles.button} ${
              relationshipType === 'outgoing' ? styles.danger : ''
            }`}
            type='button'
            onClick={async () => {
              if (relationshipType === 'friend') {
                const cache = queryCache.getQueryData([
                  'participants',
                  auth.id,
                  auth.token
                ]) as ParticipantsResponse
                const participant = cache?.find((participant) =>
                  participant.conversation.participants.includes(user?.id!)
                )
                if (!cache || !participant) {
                  const result = await createConversation(auth.token!, {
                    recipient: user?.id!
                  })
                  if (result.id) history.push(`/conversations/${result.id}`)
                } else {
                  history.push(`/conversations/${participant.conversation.id}`)
                }
                ui.setModal(undefined)
              } else if (relationshipType === 'incoming') {
                await newRelationship(id)
              } else if (relationshipType === 'outgoing') {
                await deleteRelationship(id)
              } else {
                await newRelationship(id)
              }
            }}
          >
            {relationshipType === 'friend'
              ? 'Message'
              : relationshipType === 'incoming'
              ? 'Accept Friend Request'
              : relationshipType === 'outgoing'
              ? 'Cancel Friend Request'
              : 'Add Friend'}
          </Button>
        ) : undefined
      }
    >
      <></>
    </Modal>
  )
}

export default PreviewUser

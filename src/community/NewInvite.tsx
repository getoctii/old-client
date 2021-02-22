import { faTimesCircle } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Suspense } from 'react'
import { Auth } from '../authentication/state'
import Button from '../components/Button'
import Modal from '../components/Modal'
import Input from '../components/Input'
import { clientGateway } from '../utils/constants'
import styles from './NewChannel.module.scss'
import { useRouteMatch } from 'react-router-dom'
import { UI } from '../state/ui'
import { useQuery } from 'react-query'
import { Plugins } from '@capacitor/core'

const DisplayInvite = () => {
  const auth = Auth.useContainer()
  const match = useRouteMatch<{ id: string }>('/communities/:id')
  const ui = UI.useContainer()
  const { data: invite } = useQuery(
    ['invite', match?.params.id, auth.id, auth.token],
    async () =>
      (
        await clientGateway.post<{
          id: string
          code: string
          created_at: string
          updated_at: string
        }>(
          `/communities/${match?.params.id}/invites`,
          {},
          { headers: { Authorization: auth.token } }
        )
      ).data,
    {
      enabled: !!match?.params.id
    }
  )

  return (
    <div className={styles.newChannel}>
      <h4>
        Invite Created
        <span style={{ float: 'right' }}>
          <FontAwesomeIcon
            onClick={() => ui.clearModal()}
            icon={faTimesCircle}
          />
        </span>
      </h4>
      <Input defaultValue={`octii.com/${invite?.code ?? ''}`} disabled />
      <Button
        type='submit'
        onClick={async () => {
          await Plugins.Clipboard.write({
            string: `https://octii.chat/invite/${invite?.code ?? ''}`
          })
          ui.clearModal()
        }}
      >
        Copy Invite
      </Button>
    </div>
  )
}

const NewInvite = () => {
  const ui = UI.useContainer()

  return (
    <Modal onDismiss={() => ui.clearModal()}>
      <Suspense fallback={<></>}>
        <DisplayInvite />
      </Suspense>
    </Modal>
  )
}

export default NewInvite

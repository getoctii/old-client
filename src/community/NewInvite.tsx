import { faTimes } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { Suspense } from 'react'
import { Auth } from '../authentication/state'
import Button from '../components/Button'
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
      <div className={styles.body}>
        <div className={styles.header}>
          <div className={styles.icon} onClick={() => ui.clearModal()}>
            <FontAwesomeIcon className={styles.backButton} icon={faTimes} />
          </div>
          <div className={styles.title}>
            <h2>Invite Created</h2>
          </div>
        </div>

        <Input defaultValue={`octii.com/${invite?.code ?? ''}`} disabled />
      </div>
      <div className={styles.bottom}>
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
    </div>
  )
}

const NewInvite = () => {
  return (
    <Suspense fallback={<></>}>
      <DisplayInvite />
    </Suspense>
  )
}

export default NewInvite

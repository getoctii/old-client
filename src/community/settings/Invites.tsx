import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import dayjs from 'dayjs'
import dayjsUTC from 'dayjs/plugin/utc'
import dayjsCalendar from 'dayjs/plugin/calendar'
import { memo, Suspense, FC } from 'react'
import { queryCache, useMutation, useQuery } from 'react-query'
import { useRouteMatch } from 'react-router-dom'
import { Auth } from '../../authentication/state'
import Button from '../../components/Button'
import { getUser } from '../../user/remote'
import styles from './Invites.module.scss'
import { getInvites, InviteResponse } from '../remote'
import {
  faCopy,
  faPlusCircle,
  faTrashAlt,
  faUsers
} from '@fortawesome/pro-duotone-svg-icons'
import { clientGateway, ModalTypes } from '../../utils/constants'
import { Plugins } from '@capacitor/core'
import List from '../../components/List'
import { UI } from '../../state/ui'
import { useMedia } from 'react-use'

dayjs.extend(dayjsUTC)
dayjs.extend(dayjsCalendar)

const InviteCard: FC<InviteResponse> = memo((invite) => {
  const match = useRouteMatch<{ id: string }>('/communities/:id/settings')
  const { token } = Auth.useContainer()
  const user = useQuery(['users', invite.author_id, token], getUser)
  const isMobile = useMedia('(max-width: 873px)')
  const [deleteInvite] = useMutation(
    async () =>
      (
        await clientGateway.delete(`/invites/${invite.id}`, {
          headers: { Authorization: token }
        })
      ).data,
    {
      onSuccess: async () => {
        await queryCache.invalidateQueries(['invites', match?.params.id, token])
      }
    }
  )
  return (
    <List.Card
      icon={<div className={styles.icon}>{invite.uses}</div>}
      title={
        <>
          {user.data?.username}#
          {user.data?.discriminator === 0
            ? 'inn'
            : user.data?.discriminator.toString().padStart(4, '0')}
        </>
      }
      subtitle={invite.code}
      actions={
        <>
          <Button
            className={styles.copyButton}
            type='button'
            onClick={async () => {
              await Plugins.Clipboard.write({
                string: `https://octii.com/${invite.code}`
              })
            }}
          >
            <FontAwesomeIcon icon={faCopy} />
            {!isMobile && 'Copy'}
          </Button>
          {!isMobile && (
            <Button
              type='button'
              className={styles.deleteButton}
              onClick={async () => await deleteInvite()}
            >
              <FontAwesomeIcon icon={faTrashAlt} />
            </Button>
          )}
        </>
      }
    />
  )
})

const InvitesView: FC = () => {
  const ui = UI.useContainer()
  const match = useRouteMatch<{ id: string }>('/communities/:id/settings')
  const { token } = Auth.useContainer()
  const invites = useQuery(['invites', match?.params.id, token], getInvites)
  return (
    <div className={styles.invites}>
      <List.View>
        {invites.data && invites.data.length > 0 ? (
          invites.data.map(
            (invite) =>
              invite && (
                <Suspense key={invite.id} fallback={<List.CardPlaceholder />}>
                  <InviteCard {...invite} />
                </Suspense>
              )
          )
        ) : (
          <List.Empty
            title={'Get started with invites!'}
            description={`An empty community is pretty boring. Invite friends so you can chat around and even invite random people from the internet with invites!`}
            icon={faUsers}
            action={
              <Button
                type='button'
                onClick={() => ui.setModal({ name: ModalTypes.NEW_INVITE })}
              >
                Create Invite <FontAwesomeIcon icon={faPlusCircle} />
              </Button>
            }
          />
        )}
      </List.View>
    </div>
  )
}

const Invites = {
  View: InvitesView,
  Card: InviteCard
}

export default Invites

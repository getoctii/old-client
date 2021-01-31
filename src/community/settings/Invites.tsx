import { faBoxOpen } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import dayjs from 'dayjs'
import dayjsUTC from 'dayjs/plugin/utc'
import dayjsCalendar from 'dayjs/plugin/calendar'
import React, { memo, Suspense, useMemo } from 'react'
import { queryCache, useMutation, useQuery } from 'react-query'
import { useRouteMatch } from 'react-router-dom'
import { useMedia } from 'react-use'
import { Auth } from '../../authentication/state'
import Button from '../../components/Button'
import { getUser } from '../../user/remote'
import styles from './Invites.module.scss'
import { getInvites, InviteResponse } from '../remote'
import { faCopy, faTrashAlt } from '@fortawesome/pro-duotone-svg-icons'
import { clientGateway } from '../../utils/constants'
import { Plugins } from '@capacitor/core'

dayjs.extend(dayjsUTC)
dayjs.extend(dayjsCalendar)

const InviteCard = memo((invite: InviteResponse) => {
  const match = useRouteMatch<{ id: string }>('/communities/:id/settings')
  const isMobile = useMedia('(max-width: 960px)')
  const { token } = Auth.useContainer()
  const user = useQuery(['users', invite.author_id, token], getUser)
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
    <div className={styles.invite}>
      <div className={styles.icon}>{invite.uses}</div>
      <div className={styles.info}>
        <h4>
          {user.data?.username}#
          {user.data?.discriminator === 0
            ? 'inn'
            : user.data?.discriminator.toString().padStart(4, '0')}
        </h4>
        <time>{invite.code}</time>
      </div>
      {!isMobile && (
        <div className={styles.actions}>
          <Button
            type='button'
            onClick={async () => {
              await Plugins.Clipboard.write({
                string: `https://octii.chat/invite/${invite.code}`
              })
            }}
          >
            <FontAwesomeIcon icon={faCopy} />
            Copy
          </Button>
          <Button
            type='button'
            onClick={async () => await deleteInvite()}
            className={styles.delete}
          >
            <FontAwesomeIcon icon={faTrashAlt} />
          </Button>
        </div>
      )}
    </div>
  )
})

const InvitePlaceholder = ({ className }: { className?: string }) => {
  const name = useMemo(() => Math.floor(Math.random() * 5) + 3, [])
  const code = useMemo(() => Math.floor(Math.random() * 15) + 3, [])
  return (
    <div
      className={`${styles.invitePlaceholder} ${className ? className : ''}`}
    >
      <div className={styles.icon} />
      <div className={styles.info}>
        <div className={styles.user} style={{ width: `${name}rem` }} />
        <div className={styles.code} style={{ width: `${code}rem` }} />
      </div>
    </div>
  )
}

const InvitesView = () => {
  const match = useRouteMatch<{ id: string }>('/communities/:id/settings')
  const { token } = Auth.useContainer()
  const invites = useQuery(['invites', match?.params.id, token], getInvites)
  return (
    <div className={styles.wrapper}>
      <div className={styles.invites}>
        {invites.data && invites.data.length > 0 ? (
          <>
            <div className={styles.body}>
              {invites.data.map(
                (invite) =>
                  invite && (
                    <Suspense fallback={<InvitePlaceholder />}>
                      <InviteCard key={invite.id} {...invite} />
                    </Suspense>
                  )
              )}
            </div>
          </>
        ) : (
          <>
            <div className={styles.invitesEmpty}>
              <FontAwesomeIcon size={'5x'} icon={faBoxOpen} />
              <br />
              <h2>No invites in this community!</h2>
              <br />
              <br />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const InvitesPlaceholder = () => {
  const length = useMemo(() => Math.floor(Math.random() * 4) + 1, [])
  return (
    <div className={styles.invitesPlaceholder}>
      {Array.from(Array(length).keys()).map((_, index) => (
        <InvitePlaceholder key={index} className={styles.cardPlaceholder} />
      ))}
    </div>
  )
}

const Invites = {
  View: InvitesView,
  Card: InviteCard,
  Placeholder: InvitesPlaceholder
}

export default Invites

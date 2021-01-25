import { faBoxOpen } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { AnimatePresence, motion } from 'framer-motion'
import dayjs from 'dayjs'
import dayjsUTC from 'dayjs/plugin/utc'
import dayjsCalendar from 'dayjs/plugin/calendar'
import React, { memo, Suspense } from 'react'
import { queryCache, useMutation, useQuery } from 'react-query'
import { useRouteMatch } from 'react-router-dom'
import { useMedia } from 'react-use'
import { Auth } from '../../authentication/state'
import Button from '../../components/Button'
import Loader from '../../components/Loader'
import { getUser } from '../../user/remote'
import styles from './Invites.module.scss'
import { getInvites, InviteResponse } from '../remote'
import { faCopy, faTrashAlt } from '@fortawesome/pro-duotone-svg-icons'
import { clientGateway } from '../../utils/constants'
import { Plugins } from '@capacitor/core'

dayjs.extend(dayjsUTC)
dayjs.extend(dayjsCalendar)

const Invite = memo((invite: InviteResponse) => {
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
    <motion.div
      className={styles.invite}
      initial={{
        opacity: 0
      }}
      animate={{
        opacity: 1,
        transition: { y: { stiffness: 1000, velocity: -100 } }
      }}
      exit={{
        opacity: 0
      }}
    >
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
    </motion.div>
  )
})

export const Invites = () => {
  const match = useRouteMatch<{ id: string }>('/communities/:id/settings')
  const { token } = Auth.useContainer()
  const invites = useQuery(['invites', match?.params.id, token], getInvites)
  return (
    <Suspense fallback={<Loader />}>
      <div className={styles.wrapper}>
        <div className={styles.invites}>
          {invites.data && invites.data.length > 0 ? (
            <>
              <div className={styles.body}>
                <AnimatePresence>
                  {invites.data.map(
                    (invite) => invite && <Invite {...invite} />
                  )}
                </AnimatePresence>
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
    </Suspense>
  )
}

import React from 'react'
import styles from './Invites.module.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faTrashAlt,
  faCopy,
  faArrowRight,
  faBoxOpen
} from '@fortawesome/pro-duotone-svg-icons'
import { faPlus } from '@fortawesome/pro-solid-svg-icons'
import dayjs from 'dayjs'
import dayjsUTC from 'dayjs/plugin/utc'
import dayjsCalendar from 'dayjs/plugin/calendar'
import { Auth } from '../../authentication/state'
import { useRouteMatch } from 'react-router-dom'
import { useMutation, useQuery, queryCache } from 'react-query'
import { clientGateway } from '../../utils/constants'
import Button from '../../components/Button'
import { Plugins } from '@capacitor/core'
import { getInvites, Invite as InviteType } from '../remote'
import { getUser } from '../../user/remote'
import { AnimatePresence, motion } from 'framer-motion'

dayjs.extend(dayjsUTC)
dayjs.extend(dayjsCalendar)

const Invite = (invite: InviteType) => {
  const auth = Auth.useContainer()
  const user = useQuery(['users', invite.author_id, auth.token], getUser)
  const match = useRouteMatch<{ id: string }>('/communities/:id/settings')

  const [deleteInvite] = useMutation(
    async () =>
      (
        await clientGateway.delete(`/invites/${invite.id}`, {
          headers: { Authorization: auth.token }
        })
      ).data,
    {
      onSuccess: async () => {
        await queryCache.invalidateQueries(['invites', match?.params.id, auth.token])
      }
    }
  )

  return (
    <motion.tr
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
      <td>
        {user.data?.username}#
        {user.data?.discriminator === 0
          ? 'inn'
          : user.data?.discriminator.toString().padStart(4, '0')}
      </td>
      <td>{invite.code}</td>
      <td>{invite.uses}</td>
      <td>{dayjs.utc(invite.created_at).local().calendar()}</td>
      <motion.td
        whileTap={{
          scale: 1.2,
          transition: {
            bounce: 0,
            duration: 0.25
          }
        }}
        initial={{ scale: 1 }}
        className={styles.copyAction}
        onClick={async () =>
          await Plugins.Clipboard.write({
            string: `https://octii.chat/invite/${invite.code}`
          })
        }
      >
        <FontAwesomeIcon icon={faCopy} />
      </motion.td>
      <motion.td
        whileTap={{
          scale: 1.2,
          transition: {
            bounce: 0,
            duration: 0.25
          }
        }}
        initial={{ scale: 1 }}
        className={styles.deleteAction}
        onClick={() => deleteInvite()}
      >
        <FontAwesomeIcon icon={faTrashAlt} />
      </motion.td>
    </motion.tr>
  )
}

const Invites = () => {
  const auth = Auth.useContainer()
  const match = useRouteMatch<{ id: string }>('/communities/:id/settings')
  const invites = useQuery(
    ['invites', match?.params.id, auth.token],
    getInvites
  )
  const [createInvite] = useMutation(
    async () =>
      (
        await clientGateway.post(
          `/communities/${match?.params.id}/invites`,
          {},
          { headers: { Authorization: auth.token } }
        )
      ).data,
    {
      onSuccess: async () => {
        await queryCache.invalidateQueries(['invites', match?.params.id, auth.token])
      }
    }
  )
  return (
    <div className={styles.invites}>
      {invites.data && invites.data.length > 0 ? (
        <div className={styles.invitesBody}>
          <h3>
            Invites{' '}
            <span onClick={() => createInvite()}>
              <FontAwesomeIcon icon={faPlus} />
            </span>
          </h3>
          <table>
            <thead>
              <tr>
                <th>Author</th>
                <th>Code</th>
                <th>Uses</th>
                <th>Created At</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {invites.data.map((invite) => (
                  <Invite {...invite} key={invite.id} />
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <div className={styles.empty}>
            <FontAwesomeIcon size={'5x'} icon={faBoxOpen} />
            <br />
            <h2>Hi, this community has no invites!</h2>
            <br />
            <br />
            <Button type='button' onClick={() => createInvite()}>
              Create a Invite <FontAwesomeIcon icon={faArrowRight} />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

export default Invites

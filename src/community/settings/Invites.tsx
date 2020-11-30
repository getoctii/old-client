import React, { useState } from 'react'
import styles from './Invites.module.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faTrashAlt,
  faCopy,
  faArrowRight,
  faBoxOpen
} from '@fortawesome/pro-duotone-svg-icons'
import { faPlus } from '@fortawesome/pro-solid-svg-icons'
import moment from 'moment'
import { IonToast } from '@ionic/react'
import { Auth } from '../../authentication/state'
import { useRouteMatch } from 'react-router-dom'
import { useMutation, useQuery, queryCache } from 'react-query'
import { clientGateway } from '../../utils/constants'
import Button from '../../components/Button'
import { Clipboard } from '@capacitor/core'
import { getInvites, Invite as InviteType } from '../remote'
import { getUser } from '../../user/remote'
import { AnimatePresence, motion } from 'framer-motion'

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
      onSuccess: () => {
        queryCache.invalidateQueries(['invites', match?.params.id, auth.token])
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
      <td>{moment.utc(invite.created_at).local().calendar()}</td>
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
        onClick={() =>
          Clipboard.write({
            string: invite.code
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
  const [showCreate, setShowCreate] = useState(false)

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
      onSuccess: () => {
        queryCache.invalidateQueries(['invites', match?.params.id, auth.token])
      }
    }
  )
  return (
    <div className={styles.invites}>
      <IonToast
        mode='ios'
        isOpen={showCreate}
        onDidDismiss={() => setShowCreate(false)}
        message='Generated and copied new invite: e9321ig'
        position='bottom'
        translucent={true}
        buttons={[
          {
            text: 'Dismiss',
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked')
            }
          }
        ]}
      />
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
          <div className={styles.invitesEmpty}>
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

import { Suspense, useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Auth } from '../authentication/state'
import Button from '../components/Button'
import Modal from '../components/Modal'
import styles from './ManageGroups.module.scss'
import { getGroup, getGroups, getMember } from './remote'
import { UI } from '../state/ui'
import { getUser } from '../user/remote'
import { useQuery } from 'react-query'
import { faPlusCircle, faTimesCircle } from '@fortawesome/pro-duotone-svg-icons'
import { clientGateway } from '../utils/constants'
import { Permission } from '../utils/permissions'

const Group = ({
  id,
  memberID,
  add
}: {
  id: string
  memberID?: string
  add?: boolean
}) => {
  const { token } = Auth.useContainer()
  const { data: group } = useQuery(['group', id, token], getGroup)
  const { protectedGroups } = Permission.useContainer()
  return (
    <div
      className={`${styles.group} ${add ? styles.add : ''}`}
      onClick={async () => {
        if (protectedGroups.includes(id)) return
        if (!memberID) return
        if (add) {
          await clientGateway.post(
            `/members/${memberID}/${id}`,
            {},
            {
              headers: {
                Authorization: token
              }
            }
          )
        } else {
          await clientGateway.delete(`/members/${memberID}/${id}`, {
            headers: {
              Authorization: token
            }
          })
        }
      }}
    >
      {group?.name}{' '}
      {!protectedGroups.includes(id) ? (
        add ? (
          <FontAwesomeIcon icon={faPlusCircle} />
        ) : (
          <FontAwesomeIcon icon={faTimesCircle} />
        )
      ) : (
        <></>
      )}
    </div>
  )
}

const Content = ({
  memberID,
  userID,
  communityID
}: {
  communityID: string
  memberID: string
  userID: string
}) => {
  const { token } = Auth.useContainer()
  const { data: user } = useQuery(['users', userID, token], getUser)
  const { data: member } = useQuery(['member', memberID, token], getMember)
  const { data: groups } = useQuery(['groups', communityID, token], getGroups)
  const ui = UI.useContainer()
  const { protectedGroups } = Permission.useContainer()
  const [selectGroups, setSelectGroups] = useState(false)
  const filteredGroups = useMemo(
    () => groups?.filter((group) => !member?.groups.includes(group)) ?? [],
    [groups, member?.groups]
  )

  if (
    (selectGroups || (member?.groups.length ?? 0) < 1) &&
    filteredGroups.length > 0
  ) {
    return (
      <div className={styles.manageGroups}>
        <h4>
          Add Group to Member
          <span style={{ float: 'right' }}>
            <FontAwesomeIcon
              onClick={() => ui.clearModal()}
              icon={faTimesCircle}
            />
          </span>
        </h4>
        <div>
          {filteredGroups
            .filter((g) => !protectedGroups.includes(g))
            .map((group) => (
              <Group id={group} add memberID={memberID} key={group} />
            ))}
        </div>

        {(member?.groups.length ?? 0) > 0 &&
          (member?.groups.length ?? 0) < (groups?.length ?? 0) && (
            <Button
              type='button'
              onClick={() => setSelectGroups(!selectGroups)}
            >
              {selectGroups ? 'Member Groups' : 'Add Group'}
            </Button>
          )}
      </div>
    )
  }

  return (
    <div className={styles.manageGroups}>
      <h4>
        {user?.username}'s Groups
        <span style={{ float: 'right' }}>
          <FontAwesomeIcon
            onClick={() => ui.clearModal()}
            icon={faTimesCircle}
          />
        </span>
      </h4>

      <div className={styles.groups}>
        {member?.groups?.map((group) => (
          <Group memberID={memberID} id={group} key={group} />
        ))}
      </div>
      {(member?.groups.length ?? 0) > 0 &&
        (member?.groups.length ?? 0) < (groups?.length ?? 0) && (
          <Button type='button' onClick={() => setSelectGroups(!selectGroups)}>
            {selectGroups ? 'Member Groups' : 'Add Group'}
          </Button>
        )}
    </div>
  )
}

const ManageGroups = ({
  memberID,
  userID,
  communityID
}: {
  communityID: string
  memberID: string
  userID: string
}) => {
  const ui = UI.useContainer()
  return (
    <Modal onDismiss={() => ui.clearModal()}>
      <Suspense fallback={<></>}>
        <Content
          communityID={communityID}
          memberID={memberID}
          userID={userID}
        />
      </Suspense>
    </Modal>
  )
}

export default ManageGroups

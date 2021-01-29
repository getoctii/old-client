import React, { Suspense, useMemo, useState } from 'react'
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
  const group = useQuery(['group', id, token], getGroup)
  return (
    <div
      className={`${styles.group} ${add ? styles.add : ''}`}
      onClick={async () => {
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
      {group.data?.name}{' '}
      {add ? (
        <FontAwesomeIcon icon={faPlusCircle} />
      ) : (
        <FontAwesomeIcon icon={faTimesCircle} />
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
  const user = useQuery(['users', userID, token], getUser)
  const member = useQuery(['member', memberID, token], getMember)
  const groups = useQuery(['groups', communityID, token], getGroups)
  const ui = UI.useContainer()
  const [selectGroups, setSelectGroups] = useState(false)
  const filteredGroups = useMemo(
    () =>
      groups.data?.filter((group) => !member.data?.groups.includes(group)) ??
      [],
    [groups.data, member.data?.groups]
  )

  if (
    (selectGroups || (member.data?.groups.length ?? 0) < 1) &&
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
          {filteredGroups.map((group) => (
            <Group id={group} add memberID={memberID} key={group} />
          ))}
        </div>

        {(member.data?.groups.length ?? 0) > 0 &&
          (member.data?.groups.length ?? 0) < (groups.data?.length ?? 0) && (
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
        {user.data?.username}'s Groups
        <span style={{ float: 'right' }}>
          <FontAwesomeIcon
            onClick={() => ui.clearModal()}
            icon={faTimesCircle}
          />
        </span>
      </h4>

      <div className={styles.groups}>
        {member.data?.groups?.map((group) => (
          <Group memberID={memberID} id={group} key={group} />
        ))}
      </div>
      {(member.data?.groups.length ?? 0) > 0 &&
        (member.data?.groups.length ?? 0) < (groups.data?.length ?? 0) && (
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

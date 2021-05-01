import { FC, Suspense, useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Auth } from '../authentication/state'
import Button from '../components/Button'
import styles from './ManageGroups.module.scss'
import { getGroup, getGroups, getMember } from './remote'
import { UI } from '../state/ui'
import { getUser } from '../user/remote'
import { useQuery } from 'react-query'
import { faPlusCircle, faTimesCircle } from '@fortawesome/pro-duotone-svg-icons'
import { clientGateway } from '../utils/constants'
import { Permission } from '../utils/permissions'
import { faTimes } from '@fortawesome/pro-solid-svg-icons'

const Group: FC<{
  id: string
  memberID?: string
  add?: boolean
}> = ({ id, memberID, add }) => {
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

const Content: FC<{
  communityID: string
  memberID: string
  userID: string
}> = ({ memberID, userID, communityID }) => {
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
        <div className={styles.body}>
          <div className={styles.header}>
            <div className={styles.icon} onClick={() => ui.clearModal()}>
              <FontAwesomeIcon className={styles.backButton} icon={faTimes} />
            </div>
            <div className={styles.title}>
              <small>{user?.username}</small>
              <h2>Manage Member</h2>
            </div>
          </div>
          <div>
            {filteredGroups
              .filter((g) => !protectedGroups.includes(g))
              .map((group) => (
                <Group id={group} add memberID={memberID} key={group} />
              ))}
          </div>
        </div>

        {(member?.groups.length ?? 0) > 0 &&
          (member?.groups.length ?? 0) < (groups?.length ?? 0) && (
            <div className={styles.bottom}>
              <Button
                type='button'
                onClick={() => setSelectGroups(!selectGroups)}
              >
                {selectGroups ? 'Member Groups' : 'Add Group'}
              </Button>
            </div>
          )}
      </div>
    )
  }

  return (
    <div className={styles.manageGroups}>
      <div className={styles.body}>
        <div className={styles.header}>
          <div className={styles.icon} onClick={() => ui.clearModal()}>
            <FontAwesomeIcon className={styles.backButton} icon={faTimes} />
          </div>
          <div className={styles.title}>
            <small>{user?.username}</small>
            <h2>Manage Member</h2>
          </div>
        </div>
        <div>
          {member?.groups?.map((group) => (
            <Group memberID={memberID} id={group} key={group} />
          ))}
        </div>
      </div>

      {(member?.groups.length ?? 0) > 0 &&
        (member?.groups.length ?? 0) < (groups?.length ?? 0) && (
          <div className={styles.bottom}>
            <Button
              type='button'
              onClick={() => setSelectGroups(!selectGroups)}
            >
              {selectGroups ? 'Member Groups' : 'Add Group'}
            </Button>
          </div>
        )}
    </div>
  )
}

const ManageGroups: FC<{
  communityID: string
  memberID: string
  userID: string
}> = ({ memberID, userID, communityID }) => {
  return (
    <Suspense fallback={<></>}>
      <Content communityID={communityID} memberID={memberID} userID={userID} />
    </Suspense>
  )
}

export default ManageGroups

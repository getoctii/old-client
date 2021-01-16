import {
  faBoxOpen,
  faCheckCircle,
  faPencil,
  faTimesCircle,
  faTrash
} from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { AnimatePresence, motion } from 'framer-motion'
import React, { memo, Suspense, useEffect, useMemo, useState } from 'react'
import { useQuery } from 'react-query'
import { useParams } from 'react-router-dom'
import { useMedia, useSet } from 'react-use'
import { createEditor, Node } from 'slate'
import { Editable, Slate, withReact } from 'slate-react'
import { Auth } from '../../../authentication/state'
import Button from '../../../components/Button'
import Loader from '../../../components/Loader'
import { UI } from '../../../state/ui'
import {
  ModalTypes,
  PermissionNames,
  Permissions,
  PermissionsGroups,
  GroupNames,
  clientGateway
} from '../../../utils/constants'
import { getGroup, getGroups } from '../../remote'
import { Permission } from './NewPermission'
import styles from './Permissions.module.scss'

const serialize = (value: Node[]) =>
  value.map((node) => Node.string(node)).join('\n')

const PermissionGroup = memo(({ id }: { id: string }) => {
  const { token } = Auth.useContainer()
  const group = useQuery(['group', id, token], getGroup)

  const isMobile = useMedia('(max-width: 740px)')
  const [edit, setEdit] = useState<boolean>(false)

  const defaultGroupName = useMemo<any[]>(
    () => [
      {
        children: [{ text: group.data?.name || 'unknown' }]
      }
    ],
    [group.data]
  )
  const serverPermissions = useMemo(
    () => new Set(group.data?.permissions || []),
    [group.data?.permissions]
  )
  const [set, { add, remove, has, reset }] = useSet<Permissions>(
    new Set(group.data?.permissions || [])
  )

  console.log(Array.from(set))
  const showSave = useMemo(
    () =>
      !(
        serverPermissions.size === set.size &&
        [...serverPermissions].every((e) => set.has(e)) &&
        [...set].every((e) => serverPermissions.has(e))
      ),
    [serverPermissions, set]
  )
  const editor = useMemo(() => withReact(createEditor()), [])
  const [name, setName] = useState<any[]>(defaultGroupName)

  useEffect(() => {
    console.log(group.data?.name)
    setName([
      {
        children: [{ text: group.data?.name || 'unknown' }]
      }
    ])
  }, [group.data?.name])

  return (
    <>
      <motion.div
        className={`${styles.permission} ${edit ? styles.edit : ''}`}
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
        <div className={styles.icon} />
        <div className={styles.info}>
          <Slate
            editor={editor}
            value={name}
            onChange={(value) => setName(value)}
          >
            <Editable
              className={styles.changeName}
              onKeyDown={async (event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  await clientGateway.patch(
                    `/groups/${id}`,
                    { name: serialize(name) },
                    {
                      headers: { Authorization: token }
                    }
                  )
                }
              }}
              placeholder='Group Name'
            />
          </Slate>
          {serialize(name) !== (group.data?.name || 'unknown') ? (
            <FontAwesomeIcon
              icon={faCheckCircle}
              onClick={async () => {
                await clientGateway.patch(
                  `/groups/${id}`,
                  { name: serialize(name) },
                  {
                    headers: { Authorization: token }
                  }
                )
              }}
            />
          ) : (
            ''
          )}
        </div>
        {!isMobile && (
          <div
            className={styles.actions}
            style={{ gridTemplateColumns: `repeat(${edit ? '2' : '1'}, 46px)` }}
          >
            {edit && (
              <Button
                type='button'
                onClick={async () => {
                  await clientGateway.delete(`/groups/${id}`, {
                    headers: { Authorization: token }
                  })
                }}
              >
                <FontAwesomeIcon icon={faTrash} />
              </Button>
            )}
            <Button type='button' onClick={() => setEdit(!edit)}>
              <FontAwesomeIcon icon={edit ? faTimesCircle : faPencil} />
            </Button>
          </div>
        )}
      </motion.div>
      {edit && (
        <div className={styles.editing}>
          {Object.entries(PermissionsGroups).map(([group, permissions]) => (
            <div>
              {/* @ts-ignore */}
              <h5>{GroupNames[+group]}</h5>
              <ul className={styles.list}>
                {permissions.map((permission) => (
                  <Permission
                    name={PermissionNames[permission]}
                    toggled={has(permission)}
                    type={+group}
                    onToggle={(val) =>
                      val ? add(permission) : remove(permission)
                    }
                  />
                ))}
              </ul>
            </div>
          ))}

          {showSave && (
            <div className={styles.action}>
              <Button
                type='button'
                className={styles.discard}
                onClick={() => reset()}
              >
                Discard Changes
              </Button>
              <Button
                type='submit'
                onClick={async () => {
                  await clientGateway.patch(
                    `/groups/${id}`,
                    { permissions: Array.from(set) },
                    {
                      headers: { Authorization: token }
                    }
                  )
                }}
                className={styles.save}
              >
                Save Changes
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  )
})

const View = () => {
  const { token } = Auth.useContainer()
  const { setModal } = UI.useContainer()
  const { id } = useParams<{ id: string }>()
  const groups = useQuery(['groups', id, token], getGroups)

  return (
    <Suspense fallback={<Loader />}>
      <div className={styles.wrapper}>
        <div className={styles.permissions}>
          {groups.data && groups.data?.length > 0 ? (
            <>
              <Button
                className={styles.new}
                type='button'
                onClick={() => setModal({ name: ModalTypes.NEW_PERMISSION })}
              >
                New Permission Group
              </Button>
              <div className={styles.body}>
                <AnimatePresence>
                  {groups.data.map(
                    (group) =>
                      group && <PermissionGroup key={group.id} id={group.id} />
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <div className={styles.empty}>
                <FontAwesomeIcon size={'5x'} icon={faBoxOpen} />
                <br />
                <h2>No permission groups in this community!</h2>
                <br />
                <br />
                <Button
                  type='button'
                  onClick={() => setModal({ name: ModalTypes.NEW_PERMISSION })}
                >
                  Create Permission Group
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </Suspense>
  )
}

export default View

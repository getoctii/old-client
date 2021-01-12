import {
  faBoxOpen,
  faCheckCircle,
  faPencil,
  faTimesCircle
} from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Form, Formik } from 'formik'
import { AnimatePresence, motion } from 'framer-motion'
import React, { memo, Suspense, useMemo, useState } from 'react'
import { queryCache, useQuery } from 'react-query'
import { useParams } from 'react-router-dom'
import { useMedia, useSet } from 'react-use'
import { Auth } from '../../authentication/state'
import Button from '../../components/Button'
import Loader from '../../components/Loader'
import { UI } from '../../state/ui'
import {
  ModalTypes,
  PermissionNames,
  Permissions,
  PermissionsGroups,
  GroupNames,
  clientGateway
} from '../../utils/constants'
import { getGroup, getGroups } from '../remote'
import { Permission } from './NewPermission'
import styles from './Permissions.module.scss'

const PermissionGroup = memo(({ id }: { id: string }) => {
  const { token } = Auth.useContainer()
  const group = useQuery(['group', id, token], getGroup)

  const isMobile = useMedia('(max-width: 740px)')
  const [edit, setEdit] = useState<boolean>(false)
  const [groupName, setGroupName] = useState<string | undefined>()
  const serverPermissions = useMemo(
    () => new Set(group.data?.permissions || []),
    [group.data?.permissions]
  )
  const [set, { add, remove, has, reset }] = useSet<Permissions>(
    new Set(group.data?.permissions || [])
  )
  const showSave = useMemo(
    () =>
      !(
        serverPermissions.size === set.size &&
        [...serverPermissions].every((e) => set.has(e)) &&
        [...set].every((e) => serverPermissions.has(e))
      ),
    [serverPermissions, set]
  )
  // we need a way to tell if there is any changes
  return (
    <>
      <motion.div
        className={styles.permission}
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
          <h4
            contentEditable={!!edit}
            onInput={(event) => {
              console.log(event)
              setGroupName(event.currentTarget.innerText)
            }}
          >
            {groupName || group.data?.name}
          </h4>
          {groupName ? <FontAwesomeIcon icon={faCheckCircle} /> : ''}
        </div>
        {!isMobile && (
          <div className={styles.actions}>
            <Button type='button' onClick={() => setEdit(!edit)}>
              <FontAwesomeIcon icon={edit ? faTimesCircle : faPencil} />
            </Button>
          </div>
        )}
      </motion.div>
      {edit && (
        <Formik
          initialValues={{ name: '' }}
          onSubmit={async (
            values,
            { setSubmitting, setErrors, setFieldError }
          ) => {
            try {
              const result = await clientGateway.patch(
                `/groups/${id}`,
                { ...values, permissions: Array.from(set) },
                {
                  headers: { Authorization: token }
                }
              )
              queryCache.setQueryData(['group', id, token], () => result.data)
            } catch (e) {
              if (e.response.data.errors.includes('GroupNameInvalid'))
                setErrors({ name: 'Invaild Group Name' })
            } finally {
              setSubmitting(false)
            }
          }}
        >
          <Form>
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
                  <Button type='submit' className={styles.save}>
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </Form>
        </Formik>
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

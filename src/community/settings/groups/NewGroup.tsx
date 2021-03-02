import { ErrorMessage, Field, Form, Formik } from 'formik'
import React, { useState } from 'react'
import { BarLoader } from 'react-spinners'
import Button from '../../../components/Button'
import Input from '../../../components/Input'
import {
  clientGateway,
  GroupNames,
  Groups,
  PermissionNames,
  Permissions,
  PermissionsGroups
} from '../../../utils/constants'
import styles from './NewGroup.module.scss'
import { UI } from '../../../state/ui'
import { isUsername } from '../../../utils/validations'
import { Auth } from '../../../authentication/state'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPencil,
  faTimes,
  faTimesCircle
} from '@fortawesome/pro-solid-svg-icons'
import { useRouteMatch } from 'react-router-dom'
import { faToggleOff, faToggleOn } from '@fortawesome/pro-duotone-svg-icons'
import { useSet } from 'react-use'
import { Permission } from '../../../utils/permissions'

type createPermissionData = { name: string; permissions?: Permissions[] }

const validatePermission = (values: createPermissionData) => {
  const errors: { name?: string } = {}
  if (!isUsername(values.name)) errors.name = 'A valid name is required'
  return errors
}

const createPermission = async (
  token: string,
  id: string,
  values: createPermissionData
) =>
  (
    await clientGateway.post(`/communities/${id}/groups`, values, {
      headers: { Authorization: token }
    })
  ).data

export const PermissionToggle = ({
  name,
  type,
  toggled,
  onToggle
}: {
  name: string
  type: Groups
  toggled?: boolean
  onToggle?: (value: boolean) => void
}) => {
  return (
    <li
      onClick={() => {
        if (onToggle) onToggle(!toggled)
      }}
      className={
        type === Groups.BASIC
          ? styles.basic
          : type === Groups.MOD
          ? styles.mod
          : styles.admin
      }
    >
      {name} <FontAwesomeIcon icon={toggled ? faToggleOn : faToggleOff} />
    </li>
  )
}

export const NewPermissionStandalone = () => {
  const match = useRouteMatch<{ id: string }>('/communities/:id/settings')
  const auth = Auth.useContainer()
  const { hasPermissions, community } = Permission.useContainer()
  const ui = UI.useContainer()
  const [editing, setEditing] = useState<Groups>()
  const [set, { add, remove, has }] = useSet<Permissions>(
    new Set(
      community?.base_permissions ?? [
        Permissions.READ_MESSAGES,
        Permissions.SEND_MESSAGES,
        Permissions.CREATE_INVITES,
        Permissions.EMBED_LINKS
      ]
    )
  )
  return (
    <Formik
      initialValues={{ name: '' }}
      validate={validatePermission}
      onSubmit={async (values, { setSubmitting, setErrors, setFieldError }) => {
        if (!values?.name) return setFieldError('name', 'Required')
        try {
          await createPermission(auth.token!, match?.params.id!, {
            name: values.name,
            permissions: Array.from(set) || []
          })
          ui.clearModal()
        } catch (e) {
          if (e.response.data.errors.includes('GroupNameInvalid'))
            setErrors({ name: 'Invaild Group Name' })
        } finally {
          setSubmitting(false)
        }
      }}
    >
      {({ isSubmitting }) => (
        <Form className={styles.newGroup}>
          <div className={styles.body}>
            <div className={styles.header}>
              <div className={styles.icon} onClick={() => ui.clearModal()}>
                <FontAwesomeIcon className={styles.backButton} icon={faTimes} />
              </div>
              <div className={styles.title}>
                <h2>New Group</h2>
              </div>
            </div>

            <label htmlFor='tag' className={styles.inputName}>
              Name
            </label>
            <Field component={Input} name='name' />
            <ErrorMessage component='p' name='name' />

            <label className={styles.inputName}>Permissions</label>
            {Object.entries(PermissionsGroups).map(([group, permissions]) => (
              <>
                {hasPermissions(permissions) && (
                  <div className={styles.group}>
                    <div
                      className={`${styles.title} ${
                        +group === Groups.BASIC
                          ? styles.basic
                          : +group === Groups.MOD
                          ? styles.mod
                          : styles.admin
                      }`}
                      onClick={() =>
                        setEditing(editing === +group ? undefined : +group)
                      }
                    >
                      {/* @ts-ignore */}
                      {GroupNames[+group]}{' '}
                      <FontAwesomeIcon
                        icon={editing === +group ? faTimesCircle : faPencil}
                      />
                    </div>

                    {editing === +group && (
                      <ul className={styles.list}>
                        {permissions.map(
                          (permission) =>
                            ((permission !== Permissions.OWNER &&
                              hasPermissions([permission])) ||
                              (permission === Permissions.OWNER &&
                                community?.owner_id === auth.id)) && (
                              <PermissionToggle
                                name={PermissionNames[permission]}
                                toggled={has(permission)}
                                type={+group}
                                onToggle={(val) =>
                                  val ? add(permission) : remove(permission)
                                }
                              />
                            )
                        )}
                      </ul>
                    )}
                  </div>
                )}
              </>
            ))}
          </div>
          <div className={styles.bottom}>
            <Button disabled={isSubmitting} type='submit'>
              {isSubmitting ? <BarLoader color='#ffffff' /> : 'Create Group'}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export const NewGroup = () => {
  return <NewPermissionStandalone />
}

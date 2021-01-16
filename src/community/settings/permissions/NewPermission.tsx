import { Formik, Form, Field, ErrorMessage } from 'formik'
import React, { useState } from 'react'
import { BarLoader } from 'react-spinners'
import Button from '../../../components/Button'
import Input from '../../../components/Input'
import Modal from '../../../components/Modal'
import {
  clientGateway,
  Groups,
  PermissionNames,
  PermissionsGroups,
  Permissions,
  GroupNames
} from '../../../utils/constants'
import styles from './NewPermission.module.scss'
import { UI } from '../../../state/ui'
import { isUsername } from '../../../utils/validations'
import { Auth } from '../../../authentication/state'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPencil, faTimesCircle } from '@fortawesome/pro-solid-svg-icons'
import { useRouteMatch } from 'react-router-dom'
import { faToggleOff, faToggleOn } from '@fortawesome/pro-duotone-svg-icons'
import { useSet } from 'react-use'

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

export const Permission = ({
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
  const { token } = Auth.useContainer()
  const ui = UI.useContainer()
  const [editing, setEditing] = useState<Groups>()
  const [set, { add, remove, has }] = useSet<Permissions>(new Set([]))
  return (
    <div className={styles.permission}>
      <h3>New Permission Group</h3>
      <Formik
        initialValues={{ name: '' }}
        validate={validatePermission}
        onSubmit={async (
          values,
          { setSubmitting, setErrors, setFieldError }
        ) => {
          if (!values?.name) return setFieldError('name', 'Required')
          try {
            await createPermission(token!, match?.params.id!, {
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
        {({ isSubmitting, setFieldValue }) => (
          <Form>
            <label htmlFor='tag' className={styles.inputName}>
              Name
            </label>
            <Field component={Input} name='name' />
            <ErrorMessage component='p' name='name' />

            <label className={styles.permissionsGroup}>Permissions</label>
            {Object.entries(PermissionsGroups).map(([group, permissions]) => (
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
                )}
              </div>
            ))}
            <Button disabled={isSubmitting} type='submit'>
              {isSubmitting ? (
                <BarLoader color='#ffffff' />
              ) : (
                'Create Permission Group'
              )}
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  )
}

export const NewPermission = () => {
  const ui = UI.useContainer()
  return (
    <Modal onDismiss={() => ui.clearModal()}>
      <NewPermissionStandalone />
    </Modal>
  )
}

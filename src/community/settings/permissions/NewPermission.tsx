import { Formik, Form, Field, ErrorMessage } from 'formik'
import React, { useState } from 'react'
import { BarLoader } from 'react-spinners'
import Button from '../../../components/Button'
import Input from '../../../components/Input'
import Modal from '../../../components/Modal'
import { clientGateway, Groups } from '../../../utils/constants'
import styles from './NewPermission.module.scss'
import { UI } from '../../../state/ui'
import { isUsername } from '../../../utils/validations'
import { Auth } from '../../../authentication/state'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPencil, faTimesCircle } from '@fortawesome/pro-solid-svg-icons'
import { useRouteMatch } from 'react-router-dom'
import { faToggleOff, faToggleOn } from '@fortawesome/pro-duotone-svg-icons'

type createPermissionData = { name: string }

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
              name: values.name
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
            <div className={styles.basic}>
              <div
                className={styles.title}
                onClick={() =>
                  setEditing(
                    editing === Groups.BASIC ? undefined : Groups.BASIC
                  )
                }
              >
                Basic Permissions{' '}
                <FontAwesomeIcon
                  icon={editing === Groups.BASIC ? faTimesCircle : faPencil}
                />
              </div>
              {editing === Groups.BASIC && (
                <ul className={styles.list}>
                  <Permission
                    name='Read Messages'
                    toggled
                    type={Groups.BASIC}
                  />
                  <Permission
                    name='Send Messages'
                    toggled
                    type={Groups.BASIC}
                  />
                  <Permission
                    name='Mention Members'
                    toggled
                    type={Groups.BASIC}
                  />
                  <Permission name='Mention Groups' type={Groups.BASIC} />
                  <Permission name='Mention Someone' type={Groups.BASIC} />
                  <Permission name='Embed Links' toggled type={Groups.BASIC} />
                  <Permission
                    name='Create Invites'
                    toggled
                    type={Groups.BASIC}
                  />
                </ul>
              )}
            </div>
            <div className={styles.mod}>
              <div
                className={styles.title}
                onClick={() =>
                  setEditing(editing === Groups.MOD ? undefined : Groups.MOD)
                }
              >
                Mod Permissions{' '}
                <FontAwesomeIcon
                  icon={editing === Groups.MOD ? faTimesCircle : faPencil}
                />
              </div>
              {editing === Groups.MOD && (
                <ul className={styles.list}>
                  <Permission name='Ban Members' type={Groups.MOD} />
                  <Permission name='Kick Members' type={Groups.MOD} />
                  <Permission name='Mention Everyone' type={Groups.MOD} />
                  <Permission name='Manage Permissions' type={Groups.MOD} />
                  <Permission name='Manage Channels' type={Groups.MOD} />
                  <Permission name='Manage Invites' type={Groups.MOD} />
                  <Permission name='Manage Messages' type={Groups.MOD} />
                </ul>
              )}
            </div>
            <div className={styles.admin}>
              <div
                className={styles.title}
                onClick={() =>
                  setEditing(
                    editing === Groups.ADMIN ? undefined : Groups.ADMIN
                  )
                }
              >
                Admin Permissions{' '}
                <FontAwesomeIcon
                  icon={editing === Groups.ADMIN ? faTimesCircle : faPencil}
                />
              </div>
              {editing === Groups.ADMIN && (
                <ul className={styles.list}>
                  <Permission name='Manage Server' type={Groups.ADMIN} />
                  <Permission name='Administrator' type={Groups.ADMIN} />
                  <Permission name='Owner' type={Groups.ADMIN} />
                </ul>
              )}
            </div>
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

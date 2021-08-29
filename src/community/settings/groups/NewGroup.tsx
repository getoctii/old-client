import { ErrorMessage, Field, Form, Formik } from 'formik'
import { FC, useState } from 'react'
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
import { Auth } from '../../../authentication/state'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPencilAlt,
  faTimes,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons'
import { useRouteMatch } from 'react-router-dom'
import { faToggleOff, faToggleOn } from '@fortawesome/free-solid-svg-icons'
import { useSet } from 'react-use'
import { Permission } from '../../../utils/permissions'
import * as Yup from 'yup'

const GroupSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Too short, must be at least 2 characters.')
    .max(30, 'Too long, must be less then 30 characters.')
})

export const PermissionToggle: FC<{
  name: string
  type: Groups
  toggled?: boolean
  onToggle?: (value: boolean) => void
  className?: string
}> = ({ name, type, toggled, onToggle, className }) => {
  return (
    <li
      onClick={() => {
        if (onToggle) onToggle(!toggled)
      }}
      className={`${styles.permissionsToggle} ${
        type === Groups.BASIC
          ? styles.basic
          : type === Groups.MOD
          ? styles.mod
          : styles.admin
      } ${className ? className : ''}`}
    >
      {name} <FontAwesomeIcon icon={toggled ? faToggleOn : faToggleOff} />
    </li>
  )
}

export const NewPermissionStandalone: FC = () => {
  const match = useRouteMatch<{ id: string }>('/communities/:id')
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
      validationSchema={GroupSchema}
      onSubmit={async (values, { setSubmitting, setErrors, setFieldError }) => {
        if (!values?.name) return setFieldError('name', 'Required')
        try {
          await clientGateway.post(
            `/communities/${match?.params.id}/groups`,
            {
              name: values.name,
              permissions: Array.from(set) || []
            },
            {
              headers: { Authorization: auth.token }
            }
          )
          ui.clearModal()
        } catch (e: any) {
          if (e.response.data.errors.includes('GroupNameInvalid'))
            setErrors({ name: 'Invalid Group Name' })
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
                        icon={editing === +group ? faTimesCircle : faPencilAlt}
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

export const NewGroup: FC = () => {
  return <NewPermissionStandalone />
}

import { Formik, Form, ErrorMessage, Field } from 'formik'
import React, { useState } from 'react'
import { queryCache, useQuery } from 'react-query'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { Auth } from '../../../../authentication/state'
import Button from '../../../../components/Button'
import Input from '../../../../components/Input'
import { clientGateway } from '../../../../utils/constants'
import { isUsername } from '../../../../utils/validations'
import styles from './Settings.module.scss'
import { CommunityResponse, getCommunity } from '../../../remote'
import { isTag } from '../../../../utils/validations'
import IconPicker from '../../../../components/IconPicker'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave } from '@fortawesome/pro-duotone-svg-icons'
import { useUser } from '../../../../user/state'

const Personalization = () => {
  const auth = Auth.useContainer()
  const [saveName, setSaveName] = useState<string | undefined>(undefined)
  return (
    <div className={styles.card}>
      <h5>Personalization</h5>
      <div className={styles.personalization}>
        <div className={styles.icon}>
          <label htmlFor='icon' className={styles.inputName}>
            Icon
          </label>
          <IconPicker
            alt={'unknown'}
            onUpload={async (url) => {
              if (!auth.token) return
            }}
          />
        </div>
        <div className={styles.name}>
          <label htmlFor='name' className={styles.inputName}>
            Name
          </label>
          <div className={styles.nameInput}>
            <Input
              onChange={(event) => {
                if (event.target.value !== '') {
                  setSaveName(event.target.value)
                }
              }}
              onKeyDown={async (event) => {
                if (
                  event.key === 'Enter' &&
                  saveName &&
                  saveName !== '' &&
                  auth.token &&
                  isUsername(saveName)
                ) {
                  setSaveName(undefined)
                }
              }}
            />
            {saveName && (
              <Button
                type='button'
                onClick={async () => {
                  if (
                    !saveName ||
                    saveName === '' ||
                    !auth.token ||
                    !isUsername(saveName)
                  )
                    return
                  setSaveName(undefined)
                }}
              >
                <FontAwesomeIcon icon={faSave} />
              </Button>
            )}
          </div>
        </div>
        <ul>
          <li>- Must be 2-16 long</li>
          <li>- Can only be letters, numbers, dashes, and underscores.</li>
        </ul>
      </div>
    </div>
  )
}

type transferFormData = {
  username: string
}

const validateTransfer = (values: transferFormData) => {
  const errors: { username?: string } = {}
  if (!isTag(values.username)) errors.username = 'A valid username is required'
  return errors
}

type deleteFormData = {
  name: string
  actualName: string
}

const validateDelete = (values: deleteFormData) => {
  const errors: { name?: string } = {}
  if (values.name !== values.actualName)
    errors.name = 'The name must be the same as the current community'
  return errors
}

type FindResponse = {
  id: string
  avatar: string
  username: string
  discriminator: number
}

const DangerZone = ({ community }: { community: CommunityResponse }) => {
  const auth = Auth.useContainer()
  const history = useHistory()
  const user = useUser(auth?.id ?? undefined)
  return (
    <div className={styles.dangerZone}>
      {!community.organization && user?.developer && (
        <div className={styles.organization}>
          <h5>Danger Zone</h5>
          <h4>Enable Organization</h4>
          <p>
            This will allow you to distrbute products connected to this
            community. YOU CANNOT UNDO THIS SO BEWARE!
          </p>
          <Formik
            initialValues={{
              name: '',
              actualName: community.name
            }}
            validate={validateDelete}
            onSubmit={async (
              values,
              { setSubmitting, setErrors, setFieldError }
            ) => {
              if (!values?.name) return setFieldError('name', 'Required')
              try {
                await clientGateway.patch(
                  `/communities/${community.id}`,
                  {
                    organization: true
                  },
                  { headers: { Authorization: auth.token } }
                )
                await queryCache.invalidateQueries(['community', community.id])
                history.push(`/communities/${community.id}`)
              } finally {
                setSubmitting(false)
              }
            }}
          >
            {({ isSubmitting }) => (
              <Form>
                <label htmlFor='name'>Name</label>
                <div className={styles.dangerWrapper}>
                  <div className={styles.dangerInput}>
                    <Field component={Input} name='name' />
                    <ErrorMessage
                      className={styles.error}
                      component='p'
                      name='name'
                    />
                  </div>
                  <Button
                    className={styles.button}
                    disabled={isSubmitting}
                    type='submit'
                  >
                    Enable Organization
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      )}
      <div className={styles.transfer}>
        <h4>Transfer Ownership</h4>
        <p>
          Transferring ownership will give the specified person full control of
          this community. You will lose the ability to manage the server and
          won’t be able to regain control unless you ask the specified person to
          transfer the community back.{' '}
        </p>
        <Formik
          initialValues={{
            username: ''
          }}
          validate={validateTransfer}
          onSubmit={async (
            values,
            { setSubmitting, setErrors, setFieldError }
          ) => {
            if (!values?.username) return setFieldError('username', 'Required')
            try {
              const [username, discriminator] = values.username.split('#')
              const user = (
                await clientGateway.get<FindResponse>('/users/find', {
                  headers: { Authorization: auth.token },
                  params: {
                    username,
                    discriminator:
                      discriminator[1] === 'inn' ? 0 : Number(discriminator[1])
                  }
                })
              ).data
              await clientGateway.patch(
                `/communities/${community.id}`,
                new URLSearchParams({ owner_id: user.id }),
                { headers: { Authorization: auth.token } }
              )
              await queryCache.invalidateQueries(['community', community.id])
              history.push(`/communities/${community.id}`)
            } catch (e) {
              if (e.response.data.errors.includes('UserNotFound'))
                setErrors({ username: 'User not found' })
              // TODO: Add message if you try to add yourself...
            } finally {
              setSubmitting(false)
            }
          }}
        >
          {({ isSubmitting, setFieldValue }) => (
            <Form>
              <label htmlFor='username'>Username</label>
              <div className={styles.dangerWrapper}>
                <div className={styles.dangerInput}>
                  <Field component={Input} name='username' />
                  <ErrorMessage
                    className={styles.error}
                    component='p'
                    name='username'
                  />
                </div>
                <Button
                  className={styles.button}
                  disabled={isSubmitting}
                  type='submit'
                >
                  Transfer Ownership
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
      <div className={styles.delete}>
        <h4>Delete Community</h4>
        <p>
          Deleting a community will wipe it from the face of this planet. Do not
          do this as you will not be able to recover the community or any of
          it’s data including, channels, messages, users, and settings.{' '}
        </p>
        <Formik
          initialValues={{
            name: '',
            actualName: community.name
          }}
          validate={validateDelete}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              await clientGateway.delete(`/communities/${community.id}`, {
                headers: { Authorization: auth.token }
              })
              history.push(`/`)
            } finally {
              setSubmitting(false)
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <label htmlFor='name'>Name</label>
              <div className={styles.dangerWrapper}>
                <div className={styles.dangerInput}>
                  <Field component={Input} name='name' />
                  <ErrorMessage
                    className={styles.error}
                    component='p'
                    name='name'
                  />
                </div>
                <Button
                  className={styles.button}
                  disabled={isSubmitting}
                  type='submit'
                >
                  Delete Community
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  )
}

export const Settings = () => {
  const auth = Auth.useContainer()
  const match = useRouteMatch<{ id: string }>('/communities/:id/products')
  const { data: community } = useQuery(
    ['community', match?.params.id, auth.token],
    getCommunity
  )
  return (
    <div className={styles.general}>
      <div className={styles.basics}>
        <Personalization />
      </div>
      {community?.owner_id === auth.id && <DangerZone community={community} />}
    </div>
  )
}

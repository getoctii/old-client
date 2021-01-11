import { faFileUpload } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Formik, Form, ErrorMessage, Field } from 'formik'
import React, { useRef, useState } from 'react'
import { queryCache, useQuery } from 'react-query'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { BarLoader } from 'react-spinners'
import { Auth } from '../../authentication/state'
import Button from '../../components/Button'
import Input from '../../components/Input'
import { clientGateway } from '../../utils/constants'
import { isUsername } from '../../utils/validations'
import styles from './General.module.scss'
import axios from 'axios'
import { Community, getCommunity } from '../remote'
import { isTag } from '../../utils/validations'

type generalFormData = {
  name: string
  icon: string
}

const validateGeneral = (values: generalFormData) => {
  const errors: { name?: string; icon?: string } = {}
  if (!isUsername(values.name)) errors.name = 'A valid username is required'
  return errors
}

const Personalization = ({ community }: { community: Community }) => {
  const auth = Auth.useContainer()

  const [icon, setIcon] = useState(community.icon || '')
  const input = useRef<HTMLInputElement>(null)

  return (
    <Formik
      initialValues={{
        name: community.name || '',
        icon: community.icon || ''
      }}
      validate={validateGeneral}
      onSubmit={async (values, { setSubmitting, setFieldError }) => {
        if (!values.name) return setFieldError('username', 'Required')
        try {
          await clientGateway.patch(
            `/communities/${community.id}`,
            new URLSearchParams({
              ...(values.name !== community.name && {
                name: values.name
              }),
              icon: values.icon
            }),
            {
              headers: {
                authorization: auth.token
              }
            }
          )
          queryCache.invalidateQueries(['community', community.id])
        } catch (error) {
          console.log(error)
        } finally {
          setSubmitting(false)
        }
      }}
    >
      {({ isSubmitting, setFieldValue }) => (
        <Form className={styles.card}>
          <h5>Personalization</h5>
          <div className={styles.personalization}>
            <div>
              <label htmlFor='icon' className={styles.inputName}>
                Icon
              </label>
              <div className={styles.iconWrapper}>
                <div className={styles.iconContainer}>
                  <img
                    src={icon}
                    className={styles.icon}
                    alt={community.name}
                  />
                  <div
                    className={styles.overlay}
                    onClick={() => input.current?.click()}
                  >
                    <FontAwesomeIcon icon={faFileUpload} size='2x' />
                  </div>
                  <input
                    ref={input}
                    type='file'
                    accept='.jpg, .png, .jpeg, .gif'
                    onChange={async (event) => {
                      const image = event.target.files?.item(0) as any
                      const formData = new FormData()
                      formData.append('file', image)
                      const response = await axios.post(
                        'https://covfefe.innatical.com/api/v1/upload',
                        formData
                      )
                      setIcon(response.data?.url)
                      setFieldValue('icon', response.data?.url)
                    }}
                  />
                </div>
                <div className={styles.iconInfo}>
                  <h4>Personalize your community with an icon. </h4>
                  <p>Recommanded icon size is 100x100</p>
                  <div className={styles.covfefe}>Powered by file.coffee</div>
                </div>
              </div>
              <ErrorMessage component='p' name='icon' />
            </div>
            <div className={styles.name}>
              <label htmlFor='name' className={styles.inputName}>
                Name
              </label>

              <Field component={Input} name='name' />
              <ErrorMessage component='p' name='name' />
            </div>
            <ul>
              <li>- Must be 2-16 long</li>
              <li>- Can only be letters, numbers, dashes, and underscores.</li>
            </ul>
          </div>
          <Button disabled={isSubmitting} type='submit'>
            {isSubmitting ? <BarLoader color='#ffffff' /> : 'Save'}
          </Button>
        </Form>
      )}
    </Formik>
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

const DangerZone = ({ community }: { community: Community }) => {
  const auth = Auth.useContainer()
  const history = useHistory()
  return (
    <div className={styles.dangerZone}>
      <h5>Danger Zone</h5>
      <h4>Transfer Ownership</h4>
      <p>
        Transfering ownership will give the specficed person full control of
        this community. You will lose the ability to manage the server and won’t
        be able to regain control unless you ask the specfifed person to
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
            const splitted = values.username.split('#')
            const user = (
              await clientGateway.get<FindResponse>('/users/find', {
                headers: { Authorization: auth.token },
                params: {
                  username: splitted[0],
                  discriminator: splitted[1] === 'inn' ? 0 : Number(splitted[1])
                }
              })
            ).data
            await clientGateway.patch(
              `/communities/${community.id}`,
              new URLSearchParams({ owner_id: user.id }),
              { headers: { Authorization: auth.token } }
            )
            queryCache.invalidateQueries(['community', community.id])
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
              <Button disabled={isSubmitting} type='submit'>
                Transfer Ownership
              </Button>
            </div>
          </Form>
        )}
      </Formik>
      <div className={styles.seperator} />
      <h4>Delete Commmunity</h4>
      <p>
        Deleting a community will wipe it from the face of this planet. Do not
        do this as you will not be able to recover the community or any of it’s
        data including, channels, messages, users, and settings.{' '}
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
              <Button disabled={isSubmitting} type='submit'>
                Delete Community
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}

export const General = () => {
  const auth = Auth.useContainer()
  const match = useRouteMatch<{ id: string }>('/communities/:id/settings')
  const community = useQuery(
    ['community', match?.params.id, auth.token],
    getCommunity
  )
  if (!community?.data) return <></>
  return (
    <div className={styles.general}>
      <div className={styles.basics}>
        <Personalization community={community.data} />
        <div className={styles.card}>
          <h6>Coming Soon</h6>
        </div>
      </div>
      <DangerZone community={community.data} />
    </div>
  )
}

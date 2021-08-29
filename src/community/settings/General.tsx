import { Formik, Form, ErrorMessage, Field } from 'formik'
import { FC, useState } from 'react'
import { queryCache, useQuery } from 'react-query'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { Auth } from '../../authentication/state'
import Button from '../../components/Button'
import Input from '../../components/Input'
import { clientGateway } from '../../utils/constants'
import { isCommunityName } from '../../utils/validations'
import styles from './General.module.scss'
import { CommunityResponse, getChannels, getCommunity } from '../remote'
import IconPicker from '../../components/IconPicker'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronCircleDown,
  faSave,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons'
import { useUser } from '../../user/state'
import * as Yup from 'yup'

const TransferSchema = Yup.object().shape({
  username: Yup.string()
    .min(2, 'Too short, must be at least 2 characters.')
    .max(16, 'Too long, must be less then 16 characters.')
    .matches(/^[a-zA-Z0-9]+$/, 'Username must be alphanumeric.')
    .optional()
})

const DeleteSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Too short, must be at least 2 characters.')
    .max(32, 'Too long, must be less then 16 characters.')
    .optional()
})

const saveSettings = async (
  communityID: string,
  values: {
    name?: string
    icon?: string
    system_channel_id?: string | null
  },
  token: string
) => {
  if (!values.name && !values.icon && values.system_channel_id === undefined)
    return
  await clientGateway.patch(`/communities/${communityID}`, values, {
    headers: {
      authorization: token
    }
  })
  await queryCache.invalidateQueries(['community', communityID])
}

const SystemChannel: FC<{ community: CommunityResponse }> = ({ community }) => {
  const auth = Auth.useContainer()
  const { data: channels } = useQuery(
    ['channels', community.id, auth.token],
    getChannels
  )

  const [dropdownToggled, setDropdownToggled] = useState(false)
  return (
    <div className={styles.card}>
      <h5>System Messages</h5>
      <div className={styles.systemChannel}>
        <div className={styles.channel}>
          <label htmlFor='channel' className={styles.inputName}>
            Welcome Room
          </label>
          <p>Sends a message when someone joins to the selected room.</p>
          <div className={styles.select}>
            <div
              className={styles.selected}
              onClick={() => setDropdownToggled(!dropdownToggled)}
            >
              <span>
                {community.system_channel_id
                  ? `#${
                      channels?.find(
                        (c) => c.id === community.system_channel_id
                      )?.name
                    }`
                  : 'Select a Room'}
              </span>
              <FontAwesomeIcon
                icon={dropdownToggled ? faTimesCircle : faChevronCircleDown}
              />
            </div>
            {dropdownToggled && (
              <div className={styles.items}>
                <div
                  className={`${styles.item} ${styles.none}`}
                  onClick={async () => {
                    if (!auth.token) return
                    await saveSettings(
                      community.id,
                      {
                        system_channel_id: null
                      },
                      auth.token
                    )
                    setDropdownToggled(false)
                  }}
                >
                  None
                </div>
                {channels?.map((channel) => (
                  <div
                    onClick={async () => {
                      if (!auth.token) return
                      await saveSettings(
                        community.id,
                        {
                          system_channel_id: channel.id
                        },
                        auth.token
                      )
                      setDropdownToggled(false)
                    }}
                    className={`${styles.item} ${
                      channel.id === community.system_channel_id
                        ? styles.primary
                        : ''
                    }`}
                  >
                    #{channel.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const Personalization: FC<{
  community: CommunityResponse
}> = ({ community }) => {
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
            alt={community.name || 'unknown'}
            defaultIcon={community.icon}
            onUpload={async (url) => {
              if (!auth.token) return
              await saveSettings(
                community.id,
                {
                  icon: url
                },
                auth.token
              )
            }}
          />
        </div>
        <div className={styles.name}>
          <label htmlFor='name' className={styles.inputName}>
            Name
          </label>
          <div className={styles.nameInput}>
            <Input
              defaultValue={community.name}
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
                  isCommunityName(saveName)
                ) {
                  await saveSettings(
                    community.id,
                    { name: saveName },
                    auth.token
                  )
                  setSaveName(undefined)
                }
              }}
            />
            {saveName && community.name !== saveName && (
              <Button
                type='button'
                onClick={async () => {
                  if (
                    !saveName ||
                    saveName === '' ||
                    !auth.token ||
                    !isCommunityName(saveName)
                  )
                    return
                  await saveSettings(
                    community.id,
                    { name: saveName },
                    auth.token
                  )
                  setSaveName(undefined)
                }}
              >
                <FontAwesomeIcon icon={faSave} />
              </Button>
            )}
          </div>
        </div>
        <ul>
          <li>- Must be 2-32 long</li>
          <li>- Can only be letters, numbers, dashes, and underscores.</li>
        </ul>
      </div>
    </div>
  )
}

type FindResponse = {
  id: string
  avatar: string
  username: string
  discriminator: number
}

const DangerZone: FC<{ community: CommunityResponse }> = ({ community }) => {
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
            validationSchema={TransferSchema}
            onSubmit={async (values, { setSubmitting, setFieldError }) => {
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
          validationSchema={TransferSchema}
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
            } catch (e: any) {
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
          validationSchema={DeleteSchema}
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

export const General: FC = () => {
  const auth = Auth.useContainer()
  const match = useRouteMatch<{ id: string }>('/communities/:id/settings')
  const { data: community } = useQuery(
    ['community', match?.params.id, auth.token],
    getCommunity
  )
  if (!community) return <></>
  return (
    <div className={styles.general}>
      <div className={styles.basics}>
        <Personalization community={community} />
        <SystemChannel community={community} />
      </div>
      {community?.owner_id === auth.id && <DangerZone community={community} />}
    </div>
  )
}

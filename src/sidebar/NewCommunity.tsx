import { Formik, Form, Field, ErrorMessage } from 'formik'
import { useState } from 'react'
import { BarLoader } from 'react-spinners'
import Button from '../components/Button'
import Input from '../components/Input'
import { clientGateway } from '../utils/constants'
import styles from './NewCommunity.module.scss'
import { UI } from '../state/ui'
import { isInvite, isUsername } from '../utils/validations'
import { Auth } from '../authentication/state'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faTimes } from '@fortawesome/pro-solid-svg-icons'
import { useHistory } from 'react-router-dom'
import IconPicker from '../components/IconPicker'

interface ConversationResponse {
  id: string
  channel_id: string
}

type createCommunityData = { name: string; icon: string }
type inviteData = { invite: string }

const validateCommunity = (values: createCommunityData) => {
  const errors: { name?: string; icon?: string } = {}
  if (!isUsername(values.name)) errors.name = 'A valid name is required'
  return errors
}

const validateInvite = (values: inviteData) => {
  const errors: { name?: string; icon?: string } = {}
  if (!isInvite(values.invite)) errors.name = 'A valid invite is required'
  return errors
}

const createCommunity = async (token: string, values: createCommunityData) =>
  (
    await clientGateway.post<ConversationResponse>('/communities', values, {
      headers: { Authorization: token }
    })
  ).data

const CreateCommunity = ({ dismiss }: { dismiss: Function }) => {
  const { token } = Auth.useContainer()
  const ui = UI.useContainer()
  const history = useHistory()
  return (
    <Formik
      initialValues={{ name: '', icon: '' }}
      validate={validateCommunity}
      onSubmit={async (values, { setSubmitting, setErrors, setFieldError }) => {
        if (!values?.name) return setFieldError('invite', 'Required')
        try {
          const community = await createCommunity(token!, {
            name: values.name,
            icon: values?.icon || ''
          })
          ui.clearModal()
          if (community?.id) history.push(`/communities/${community.id}`)
        } catch (e) {
          if (e.response.data.errors.includes('CommunityNameInvalid'))
            setErrors({ name: 'Invalid Community Name' })
          if (e.response.data.errors.includes('InvalidIcon'))
            setErrors({ icon: 'Invalid Community Icon' })
        } finally {
          setSubmitting(false)
        }
      }}
    >
      {({ isSubmitting, setFieldValue }) => (
        <Form>
          <div className={styles.invite}>
            <div className={styles.body}>
              <div className={styles.header}>
                <div className={styles.icon} onClick={() => dismiss()}>
                  <FontAwesomeIcon
                    className={styles.backButton}
                    icon={faChevronLeft}
                  />
                </div>
                <div className={styles.title}>
                  <h2>New Community</h2>
                </div>
              </div>
              <div>
                <IconPicker
                  className={styles.iconPicker}
                  forcedSmall
                  alt={'community'}
                  onUpload={(url: string) => {
                    setFieldValue('icon', url)
                  }}
                />

                <ErrorMessage
                  className={styles.error}
                  component='p'
                  name='icon'
                />
              </div>

              <label htmlFor='tag' className={styles.inputName}>
                Name
              </label>
              <Field component={Input} name='name' />
              <ErrorMessage
                className={styles.error}
                component='p'
                name='name'
              />
            </div>
            <div className={styles.bottom}>
              <Button disabled={isSubmitting} type='submit'>
                {isSubmitting ? (
                  <BarLoader color='#ffffff' />
                ) : (
                  'Create Community'
                )}
              </Button>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  )
}

const joinCommunity = async (invite: string, token: string) =>
  (
    await clientGateway.post<{ community_id: string }>(
      `/invites/${invite}/use`,
      {},
      { headers: { Authorization: token } }
    )
  ).data

export const NewCommunity = () => {
  const { token } = Auth.useContainer()
  const ui = UI.useContainer()
  const [createCommunityMenu, setCreateCommunityMenu] = useState(false)
  const history = useHistory()

  return (
    <>
      {createCommunityMenu ? (
        <CreateCommunity dismiss={setCreateCommunityMenu} />
      ) : (
        <div className={styles.invite}>
          <div className={styles.body}>
            <div className={styles.header}>
              <div className={styles.icon} onClick={() => ui.clearModal()}>
                <FontAwesomeIcon className={styles.backButton} icon={faTimes} />
              </div>
              <div className={styles.title}>
                <h2>New Community</h2>
              </div>
            </div>
            <Formik
              initialValues={{ invite: '' }}
              validate={validateInvite}
              onSubmit={async (
                values,
                { setSubmitting, setErrors, setFieldError }
              ) => {
                if (!token) return
                if (!values?.invite) return setFieldError('invite', 'Required')
                try {
                  const id = (await joinCommunity(values.invite, token))
                    .community_id
                  history.push(`/communities/${id}`)
                  ui.clearModal()
                } catch (e) {
                  if (e.response.data.errors.includes('InvalidCode'))
                    setErrors({ invite: 'Invalid Invite' })
                  if (e.response.data.errors.includes('InviteNotFound'))
                    setErrors({ invite: 'Invite not found' })
                  if (e.response.data.errors.includes('AlreadyInCommunity'))
                    setErrors({
                      invite: 'You are already in this community'
                    })
                } finally {
                  setSubmitting(false)
                }
              }}
            >
              {({ isSubmitting }) => (
                <Form>
                  <label htmlFor='tag' className={styles.inputName}>
                    Invite
                  </label>
                  <Field component={Input} name='invite' />
                  <ErrorMessage component='p' name='invite' />
                  <Button
                    className={styles.joinButton}
                    disabled={isSubmitting}
                    type='submit'
                  >
                    {isSubmitting ? (
                      <BarLoader color='#ffffff' />
                    ) : (
                      'Join Community'
                    )}
                  </Button>
                </Form>
              )}
            </Formik>
          </div>
          <div className={styles.bottom}>
            <Button
              type='button'
              className={styles.createButton}
              onClick={() => setCreateCommunityMenu(true)}
            >
              Or Create a Community
            </Button>
          </div>
        </div>
      )}
    </>
  )
}

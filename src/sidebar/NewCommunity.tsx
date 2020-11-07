import { Formik, Form, Field, ErrorMessage } from 'formik'
import React, { useRef, useState } from 'react'
import { BarLoader } from 'react-spinners'
import Button from '../components/Button'
import Input from '../components/Input'
import Modal from '../components/Modal'
import { clientGateway } from '../constants'
import styles from './NewCommunity.module.scss'
import { UI } from '../state/ui'
import { isInvite, isUsername } from '../validations'
import { Auth } from '../authentication/state'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronCircleLeft,
  faFileUpload
} from '@fortawesome/pro-solid-svg-icons'
import axios from 'axios'
import { useHistory } from 'react-router-dom'

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
    await clientGateway.post<ConversationResponse>(
      '/communities',
      new URLSearchParams(values),
      { headers: { Authorization: token } }
    )
  ).data

const CreateCommunity = ({ dismiss }: { dismiss: Function }) => {
  const { token } = Auth.useContainer()
  const ui = UI.useContainer()
  const input = useRef<any>(null)
  const [avatar, setAvatar] = useState('')
  const history = useHistory()
  return (
    <div className={styles.invite}>
      <h3>
        <FontAwesomeIcon
          icon={faChevronCircleLeft}
          onClick={() => dismiss(false)}
        />{' '}
        Create a Community
      </h3>
      <Formik
        initialValues={{ name: '', icon: '' }}
        validate={validateCommunity}
        onSubmit={async (
          values,
          { setSubmitting, setErrors, setFieldError }
        ) => {
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
              setErrors({ name: 'Invaild Community Name' })
            if (e.response.data.errors.includes('InvaildIcon'))
              setErrors({ icon: 'Invaild Community Icon' })
          } finally {
            setSubmitting(false)
          }
        }}
      >
        {({ isSubmitting, setFieldValue }) => (
          <Form>
            <div>
              <div className={styles.avatarContainer}>
                {avatar && (
                  <img
                    src={avatar}
                    className={styles.avatar}
                    alt={'community'}
                  />
                )}
                <div
                  className={avatar ? styles.hideOverlay : styles.overlay}
                  onClick={() => input.current.click()}
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
                    setAvatar(response.data?.url)
                    setFieldValue('icon', response.data?.url)
                  }}
                />
              </div>
              <ErrorMessage component='p' name='icon' />
            </div>

            <label htmlFor='tag' className={styles.inputName}>
              Name
            </label>
            <Field component={Input} name='name' />
            <ErrorMessage component='p' name='name' />
            <Button disabled={isSubmitting} type='submit'>
              {isSubmitting ? (
                <BarLoader color='#ffffff' />
              ) : (
                'Create Community'
              )}
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  )
}

export const NewCommunity = () => {
  const { token } = Auth.useContainer()
  const ui = UI.useContainer()
  const [createCommunityMenu, setCreateCommunityMenu] = useState(false)
  const history = useHistory()
  const joinCommunity = async (invite: string) =>
    (
      await clientGateway.post<{ community_id: string }>(
        `/invites/${invite}/use`,
        {},
        { headers: { Authorization: token } }
      )
    ).data

  return (
    <Modal onDismiss={() => ui.clearModal()}>
      {createCommunityMenu ? (
        <CreateCommunity dismiss={setCreateCommunityMenu} />
      ) : (
        <div className={styles.invite}>
          <h3>Join a Community</h3>
          <Formik
            initialValues={{ invite: '' }}
            validate={validateInvite}
            onSubmit={async (
              values,
              { setSubmitting, setErrors, setFieldError }
            ) => {
              if (!values?.invite) return setFieldError('invite', 'Required')
              try {
                const id = (await joinCommunity(values.invite)).community_id
                history.push(`/communities/${id}`)
                ui.clearModal()
              } catch (e) {
                console.log('joinError', e.response.data.errors)
                if (e.response.data.errors.includes('InvalidCode'))
                  setErrors({ invite: 'Invaild Invite' })
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
                <Button disabled={isSubmitting} type='submit'>
                  {isSubmitting ? (
                    <BarLoader color='#ffffff' />
                  ) : (
                    'Join Community'
                  )}
                </Button>
              </Form>
            )}
          </Formik>
          <hr />
          <Button
            type='button'
            className={styles.createButton}
            onClick={() => setCreateCommunityMenu(true)}
          >
            Or Create a Community
          </Button>
        </div>
      )}
    </Modal>
  )
}

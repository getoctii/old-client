import { Formik, Form, Field, ErrorMessage } from 'formik'
import { FC, useState } from 'react'
import { BarLoader } from 'react-spinners'
import Button from '../components/Button'
import Input from '../components/Input'
import { clientGateway } from '../utils/constants'
import styles from './NewCommunity.module.scss'
import { UI } from '../state/ui'
import { Auth } from '../authentication/state'
import { faChevronLeft } from '@fortawesome/pro-solid-svg-icons'
import { useHistory } from 'react-router-dom'
import IconPicker from '../components/IconPicker'
import * as Yup from 'yup'
import Modal from '../components/Modal'
import { faTimesCircle } from '@fortawesome/pro-duotone-svg-icons'

const CommunitySchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Too short, must be at least 2 characters.')
    .max(32, 'Too long, must be less then 16 characters.'),
  icon: Yup.string().url()
})

const InviteSchema = Yup.object().shape({
  name: Yup.string()
})

const CreateCommunity: FC<{ dismiss: Function }> = ({ dismiss }) => {
  const { token } = Auth.useContainer()
  const ui = UI.useContainer()
  const history = useHistory()
  return (
    <Formik
      initialValues={{ name: '', icon: '' }}
      validationSchema={CommunitySchema}
      onSubmit={async (values, { setSubmitting, setErrors, setFieldError }) => {
        if (!values?.name) return setFieldError('name', 'Required')
        if (!values?.icon) return setFieldError('icon', 'Required')
        try {
          const { data: community } = await clientGateway.post<{
            id: string
            name: string
            icon?: string
            large: boolean
            owner_id: string
          }>(
            '/communities',
            {
              name: values.name,
              icon: values?.icon || ''
            },
            {
              headers: { Authorization: token }
            }
          )
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
        <div className={styles.invite}>
          <Form>
            <Modal
              title={'New Community'}
              icon={faChevronLeft}
              onDismiss={() => dismiss()}
              bottom={
                <Button
                  disabled={isSubmitting}
                  type='submit'
                  className={styles.createButton}
                >
                  {isSubmitting ? (
                    <BarLoader color='#ffffff' />
                  ) : (
                    'Create Community'
                  )}
                </Button>
              }
            >
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
            </Modal>
          </Form>
        </div>
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

export const NewCommunity: FC = () => {
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
          <Formik
            initialValues={{ invite: '' }}
            validationSchema={InviteSchema}
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
              <Modal
                onDismiss={() => ui.clearModal()}
                title={'New Community'}
                icon={faTimesCircle}
                bottom={
                  <Button
                    type='button'
                    className={styles.createButton}
                    onClick={() => setCreateCommunityMenu(true)}
                  >
                    Or Create a Community
                  </Button>
                }
              >
                <Form>
                  <label htmlFor='tag' className={styles.inputName}>
                    Invite
                  </label>
                  <Field component={Input} name='invite' />
                  <ErrorMessage
                    component='p'
                    name='invite'
                    className={styles.error}
                  />
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
              </Modal>
            )}
          </Formik>
        </div>
      )}
    </>
  )
}

import { faTimesCircle } from '@fortawesome/pro-duotone-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ErrorMessage, Field, Formik, Form } from 'formik'
import { Auth } from '../authentication/state'
import Button from '../components/Button'
import Modal from '../components/Modal'
import Input from '../components/Input'
import { ChannelTypes, clientGateway } from '../utils/constants'
import { BarLoader } from 'react-spinners'
import styles from './NewChannel.module.scss'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { getChannels, getCommunity } from './remote'
import { UI } from '../state/ui'
import { useQuery } from 'react-query'

type formData = { name: string; type: ChannelTypes }

const validate = (values: formData) => {
  const errors: { name?: string; type?: string } = {}
  const name = values.name
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
  if (!(name.length <= 30 && name.length >= 2)) errors.name = 'Invalid Name'
  if (!values.type) errors.type = 'Invalid Type'
  return errors
}

export const NewChannel = () => {
  const history = useHistory()
  const { token } = Auth.useContainer()
  const ui = UI.useContainer()
  const match = useRouteMatch<{ id: string }>('/communities/:id')

  const { data: community } = useQuery(
    ['community', match?.params.id, token],
    getCommunity,
    {
      enabled: !!match?.params.id && !!token
    }
  )

  const { data: channels } = useQuery(
    ['channels', match?.params.id, token],
    getChannels
  )

  return (
    <Modal onDismiss={() => ui.clearModal()}>
      <Formik
        initialValues={{ name: '', type: ChannelTypes.TEXT }}
        validate={validate}
        onSubmit={async (
          values,
          { setSubmitting, setFieldError, setErrors }
        ) => {
          try {
            if (!values.name) return setFieldError('name', 'Required')

            const name =
              values.type === ChannelTypes.TEXT
                ? values.name
                    .toString()
                    .toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[^\w-]+/g, '')
                    .replace(/--+/g, '-')
                    .replace(/^-+/, '')
                    .replace(/-+$/, '')
                : values.name

            const channel = await clientGateway.post(
              `/communities/${match?.params.id}/channels`,
              { name, type: values.type ?? ChannelTypes.TEXT },
              {
                headers: { Authorization: token }
              }
            )
            if (channel?.data?.id && values.type === ChannelTypes.TEXT)
              history.push(
                `/communities/${match?.params.id}/channels/${channel.data.id}`
              )
            ui.clearModal()
          } catch (e) {
            const errors = e.response.data.errors
            const userErrors: { name?: string } = {}
            if (errors.includes('ChannelNameInvalid'))
              userErrors.name = 'Invalid Channel Name'
            setErrors(userErrors)
            ui.clearModal()
          } finally {
            setSubmitting(false)
          }
        }}
      >
        {({ isSubmitting, values, setFieldValue }) => (
          <Form>
            <div className={styles.newChannel}>
              <h5>
                {community?.name}{' '}
                <span className={styles.closeIcon}>
                  <FontAwesomeIcon
                    onClick={() => ui.clearModal()}
                    icon={faTimesCircle}
                  />
                </span>
              </h5>
              <h4>New Channel</h4>

              <label htmlFor='type' className={styles.label}>
                Type
              </label>
              <div className={styles.type}>
                <Button
                  type={'button'}
                  className={`${
                    values.type === ChannelTypes.TEXT ? styles.selected : ''
                  }`}
                  onClick={() => setFieldValue('type', ChannelTypes.TEXT)}
                >
                  Text Channel
                </Button>
                {(channels ?? []).filter(
                  (c) => c.type !== ChannelTypes.CATEGORY
                ).length > 0 && (
                  <Button
                    type={'button'}
                    className={`${
                      values.type === ChannelTypes.CATEGORY
                        ? styles.selected
                        : ''
                    }`}
                    onClick={() => setFieldValue('type', ChannelTypes.CATEGORY)}
                  >
                    Category
                  </Button>
                )}
              </div>
              <label htmlFor='name' className={styles.label}>
                Name
              </label>
              <Field
                component={Input}
                id='name'
                name='name'
                type='name'
                enterkeyhint='next'
              />
              <ErrorMessage
                component='p'
                className={styles.error}
                name='name'
              />
              <ul>
                <li>Only contain letters, numbers, dashes, and underscores</li>
                <li>Between 2-30 characters long</li>
              </ul>
              <Button disabled={isSubmitting} type='submit'>
                {isSubmitting ? <BarLoader color='#ffffff' /> : 'New Channel'}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  )
}

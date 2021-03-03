import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ErrorMessage, Field, Formik, Form } from 'formik'
import { Auth } from '../authentication/state'
import Button from '../components/Button'
import Input from '../components/Input'
import { ChannelTypes, clientGateway } from '../utils/constants'
import { BarLoader } from 'react-spinners'
import styles from './NewChannel.module.scss'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { getChannels, getCommunity } from './remote'
import { UI } from '../state/ui'
import { useQuery } from 'react-query'
import { faTimes } from '@fortawesome/pro-solid-svg-icons'
import React from 'react'
import * as Yup from 'yup'

const ChannelSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Too short, must be at least 2 characters.')
    .max(30, 'Too long, must be less then 30 characters.')
})

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
    <Formik
      initialValues={{ name: '', type: ChannelTypes.TEXT }}
      validationSchema={ChannelSchema}
      onSubmit={async (values, { setSubmitting, setFieldError, setErrors }) => {
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
        <Form className={styles.newChannel}>
          <div className={styles.body}>
            <div className={styles.header}>
              <div className={styles.icon} onClick={() => ui.clearModal()}>
                <FontAwesomeIcon className={styles.backButton} icon={faTimes} />
              </div>
              <div className={styles.title}>
                <small>{community?.name}</small>
                <h2>New Channel</h2>
              </div>
            </div>

            <label htmlFor='type' className={styles.inputName}>
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
              {(channels ?? []).filter((c) => c.type !== ChannelTypes.CATEGORY)
                .length > 0 && (
                <Button
                  type={'button'}
                  className={`${
                    values.type === ChannelTypes.CATEGORY ? styles.selected : ''
                  }`}
                  onClick={() => setFieldValue('type', ChannelTypes.CATEGORY)}
                >
                  Category
                </Button>
              )}
            </div>
            <label htmlFor='name' className={styles.inputName}>
              Name
            </label>
            <Field
              component={Input}
              id='name'
              name='name'
              type='name'
              enterkeyhint='next'
            />
            <ErrorMessage component='p' className={styles.error} name='name' />
            <ul>
              <li>Only contain letters, numbers, dashes, and underscores</li>
              <li>Between 2-30 characters long</li>
            </ul>
          </div>
          <div className={styles.bottom}>
            <Button disabled={isSubmitting} type='submit'>
              {isSubmitting ? <BarLoader color='#ffffff' /> : 'New Channel'}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  )
}

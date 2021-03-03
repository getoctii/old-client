import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ErrorMessage, Field, Formik, Form } from 'formik'
import { Auth } from '../authentication/state'
import Button from '../components/Button'
import Input from '../components/Input'
import { clientGateway } from '../utils/constants'
import { BarLoader } from 'react-spinners'
import styles from './NewChannel.module.scss'
import { UI } from '../state/ui'
import { useQuery } from 'react-query'
import { faTimes } from '@fortawesome/pro-solid-svg-icons'
import React from 'react'
import { getChannel } from '../chat/remote'
import * as Yup from 'yup'

const ChannelSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Too short, must be at least 2 characters.')
    .max(30, 'Too long, must be less then 30 characters.'),
  description: Yup.string()
    .min(2, 'Too short, must be at least 2 characters.')
    .max(140, 'Too long, must be less then 140 characters.')
})

export const EditChannel = ({ id }: { id: string }) => {
  const { token } = Auth.useContainer()
  const ui = UI.useContainer()
  const { data: channel } = useQuery(['channel', id, token], getChannel)

  return (
    <Formik
      initialValues={{
        name: channel?.name ?? '',
        description: channel?.description,
        color: channel?.color
      }}
      validationSchema={ChannelSchema}
      onSubmit={async (values, { setSubmitting, setFieldError, setErrors }) => {
        try {
          if (!values.name) return setFieldError('name', 'Required')
          const name = values.name
            .toString()
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, '')
            .replace(/--+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '')
          await clientGateway.patch(
            `/channels/${id}`,
            { name, description: values.description },
            {
              headers: { Authorization: token }
            }
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
                <small>#{channel?.name}</small>
                <h2>Edit Channel</h2>
              </div>
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

            <label htmlFor='description' className={styles.inputName}>
              Description
            </label>
            <Field
              component={Input}
              id='description'
              name='description'
              type='name'
              enterkeyhint='next'
            />
            <ErrorMessage
              component='p'
              className={styles.error}
              name='description'
            />
          </div>
          <div className={styles.bottom}>
            <Button disabled={isSubmitting} type='submit'>
              {isSubmitting ? <BarLoader color='#ffffff' /> : 'Edit Channel'}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  )
}

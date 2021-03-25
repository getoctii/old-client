import { ErrorMessage, Field, Form, Formik } from 'formik'
import { Auth } from '../../authentication/state'
import Button from '../../components/Button'
import Input from '../../components/Input'
import { clientGateway } from '../../utils/constants'
import { BarLoader } from 'react-spinners'
import styles from './NewProduct.module.scss'
import { useRouteMatch } from 'react-router-dom'
import { getCommunity } from '../remote'
import { UI } from '../../state/ui'
import { useQuery } from 'react-query'
import { faTimes } from '@fortawesome/pro-solid-svg-icons'
import * as Yup from 'yup'
import Modal from '../../components/Modal'
import React from 'react'
import IconPicker from '../../components/IconPicker'
import TextArea from '../../components/TextArea'

const ProductSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Too short, must be at least 2 characters.')
    .max(30, 'Too long, must be less then 30 characters.'),
  icon: Yup.string().url()
})

const NewProduct = () => {
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

  return (
    <Formik
      initialValues={{ name: '', description: '', icon: '' }}
      validationSchema={ProductSchema}
      onSubmit={async (values, { setSubmitting, setFieldError, setErrors }) => {
        try {
          if (!values.name) return setFieldError('name', 'Required')
          const { data: channel } = await clientGateway.post(
            `/communities/${match?.params.id}/products`,
            {
              name: values.name,
              icon: values.icon,
              description: values.description
            },
            {
              headers: { Authorization: token }
            }
          )
          if (!channel) return
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
      {({ isSubmitting, setFieldValue }) => (
        <Form>
          <div className={styles.newProduct}>
            <Modal
              onDismiss={() => ui.clearModal()}
              title={'New Product'}
              subtitle={`${community?.name}`}
              icon={faTimes}
              bottom={
                <Button
                  disabled={isSubmitting}
                  type='submit'
                  className={styles.createButton}
                >
                  {isSubmitting ? <BarLoader color='#ffffff' /> : 'New Product'}
                </Button>
              }
            >
              <div>
                <IconPicker
                  className={styles.iconPicker}
                  forcedSmall
                  alt={'product'}
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
              <ErrorMessage
                component='p'
                className={styles.error}
                name='name'
              />
              <ul>
                <li>Only contain letters, numbers, dashes, and underscores</li>
                <li>Between 2-30 characters long</li>
              </ul>

              <label htmlFor='description' className={styles.inputName}>
                Description
              </label>
              <TextArea name={'description'} />
              <ErrorMessage
                component='p'
                className={styles.error}
                name='description'
              />
            </Modal>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default NewProduct

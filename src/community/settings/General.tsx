import { faFileUpload } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Formik, Form, ErrorMessage, Field } from 'formik'
import React, { useRef, useState } from 'react'
import { queryCache, useQuery } from 'react-query'
import { useRouteMatch } from 'react-router-dom'
import { BarLoader } from 'react-spinners'
import { Auth } from '../../authentication/state'
import Button from '../../components/Button'
import Input from '../../components/Input'
import { clientGateway } from '../../constants'
import { isUsername } from '../../validations'
import styles from './General.module.scss'
import axios from 'axios'
import { getCommunity } from '../remote'

type generalFormData = {
  name: string
  icon: string
}

const validateGeneral = (values: generalFormData) => {
  const errors: { name?: string; icon?: string } = {}
  if (!isUsername(values.name)) errors.name = 'A valid username is required'
  return errors
}

export const General = () => {
  const auth = Auth.useContainer()
  const match = useRouteMatch<{ id: string }>('/communities/:id/settings')
  const community = useQuery(
    ['community', match?.params.id, auth.token],
    getCommunity
  )
  const [icon, setIcon] = useState(community.data?.icon || '')
  const input = useRef<any>(null)

  return (
    <Formik
      initialValues={{
        name: community.data?.name || '',
        icon: community.data?.icon || ''
      }}
      validate={validateGeneral}
      onSubmit={async (values, { setSubmitting, setFieldError }) => {
        if (!values.name) return setFieldError('username', 'Required')
        try {
          await clientGateway.patch(
            `/communities/${community.data?.id}`,
            new URLSearchParams({
              ...(values.name !== community.data?.name && {
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
          queryCache.invalidateQueries(['community', community.data?.id])
        } catch (error) {
          console.log(error)
        } finally {
          setSubmitting(false)
        }
      }}
    >
      {({ isSubmitting, setFieldValue }) => (
        <Form className={styles.wrapper}>
          <div className={styles.general}>
            <div>
              <label htmlFor='icon' className={styles.inputName}>
                Icon
              </label>
              <div className={styles.iconContainer}>
                <img
                  src={icon}
                  className={styles.icon}
                  alt={community.data?.name}
                />
                <div
                  className={styles.overlay}
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
                    setIcon(response.data?.url)
                    setFieldValue('icon', response.data?.url)
                  }}
                />
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
          </div>
          <Button disabled={isSubmitting} type='submit'>
            {isSubmitting ? <BarLoader color='#ffffff' /> : 'Save'}
          </Button>
        </Form>
      )}
    </Formik>
  )
}

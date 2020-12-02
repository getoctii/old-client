import {
  faCircle,
  faMoon,
  faSignOut,
  faStopCircle,
  faTimesCircle
} from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { queryCache, useQuery } from 'react-query'
import { Auth } from '../authentication/state'
import { clientGateway } from '../utils/constants'
import { UI } from '../state/ui'
import { State } from '../user/remote'
import Button from './Button'
import styles from './Status.module.scss'
import { getUser } from '../user/remote'
import { ErrorMessage, Field, Form, Formik } from 'formik'
import Input from './Input'
import { BarLoader } from 'react-spinners'

const updateStatus = async (id: string, state: State, token: string) => {
  await clientGateway.patch(`/users/${id}`, new URLSearchParams({ state }), {
    headers: {
      authorization: token
    }
  })
  queryCache.invalidateQueries(['users', id])
}

const Status = () => {
  const { id, token } = Auth.useContainer()
  const ui = UI.useContainer()
  const user = useQuery(['users', id, token], getUser)
  return (
    <div className={styles.status}>
      <h1>
        Status
        <span onClick={() => ui.clearModal()}>
          <FontAwesomeIcon icon={faTimesCircle} />
        </span>
      </h1>
      <div className={styles.statusButtons}>
        <Button
          type='button'
          className={styles.online}
          onClick={() => id && token && updateStatus(id, State.online, token)}
        >
          <FontAwesomeIcon icon={faCircle} />
        </Button>
        <Button
          type='button'
          className={styles.idle}
          onClick={() => id && token && updateStatus(id, State.idle, token)}
        >
          <FontAwesomeIcon icon={faMoon} />
        </Button>
        <Button
          type='button'
          className={styles.dnd}
          onClick={() => id && token && updateStatus(id, State.dnd, token)}
        >
          <FontAwesomeIcon icon={faStopCircle} />
        </Button>
        <Button
          type='button'
          className={styles.invisible}
          onClick={() => id && token && updateStatus(id, State.offline, token)}
        >
          <FontAwesomeIcon icon={faSignOut} />
        </Button>
      </div>
      <div>
        {/* save once its not erroring */}
        <Formik
          initialValues={{
            status: user.data?.status ?? ''
          }}
          validate={({ status }) => {
            const errors: { status?: string } = {}
            if (status.length >= 140)
              errors.status = 'A valid status is required'
            return errors
          }}
          onSubmit={async ({ status }, { setSubmitting }) => {
            try {
              await clientGateway.patch(
                `/users/${id}`,
                new URLSearchParams({
                  status
                }),
                {
                  headers: {
                    authorization: token
                  }
                }
              )
              queryCache.invalidateQueries(['users', id])
            } finally {
              setSubmitting(false)
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className={styles.form}>
              <Field
                component={Input}
                name='status'
                placeholder='What are you up to?'
              />
              <ErrorMessage component='p' name='status' />
              <Button type='submit' disabled={isSubmitting}>
                {isSubmitting ? <BarLoader color='#ffffff' /> : 'Update Status'}
              </Button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  )
}

export default Status

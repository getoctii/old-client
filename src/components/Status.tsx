import {
  faCircle,
  faMoon,
  faSignOut,
  faStopCircle,
  faTimesCircle
} from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FC } from 'react'
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
import * as Yup from 'yup'

import { useHistory } from 'react-router-dom'
import { Plugins } from '@capacitor/core'

const updateStatus = async (id: string, state: State, token: string) => {
  await clientGateway.patch(
    `/users/${id}`,
    { state },
    {
      headers: {
        authorization: token
      }
    }
  )
  await queryCache.refetchQueries(['users', id, token])
}

const StatusSchema = Yup.object().shape({
  status: Yup.string()
    .min(2, 'Too short, must be at least 2 characters.')
    .max(140, 'Too long, must be less then 140 characters.')
})

const Status: FC<{ isClosable?: boolean }> = ({ isClosable = true }) => {
  const auth = Auth.useContainer()
  const history = useHistory()

  const { id, token } = Auth.useContainer()
  const ui = UI.useContainer()
  const user = useQuery(['users', id, token], getUser)
  return (
    <div className={styles.status}>
      <h1>
        Status
        {isClosable ? (
          <span onClick={() => ui.clearModal()}>
            <FontAwesomeIcon icon={faTimesCircle} />
          </span>
        ) : (
          <></>
        )}
      </h1>
      <div className={styles.statusButtons}>
        <Button
          type='button'
          className={`${styles.online} ${
            user.data?.state == State.online ? styles.active : null
          }`}
          onClick={() => id && token && updateStatus(id, State.online, token)}
        >
          <FontAwesomeIcon icon={faCircle} />
        </Button>
        <Button
          type='button'
          className={`${styles.idle} ${
            user.data?.state == State.idle ? styles.active : null
          }`}
          onClick={() => id && token && updateStatus(id, State.idle, token)}
        >
          <FontAwesomeIcon icon={faMoon} />
        </Button>
        <Button
          type='button'
          className={`${styles.dnd} ${
            user.data?.state == State.dnd ? styles.active : null
          }`}
          onClick={() => id && token && updateStatus(id, State.dnd, token)}
        >
          <FontAwesomeIcon icon={faStopCircle} />
        </Button>
        <Button
          type='button'
          className={`${styles.offline} ${
            user.data?.state == State.offline ? styles.active : null
          }`}
          onClick={() => id && token && updateStatus(id, State.offline, token)}
        >
          <FontAwesomeIcon icon={faSignOut} />
        </Button>
      </div>
      <div>
        <Formik
          initialValues={{
            status: user.data?.status ?? ''
          }}
          validationSchema={StatusSchema}
          onSubmit={async ({ status }, { setSubmitting }) => {
            try {
              await clientGateway.patch(
                `/users/${id}`,
                {
                  status
                },
                {
                  headers: {
                    authorization: token
                  }
                }
              )
              await queryCache.invalidateQueries(['users', id])
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

              {/* <div
                className={styles.logout}
                onClick={async () => {
                  auth.setToken(null)
                  await queryCache.invalidateQueries()
                  await Plugins.Storage.clear()
                  history.push('/authenticate/login')
                }}
              >
                Logout
              </div> */}
            </Form>
          )}
        </Formik>
      </div>
    </div>
  )
}

export default Status

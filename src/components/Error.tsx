import React from 'react'
import styles from './Error.module.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLock, faPoo } from '@fortawesome/pro-solid-svg-icons'
import Button from './Button'
import { AxiosError } from 'axios'
import { Plugins } from '@capacitor/core'
import { queryCache } from 'react-query'

const Error = ({
  resetErrorBoundary,
  error
}: {
  resetErrorBoundary: () => void
  error: AxiosError
}) => {
  const isInvalidAuth =
    error?.isAxiosError &&
    error.response?.status === 403 &&
    error.response?.data.errors?.includes('InvalidAuthorization')
  if (isInvalidAuth) {
    return (
      <div className={styles.error}>
        <FontAwesomeIcon icon={faLock} size='4x' />
        <h1>Whoops, looks like this is an invalid login.</h1>
        <p>You can simply click, logout to go back the sign up page!</p>
        <Button
          type='button'
          onClick={async () => {
            await Plugins.Storage.clear()
            await queryCache.invalidateQueries()
            window.location.pathname = '/authenticate/login'
          }}
        >
          Logout
        </Button>
      </div>
    )
  }
  return (
    <div className={styles.error}>
      <FontAwesomeIcon icon={faPoo} size='4x' />
      <h1>
        {error?.isAxiosError
          ? error.response?.status ||
            (error.message === 'Network Error' ? 'Gateway Down!' : 'Beep Boop!')
          : 'Beep Boop!'}
      </h1>
      <p>Beep Boooop Beeep Beeep Booooop Beep Boop Bep</p>
      <Button type='button' onClick={() => resetErrorBoundary()}>
        Try again
      </Button>
    </div>
  )
}

export default Error

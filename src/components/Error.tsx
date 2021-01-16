import React from 'react'
import styles from './Error.module.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLock, faPoo } from '@fortawesome/pro-solid-svg-icons'
import Button from './Button'
import { Plugins } from '@capacitor/core'
import { queryCache } from 'react-query'
import { AxiosError } from 'axios'

const Error = ({
  error,
  resetErrorBoundary
}: {
  error: AxiosError
  resetErrorBoundary: () => void
}) => {
  const isInvaildAuth =
    error?.isAxiosError &&
    error.response?.status === 403 &&
    error.response?.data.errors?.includes('InvalidAuthorization')
  if (isInvaildAuth) {
    return (
      <div className={styles.error}>
        <FontAwesomeIcon icon={faLock} size='4x' />
        <h1>Woops, looks like this is an invalid login.</h1>
        <p>You can simply click, logout to go back the sign up page!</p>
        <Button
          type='button'
          onClick={async () => {
            await Plugins.Storage.clear()
            queryCache.invalidateQueries()
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
      <h1>{error?.isAxiosError ? error.response?.status : 'Beep Boop!'}</h1>
      <p>Beep Boooop Beeep Beeep Booooop Beep Boop Bep</p>
      <Button type='button' onClick={() => resetErrorBoundary()}>
        Try again
      </Button>
    </div>
  )
}

export default Error

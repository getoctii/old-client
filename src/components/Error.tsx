import React from 'react'
import styles from './Error.module.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPoo } from '@fortawesome/pro-solid-svg-icons'
import Button from './Button'

const Error = ({ resetErrorBoundary }: { resetErrorBoundary: () => void }) => {
  return (
    <div className={styles.error}>
      <FontAwesomeIcon icon={faPoo} size='4x' />
      <h1>Beep Boop!</h1>
      <p>Beep Boooop Beeep Beeep Booooop Beep Boop Bep</p>
      <Button type='button' onClick={() => resetErrorBoundary()}>
        Try again
      </Button>
    </div>
  )
}

export default Error

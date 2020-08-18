import React from 'react'
import styles from './Error.module.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPoo } from '@fortawesome/pro-solid-svg-icons'
import Button from './Button'

const Error = ({ resetErrorBoundary }: { resetErrorBoundary: () => void }) => {
  return (
    <div className={styles.error}>
      <FontAwesomeIcon icon={faPoo} size='4x'/>
      <h1>OOPSIE WOOPSIE!!</h1>
      <p>Uwu We made a hecky wecky!! A wittle hecko boingo! The code monkeys at our headquarters are working VEWY HAWD
        to fix this!.</p>
      <Button type='button' onClick={() => resetErrorBoundary()}>Try again</Button>
    </div>
  )
}

export default Error

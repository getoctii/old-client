import {
  faCircle,
  faMoon,
  faSignOut,
  faStopCircle,
  faTimesCircle
} from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { queryCache } from 'react-query'
import { Auth } from '../authentication/state'
import { clientGateway } from '../constants'
import { UI } from '../state/ui'
import { State } from '../user/remote'
import Button from './Button'
import styles from './Status.module.scss'

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
  return (
    <div className={styles.status}>
      <h1>
        Status
        <span onClick={() => ui.setModal('')}>
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
      <div></div>
    </div>
  )
}

export default Status

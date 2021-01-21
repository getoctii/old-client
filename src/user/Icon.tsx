import React from 'react'
import styles from './Icon.module.scss'
import { State } from './remote'

const Icon = ({ avatar, state }: { avatar?: string, state?: State }) => {
  return (
    <div
      className={styles.icon}
      style={{ backgroundImage: `url('${avatar}')` }}
    >
      {state && (
        <div
          className={`${styles.badge} ${
            state === State.online
              ? styles.online
              : state === State.dnd
              ? styles.dnd
              : state === State.idle
                ? styles.idle
                : state === State.offline
                  ? styles.offline
                  : ''
          }`}
        />
      )}
    </div>
  )
}

export default Icon

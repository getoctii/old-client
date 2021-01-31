import { motion } from 'framer-motion'
import React from 'react'
import styles from './Icon.module.scss'
import { State } from './remote'

const Icon = ({ avatar, state }: { avatar?: string; state?: State }) => {
  return (
    <motion.div
      className={styles.icon}
      initial={{
        opacity: 0
      }}
      animate={{
        opacity: 1,
        transition: { y: { stiffness: 1000, velocity: -100 } }
      }}
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
    </motion.div>
  )
}

export default Icon

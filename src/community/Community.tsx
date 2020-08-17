import React from 'react'
import styles from './Community.module.scss'
import Chat from './chat/Chat'

export const Community = () => {
  return (
    <div className={styles.community}>
      <Chat channelID='25ccd9c7-8db6-4e56-85c2-af5028fbbec2'/>
    </div>
  )
}

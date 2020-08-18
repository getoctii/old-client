import React from 'react'
import styles from './Message.module.scss'

const Message = ({ children, avatar, timestamp, author }: { children: React.ReactNode, avatar: string, timestamp: string, author: string }) => {
  return (
    <div className={styles.message}>
      <img className={styles.avatar} src={avatar} alt={`${author}'s Profile`}/>
      <div className={styles.content}>
        {/* Cleanup date parsing. */}
        <h2>{author}<span>{new Date(timestamp.replace(' ', 'T') + 'Z').toTimeString()}</span></h2>
        <p>{children}</p>
      </div>
    </div>
  )
}

export default Message
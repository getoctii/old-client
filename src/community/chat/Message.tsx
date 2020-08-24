import React from 'react'
import styles from './Message.module.scss'
import moment from 'moment'
import ReactMarkdown from 'react-markdown'

const Message = ({
  children,
  avatar,
  timestamp,
  author,
  primary
}: {
  children: string
  avatar: string
  timestamp: string
  author: string
  primary: boolean
}) => {
  return (
    <div className={primary ? styles.primary : styles.message}>
      {primary && (
        <img
          className={styles.avatar}
          src={avatar}
          alt={`${author}'s Profile`}
        />
      )}
      <div className={`${styles.content} ${!primary ? styles.spacer : ''}`}>
        {primary && (
          <h2>
            {author}
            <span>{moment.utc(timestamp).local().calendar()}</span>
          </h2>
        )}
        <ReactMarkdown
          skipHtml={false}
          escapeHtml={true}
          unwrapDisallowed={true}
          allowedTypes={[
            'root',
            'text',
            'paragraph',
            'strong',
            'emphasis',
            'delete',
            'link'
          ]}
          source={children}
        />
      </div>
    </div>
  )
}

export default Message

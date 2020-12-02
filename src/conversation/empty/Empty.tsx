import React from 'react'
import NewConversation from '../NewConversation'
import styles from './Empty.module.scss'

const Empty = () => {
  return (
    <div className={styles.container}>
      <div>
        <h1>Messages</h1>
        <p>Use the search bar to start new chats with friends!</p>
        <NewConversation />
      </div>

      <iframe
        className={styles.video}
        title='sgn'
        width='966'
        height='543'
        src='https://www.youtube.com/embed/QHdZjxrG35U'
        frameBorder={0}
        allow='autoplay; encrypted-media'
        allowFullScreen={false}
      />
    </div>
  )
}

export default Empty

import React from 'react'
import styles from './Friends.module.scss'
import FriendCard from './FriendCard'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/pro-solid-svg-icons'

const Friends = () => {
  return (
    <div className={styles.container}>
      <h1>
        Yellow Pages
        <FontAwesomeIcon className={styles.plus} icon={faPlus} />
      </h1>
      <h3>Pending</h3>
      <div>
        <FriendCard id='fd9fbc66-0c22-4718-9828-6a951529f332' pending={true} />
      </div>
      <br />
      <h3>Friends</h3>
      <div>
        <FriendCard id='fd9fbc66-0c22-4718-9828-6a951529f332' pending={false} />
        <FriendCard id='fd9fbc66-0c22-4718-9828-6a951529f332' pending={false} />
        <FriendCard id='fd9fbc66-0c22-4718-9828-6a951529f332' pending={false} />
        <FriendCard id='fd9fbc66-0c22-4718-9828-6a951529f332' pending={false} />
        <FriendCard id='fd9fbc66-0c22-4718-9828-6a951529f332' pending={false} />
        <FriendCard id='fd9fbc66-0c22-4718-9828-6a951529f332' pending={false} />
        <FriendCard id='fd9fbc66-0c22-4718-9828-6a951529f332' pending={false} />
      </div>
    </div>
  )
}

export default Friends

import { faBedAlt } from '@fortawesome/pro-duotone-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import AddFriend from './AddFriend'
import styles from './EmptyFriends.module.scss'

const EmptyFriends = () => {
  return (
    <div className={styles.emptyFriends}>
      <div className={styles.container}>
        <FontAwesomeIcon icon={faBedAlt} size='4x' />
        <h1>Looks like you got no friends!</h1>
        <p>Use the search bar to add a new friend!</p>
        <AddFriend />
      </div>
    </div>
  )
}

export default EmptyFriends

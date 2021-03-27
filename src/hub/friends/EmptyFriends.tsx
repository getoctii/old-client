import React from 'react'
import Button from '../../components/Button'
import { UI } from '../../state/ui'
import { ModalTypes } from '../../utils/constants'
import styles from './EmptyFriends.module.scss'

const EmptyFriends = () => {
  const ui = UI.useContainer()
  return (
    <div className={styles.emptyFriends}>
      <div className={styles.container}>
        <h1>Looks like you got no friends!</h1>
        <p>
          You can add some new friends from contacts, username, or our discovery
          tool.
        </p>
        <Button
          type='button'
          onClick={() => ui.setModal({ name: ModalTypes.ADD_FRIEND })}
        >
          Add new friends
        </Button>
      </div>
    </div>
  )
}

export default EmptyFriends

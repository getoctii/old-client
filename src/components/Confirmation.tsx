import React from 'react'
import Modal from './Modal'
import styles from './Confirmation.module.scss'
import Button from './Button'

export const Confirmation = ({
  onConfirm,
  onDismiss
}: {
  onConfirm: Function
  onDismiss: Function
}) => {
  return (
    <Modal onDismiss={() => onDismiss()}>
      <div className={styles.confirmation}>
        <h3>Are you sure you want to delete the channel?</h3>
        <p>
          One you do this, you cannot retrive the channel and it's messages so
          beware.
        </p>
        <div>
          <Button
            type='button'
            className={styles.danger}
            onClick={() => onConfirm()}
          >
            Delete
          </Button>
          <div className={styles.seperater} />
          <Button
            type='button'
            className={styles.cancel}
            onClick={() => onDismiss()}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  )
}

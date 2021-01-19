import React from 'react'
import Modal from './Modal'
import styles from './Confirmation.module.scss'
import Button from './Button'

export const Confirmation = ({
  type,
  onConfirm,
  onDismiss
}: {
  type: 'channel' | 'message'
  onConfirm: Function
  onDismiss: Function
}) => {
  return (
    <Modal onDismiss={() => onDismiss()}>
      <div className={styles.confirmation}>
        <h3>
          Are you sure you want to delete this{' '}
          {type === 'channel' ? 'channel' : 'message'}?
        </h3>
        <p>
          {type === 'channel'
            ? "One you do this, you cannot retrieve the channel and it's messages so beware."
            : 'One you do this, you cannot retrieve this message again so beware.'}
        </p>
        <div>
          <Button
            type='button'
            className={styles.danger}
            onClick={() => onConfirm()}
          >
            Delete
          </Button>
          <div className={styles.separator} />
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

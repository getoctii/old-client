import React from 'react'
import styles from './Confirmation.module.scss'
import Button from './Button'
import { UI } from '../state/ui'

export const Confirmation = ({
  type,
  onConfirm
}: {
  type: 'channel' | 'message'
  onConfirm: () => Promise<void> | void
}) => {
  const ui = UI.useContainer()
  return (
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
          onClick={async () => await onConfirm()}
        >
          Delete
        </Button>
        <div className={styles.separator} />
        <Button
          type='button'
          className={styles.cancel}
          onClick={() => ui.clearModal()}
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}

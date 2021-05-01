import { FC } from 'react'
import styles from './Confirmation.module.scss'
import Button from './Button'
import { UI } from '../state/ui'

export enum ConfirmationType {
  TEXT = 'channel',
  CATEGORY = 'category',
  MESSAGE = 'message',
  DEVELOPER = 'developer'
}
export const Confirmation: FC<{
  type: ConfirmationType
  onConfirm: () => Promise<void> | void
}> = ({ type, onConfirm }) => {
  const ui = UI.useContainer()
  return (
    <div className={styles.confirmation}>
      <h3>
        {type === ConfirmationType.DEVELOPER
          ? 'Are you sure you want to enable developer mode???????!?'
          : `Are you sure you want to delete this ${type}?`}
      </h3>
      <p>
        {type === ConfirmationType.TEXT
          ? "One you do this, you cannot retrieve the channel and it's messages so beware."
          : type === ConfirmationType.CATEGORY
          ? 'One you do this, the category is gone forever so beware.'
          : type === ConfirmationType.MESSAGE
          ? 'One you do this, you cannot retrieve this message again so beware.'
          : type === ConfirmationType.DEVELOPER
          ? 'YOU CANNOT DISABLE DEVELOPER MODE. PROCCED WITH CAUTION!!!'
          : 'One you do this, you cannot undo it.'}
      </p>
      <div>
        <Button
          type='button'
          className={styles.danger}
          onClick={async () => await onConfirm()}
        >
          {type === ConfirmationType.DEVELOPER ? 'sell my soul' : 'Delete'}
        </Button>
        <div className={styles.separator} />
        <Button
          type='button'
          className={styles.cancel}
          onClick={() => ui.clearModal()}
        >
          {type === ConfirmationType.DEVELOPER ? 'oh s***, nvm' : 'Cancel'}
        </Button>
      </div>
    </div>
  )
}

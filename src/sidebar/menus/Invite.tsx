import React from 'react'
import styles from './Invite.module.scss'
import Modal from '../../components/Modal'
import Input from '../../components/Input'
import Button from '../../components/Button'

const Invite = ({ onDismiss }: { onDismiss?: any }) => {
  return (
    <Modal onDismiss={onDismiss}>
      <div className={styles.invite}>
        <h3>Start a Conversation</h3>
        <div>
          <label htmlFor={'username'} className={styles.inputName}>Username</label>
          <div>
            <Input name='username' type='text' placeholder='user#1234' />
            <Button>Start Chatting</Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default Invite

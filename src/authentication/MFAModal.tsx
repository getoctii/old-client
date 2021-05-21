import { faLock } from '@fortawesome/pro-solid-svg-icons'
import { FC } from 'react'
import Button from '../components/Button'
import { Plugins } from '@capacitor/core'
import Modal from '../components/Modal'
import QRCode from 'qrcode.react'
import styles from './MFAModal.module.scss'

const MFAModal: FC<{ url: string; TOTPKey: string }> = ({ url, TOTPKey }) => {
  return (
    <Modal
      title='2FA Enabled'
      icon={faLock}
      onDismiss={() => {}}
      bottom={
        <Button
          type='button'
          onClick={async () => {
            await Plugins.Clipboard.write({
              string: TOTPKey
            })
          }}
          className={styles.button}
        >
          Copy Key
        </Button>
      }
    >
      <div className={styles.codeWrapper}>
        <QRCode value={url} className={styles.code} />
        <p>Be sure to backup your 2fa key</p>
      </div>
    </Modal>
  )
}

export default MFAModal

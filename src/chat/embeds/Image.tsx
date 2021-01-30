import { faTimesCircle } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState } from 'react'
import Modal from '../../components/Modal'
import { UI } from '../../state/ui'
import { ModalTypes } from '../../utils/constants'
import styles from './Image.module.scss'

const isCovfefe = (url: string) =>
  /^https:\/\/file\.coffee\/u\/[a-zA-Z0-9_-]{7,14}\.(png|jpeg|jpg|gif)/g.test(
    url
  )

const ImagePreview = ({ url }: { url: string }) => {
  const ui = UI.useContainer()
  return (
    <Modal onDismiss={() => ui.clearModal()}>
      <div className={styles.imagePreview}>
        <div className={styles.header}>
          <h5>
            <a target='_blank' rel='noopener noreferrer' href={url}>
              {url.replace('https://', '')}
            </a>
          </h5>
          <FontAwesomeIcon
            icon={faTimesCircle}
            size='lg'
            onClick={() => ui.clearModal()}
          />
        </div>
        <div className={styles.image}>
          <img alt={url} src={url} loading='lazy' />
        </div>
      </div>
    </Modal>
  )
}

const ImageEmbed = ({ url }: { url: string }) => {
  const matches = url.match(
    /^https:\/\/file\.coffee\/u\/[a-zA-Z0-9_-]{7,14}\.(png|jpeg|jpg|gif)$/g
  )
  const ui = UI.useContainer()
  const [showPlaceholder, setShowPlaceholder] = useState(true)
  return matches && matches[0] ? (
    <div
      className={styles.imageEmbed}
      onClick={() => {
        ui.setModal({
          name: ModalTypes.PREVIEW_IMAGE,
          props: { url: matches[0] }
        })
      }}
    >
      {showPlaceholder && <div className={styles.imagePlaceholder} />}

      <img
        onLoad={() => setShowPlaceholder(false)}
        onError={() => setShowPlaceholder(false)}
        alt={url}
        src={matches[0]}
      />
    </div>
  ) : (
    <></>
  )
}

const Image = {
  Embed: ImageEmbed,
  Preview: ImagePreview,
  isCovfefe
}

export default Image

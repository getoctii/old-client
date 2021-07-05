import { faFileAlt } from '@fortawesome/pro-duotone-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import axios from 'axios'
import { FC } from 'react'
import { useState } from 'react'
import { useQuery } from 'react-query'
import Button from '../../components/Button'
import { UI } from '../../state/ui'
import { ModalTypes } from '../../utils/constants'
import Audio from './Audio'
import styles from './File.module.scss'

const isFile = (url: string) =>
  /^https:\/\/cdn\.octii\.chat\/uploads\/[A-Za-z0-9_-]+/g.test(url)

const FilePreview: FC<{ url: string }> = ({ url }) => {
  return (
    <img alt={url} src={url} loading='lazy' className={styles.imagePreview} />
  )
}

const FileEmbed: FC<{ url: string }> = ({ url }: { url: string }) => {
  const ui = UI.useContainer()
  const [showPlaceholder, setShowPlaceholder] = useState(true)
  const { data: type } = useQuery(
    ['file', url],
    async () => (await axios.head(url)).headers['content-type']
  )
  if (
    [
      'image/apng',
      'image/avif',
      'image/gif',
      'image/jpeg',
      'image/png',
      'image/webp'
    ].includes(type)
  ) {
    return (
      <div
        className={styles.imageEmbed}
        onClick={() => {
          ui.setModal({
            name: ModalTypes.PREVIEW_IMAGE,
            rounded: false,
            props: { url }
          })
        }}
      >
        {showPlaceholder && <div className={styles.imagePlaceholder} />}

        <img
          className={showPlaceholder ? styles.hide : ''}
          onLoad={() => setShowPlaceholder(false)}
          onError={() => setShowPlaceholder(false)}
          style={{
            maxWidth: 600,
            maxHeight: 300
          }}
          alt={url}
          src={url}
        />
      </div>
    )
  } else if (
    [
      'audio/wave',
      'audio/wav',
      'audio/x-wav',
      'audio/x-pn-wav',
      'audio/webm',
      'audio/mpeg',
      'audio/x-aiff'
    ].includes(type)
  ) {
    return <Audio.Embed url={url} />
  } else {
    return (
      <div className={styles.file}>
        <FontAwesomeIcon icon={faFileAlt} />
        <div className={styles.info}>
          <small>File</small>
          <p>{type}</p>
        </div>
        <Button type='button' onClick={() => window.open(url)}>
          Open
        </Button>
      </div>
    )
  }
}

const File = {
  Embed: FileEmbed,
  Preview: FilePreview,
  isFile
}

export default File

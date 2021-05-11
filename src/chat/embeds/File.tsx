import { faFileAlt } from '@fortawesome/pro-duotone-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import axios from 'axios'
import { FC } from 'react'
import { useState } from 'react'
import { useQuery } from 'react-query'
import Button from '../../components/Button'
import { UI } from '../../state/ui'
import { ModalTypes } from '../../utils/constants'
import styles from './File.module.scss'

const isFile = (url: string) =>
  /^https:\/\/innstor\.innatical\.com\/[A-Za-z0-9_-]+/g.test(url)

const FilePreview: FC<{ url: string }> = ({ url }) => {
  return (
    <img alt={url} src={url} loading='lazy' className={styles.imagePreview} />
  )
}

const FileEmbed: FC<{ url: string }> = ({ url }: { url: string }) => {
  const { data: image } = useQuery(
    ['image', url],
    async () => {
      return (
        await axios.get<{
          type: string
          mime: string
          data?: { width: number; height: number }
        }>(`${url}/info`)
      ).data
    },
    {
      enabled: isFile(url)
    }
  )
  const ui = UI.useContainer()
  const [showPlaceholder, setShowPlaceholder] = useState(true)
  if (!image) return <></>
  if (image.type === 'other') {
    return (
      <div className={styles.file}>
        <FontAwesomeIcon icon={faFileAlt} />
        <div className={styles.info}>
          <small>File</small>
          <p>{image?.mime.split('/')[1]}</p>
        </div>
        <Button type='button' onClick={() => window.open(url)}>
          Open in Browser
        </Button>
      </div>
    )
  }
  if (image.type === 'image') {
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
        {showPlaceholder && (
          <div
            style={{
              width: (image.data?.width ?? 600) > 600 ? 600 : image.data?.width,
              height:
                (image.data?.height ?? 300) > 300 ? 300 : image.data?.height
            }}
            className={styles.imagePlaceholder}
          />
        )}

        <img
          onLoad={() => setShowPlaceholder(false)}
          onError={() => setShowPlaceholder(false)}
          width={(image.data?.width ?? 600) > 600 ? 600 : image.data?.width}
          height={(image.data?.height ?? 300) > 300 ? 300 : image.data?.height}
          alt={url}
          src={url}
        />
      </div>
    )
  }

  return <div></div>
}

const File = {
  Embed: FileEmbed,
  Preview: FilePreview,
  isFile
}

export default File

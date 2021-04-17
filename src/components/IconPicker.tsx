import React, { useRef, useState } from 'react'
import styles from './IconPicker.module.scss'
import Button from './Button'
import { MoonLoader } from 'react-spinners'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileUpload } from '@fortawesome/pro-solid-svg-icons'
import axios from 'axios'
import { faPoop } from '@fortawesome/pro-duotone-svg-icons'

const IconPicker = ({
  alt,
  defaultIcon,
  onUpload,
  className,
  forcedSmall,
  recommendedIcon
}: {
  alt: string
  defaultIcon?: string
  onUpload: (url: string) => Promise<void> | void
  className?: string
  forcedSmall?: boolean
  recommendedIcon?: string
}) => {
  const input = useRef<HTMLInputElement | null>(null)
  const [icon, setIcon] = useState<string | undefined>(defaultIcon || undefined)
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [error, setError] = useState<boolean>(false)
  return (
    <div
      className={`${styles.icon} ${className ?? ''} ${
        forcedSmall ? styles.small : ''
      }`}
    >
      {icon && <img src={icon} alt={alt} />}
      <div className={styles.details}>
        <p>
          {recommendedIcon
            ? recommendedIcon
            : 'Recommended icon size is 100x100'}
        </p>
        <h6>Max image size is 50mb</h6>
      </div>
      <Button
        type='button'
        onClick={() => input.current?.click()}
        disabled={isUploading}
      >
        {isUploading ? (
          <MoonLoader />
        ) : error ? (
          <FontAwesomeIcon icon={faPoop} />
        ) : (
          <FontAwesomeIcon icon={faFileUpload} />
        )}
      </Button>
      <input
        ref={input}
        type='file'
        accept='.jpg, .png, .jpeg, .gif'
        onChange={async (event) => {
          setIsUploading(true)
          if (
            !event.target.files ||
            event.target.files.length <= 0 ||
            event.target.files.length > 1
          )
            return setError(true)
          const image = event.target.files.item(0)
          if (!image) return setError(true)
          const formData = new FormData()
          formData.append('file', image)
          try {
            const response = await axios.post<{ file: string }>(
              'https://innstor.innatical.com',
              formData
            )
            setIsUploading(false)
            setIcon(`https://innstor.innatical.com/${response.data?.file}`)
            await onUpload(
              `https://innstor.innatical.com/${response.data?.file}`
            )
          } catch (error) {
            setError(true)
          }
        }}
      />
    </div>
  )
}

export default IconPicker

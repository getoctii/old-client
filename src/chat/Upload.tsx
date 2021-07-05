import { faFileUpload, faSpinner } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FC, useEffect, useState } from 'react'
import styles from './Upload.module.scss'

interface UploadDetails {
  status: 'uploading' | 'uploaded' | 'pending'
  file: File
  onUpload: (file: File) => void
}

const Upload: FC<UploadDetails> = ({ status, file, onUpload }) => {
  const [uploadURL, setUploadURL] = useState<string | ArrayBuffer | null>(null)
  useEffect(() => {
    const loadFile = new FileReader()
    loadFile.onloadend = () => {
      setUploadURL(loadFile.result)
    }
    loadFile.readAsDataURL(file)
  })
  return (
    <div className={styles.upload}>
      {uploadURL &&
        typeof uploadURL === 'string' &&
        [
          'image/apng',
          'image/avif',
          'image/gif',
          'image/jpeg',
          'image/png',
          'image/webp'
        ].includes(file.type) && <img src={uploadURL} alt={file.name} />}
      <div className={styles.uploadInfo}>
        <div className={styles.nameWrapper}>
          <h5>{file.name}</h5>
        </div>
        <button
          onClick={() => onUpload(file)}
          disabled={status === 'uploading'}
        >
          {status === 'uploading' ? (
            <FontAwesomeIcon icon={faSpinner} spin />
          ) : (
            <FontAwesomeIcon icon={faFileUpload} />
          )}
        </button>
      </div>
    </div>
  )
}

export default Upload

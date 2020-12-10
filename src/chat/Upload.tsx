import { faFileUpload, faSpinner } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useCallback, useEffect, useState } from 'react'
import { BeatLoader } from 'react-spinners'
import styles from './Upload.module.scss'

interface UploadDetails {
  status: 'uploading' | 'uploaded' | 'pending'
  file: File
  onUpload: (file: File) => void
}

const Upload = ({ status, file, onUpload }: UploadDetails) => {
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
      {uploadURL && typeof uploadURL === 'string' && <img src={uploadURL} />}
      <div className={styles.uploadInfo}>
        <h5>{file.name}</h5>
        <button
          onClick={() => onUpload(file)}
          disabled={status === 'uploading'}
        >
          {status === 'uploading' ? (
            <FontAwesomeIcon icon={faSpinner} spin />
          ) : (
            // uh thats not what i wanted lmao
            <FontAwesomeIcon icon={faFileUpload} />
          )}
        </button>
      </div>
    </div>
  )
}

export default Upload

import { useField } from 'formik'
import { FC } from 'react'
import styles from './TextArea.module.scss'

const TextArea: FC<{ name: string }> = ({ name }) => {
  const [field, meta] = useField(name)

  return (
    <textarea
      id={name}
      name={name}
      className={styles.textarea}
      value={meta.value}
      onChange={field.onChange}
      onBlur={field.onBlur}
      rows={3}
    />
  )
}

export default TextArea

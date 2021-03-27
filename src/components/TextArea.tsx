import { useField } from 'formik'
import styles from './TextArea.module.scss'

const TextArea = ({ name }: { name: string }) => {
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

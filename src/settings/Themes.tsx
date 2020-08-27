import React from 'react'
import { isUsername } from '../authentication/forms/validations'
import styles from './shared.module.scss'
import Theme from '../theme/hook'
import ayu from '../theme/themes/ayu-mirage.json'
import dark from '../theme/themes/default-dark.json'
import light from '../theme/themes/default-light.json'
import purple from '../theme/themes/purple.json'
import mostlyBlack from '../theme/themes/mostly-black.json'
import pureDark from '../theme/themes/pure-dark.json'

type profileFormData = { username: string, avatar: string }

const validateProfile = (values: profileFormData) => {
  const errors: { username?: string, avatar?: string } = {}
  if (!isUsername(values.username)) errors.username = 'A valid username is required'
  return errors
}

type UserResponse = {
  id: string
  avatar: string
  username: string
  discriminator: number
}

const themes = [ayu, dark, light, purple, mostlyBlack, pureDark]

const Themes = () => {
  const { theme, setTheme } = Theme.useContainer()
  return (
    <div className={styles.wrapper}>
      <h2>Themes</h2>
      <br />
      <div className={styles.themes}>
        { themes.map(t => <div onClick={() => setTheme(t)} className={ theme?.id === t.id ? styles.selected : '' }>{ t.name }</div>) }
      </div>
    </div>
  )
}

export default Themes

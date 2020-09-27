import React from 'react'
import styles from './shared.module.scss'
import Theme from '../theme/hook'
import ayu from '../theme/themes/ayu-mirage.json'
import dark from '../theme/themes/default-dark.json'
import light from '../theme/themes/default-light.json'
import purple from '../theme/themes/purple.json'
import mostlyBlack from '../theme/themes/mostly-black.json'
import pureDark from '../theme/themes/pure-dark.json'
import xpTestTheme from '../theme/themes/XpTestTheme.json'
import octiiHub from '../theme/themes/octii-hub.json'

const themes = [
  ayu,
  dark,
  light,
  purple,
  mostlyBlack,
  pureDark,
  xpTestTheme,
  octiiHub
]

const Themes = () => {
  const { theme, setTheme } = Theme.useContainer()
  return (
    <div className={styles.wrapper}>
      <h2>Themes</h2>
      <br />
      <div className={styles.themes}>
        {themes.map((t) => (
          <div
            onClick={() => setTheme(t)}
            className={theme?.id === t.id ? styles.selected : ''}
          >
            {t.name}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Themes

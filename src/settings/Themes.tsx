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
import { faChevronLeft } from '@fortawesome/pro-solid-svg-icons'
import { useMedia } from 'react-use'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

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

const Themes = ({ setPage }: { setPage: Function }) => {
  const { theme, setTheme } = Theme.useContainer()
  const isMobile = useMedia('(max-width: 800px)')
  return (
    <div className={styles.wrapper}>
      <h2 onClick={() => setPage('')}>
        {isMobile && (
          <FontAwesomeIcon className={styles.backButton} icon={faChevronLeft} />
        )}
        Themes
      </h2>
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

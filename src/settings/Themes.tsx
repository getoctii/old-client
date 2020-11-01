import React from 'react'
import styles from './Themes.module.scss'
import Theme, { themes } from '../theme/hook'
import Button from '../components/Button'
import { faChevronLeft } from '@fortawesome/pro-solid-svg-icons'
import { useMedia } from 'react-use'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const Themes = ({ setPage }: { setPage: Function }) => {
  const {
    themeId,
    setThemeId,
    setVariations,
    variations
  } = Theme.useContainer()
  const isMobile = useMedia('(max-width: 800px)')
  return (
    <div className={styles.themes}>
      <h2 onClick={() => setPage('')}>
        {isMobile && (
          <FontAwesomeIcon className={styles.backButton} icon={faChevronLeft} />
        )}
        Themes
      </h2>
      <h4>Variations</h4>
      <div className={styles.variations}>
        <Button
          type='button'
          onClick={() => setVariations('light')}
          className={variations === 'light' ? styles.selected : ''}
        >
          Light
        </Button>
        <Button
          type='button'
          onClick={() => setVariations('dark')}
          className={variations === 'dark' ? styles.selected : ''}
        >
          Dark
        </Button>
        <Button
          type='button'
          onClick={() => setVariations('system')}
          className={variations === 'system' ? styles.selected : ''}
        >
          System
        </Button>
      </div>
      <h4>Color Themes</h4>
      <div className={styles.colors}>
        {themes.map((t) => (
          <div
            onClick={() => setThemeId(t.id)}
            className={`${styles.theme} ${
              themeId === t.id ? styles.selected : ''
            }`}
          >
            {t.name}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Themes

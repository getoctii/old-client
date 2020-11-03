import React from 'react'
import styles from './Themes.module.scss'
import Theme, { themes } from '../theme/hook'
import Button from '../components/Button'
import { faChevronLeft } from '@fortawesome/pro-solid-svg-icons'
import { useMedia } from 'react-use'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useHistory } from 'react-router-dom'

const Themes = () => {
  const {
    themeId,
    setThemeId,
    setVariations,
    variations
  } = Theme.useContainer()
  const isMobile = useMedia('(max-width: 940px)')
  const history = useHistory()
  return (
    <div className={styles.themes}>
      <h2>
        {isMobile && (
          <div
            className={styles.icon}
            onClick={() => isMobile && history.push('/settings')}
          >
            <FontAwesomeIcon
              className={styles.backButton}
              icon={faChevronLeft}
            />
          </div>
        )}
        Themes
      </h2>
      <div className={styles.options}>
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
          {themes.map((t, index) => (
            <>
              {index !== 0 && <hr />}
              <div
                onClick={() => setThemeId(t.id)}
                className={`${styles.theme} ${
                  themeId === t.id ? styles.selected : ''
                }`}
              >
                {t.name}
              </div>
            </>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Themes

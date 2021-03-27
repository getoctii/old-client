import styles from './Themes.module.scss'
import Theme, { themes } from '../theme/hook'
import Button from '../components/Button'
import { faChevronLeft } from '@fortawesome/pro-solid-svg-icons'
import { useMedia } from 'react-use'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useHistory } from 'react-router-dom'
import { Fragment, Suspense } from 'react'
import Integerations from '../integrations/state'

const CustomTheme = ({ id, name }: { id: string; name: string }) => {
  const { themeID, setThemeID } = Theme.useContainer()
  return (
    <div
      onClick={() => setThemeID(id)}
      className={`${styles.theme} ${themeID === id ? styles.selected : ''}`}
    >
      {name}
    </div>
  )
}

const Themes = () => {
  const {
    themeID,
    setThemeID,
    setVariations,
    variations
  } = Theme.useContainer()
  const isMobile = useMedia('(max-width: 740px)')
  const history = useHistory()
  const integerations = Integerations.useContainer()

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
        <h4>Default Color Themes</h4>
        <div className={styles.colors}>
          {themes.map((t, index) => (
            <Fragment key={t.id}>
              {index !== 0 && <hr />}
              <div
                onClick={() => setThemeID(t.id)}
                className={`${styles.theme} ${
                  themeID === t.id ? styles.selected : ''
                }`}
              >
                {t.name}
              </div>
            </Fragment>
          ))}
        </div>

        <h4 className={styles.customColors}>Custom Color Themes</h4>
        <div className={styles.colors}>
          {integerations.payloads
            ?.flatMap((payload) => payload.themes ?? [])
            .map((theme, index) => (
              <Fragment key={theme.id}>
                {index !== 0 && <hr />}
                <Suspense fallback={<></>}>
                  <CustomTheme id={theme.id} name={theme.name} />
                </Suspense>
              </Fragment>
            ))}
        </div>
      </div>
    </div>
  )
}

export default Themes

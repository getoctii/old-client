import styles from './Header.module.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { useMedia } from 'react-use'
import { faChevronLeft } from '@fortawesome/pro-solid-svg-icons'

const Header = ({
  subheading,
  heading,
  onClick,
  color,
  icon
}: {
  subheading: string
  heading: string
  onClick?: () => void
  color?: 'primary' | 'secondary'
  icon: IconDefinition
}) => {
  const isMobile = useMedia('(max-width: 740px)')
  return (
    <div className={styles.header}>
      <div
        className={`${styles.icon} ${
          color === 'secondary' ? styles.secondary : styles.primary
        } ${onClick ? styles.clickable : ''}`}
        onClick={() => onClick && onClick()}
      >
        <FontAwesomeIcon
          className={styles.backButton}
          icon={isMobile ? faChevronLeft : icon}
        />
      </div>
      <div className={styles.title}>
        {subheading && <small>{subheading}</small>}
        <h2>{heading}</h2>
      </div>
    </div>
  )
}

export default Header

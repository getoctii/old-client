import styles from './Header.module.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { IconProp } from '@fortawesome/fontawesome-svg-core'

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
  icon: IconProp
}) => {
  return (
    <div className={styles.header}>
      <div
        className={`${styles.icon} ${
          color === 'secondary' ? styles.secondary : styles.primary
        } ${onClick ? styles.clickable : ''}`}
        onClick={() => onClick && onClick()}
      >
        <FontAwesomeIcon className={styles.backButton} icon={icon} />
      </div>
      <div className={styles.title}>
        {subheading && <small>{subheading}</small>}
        <h2>{heading}</h2>
      </div>
    </div>
  )
}

export default Header

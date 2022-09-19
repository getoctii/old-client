import styles from './Header.module.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FC, ReactNode } from 'react'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { useMedia } from 'react-use'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'

const HeaderPlaceholder: FC = () => {
  return (
    <div className={styles.placeholder}>
      <div className={styles.icon} />
      <div className={styles.title}>
        <div className={styles.community} />
        <div className={styles.subtitle} />
      </div>
    </div>
  )
}

const Header: FC<{
  className?: string
  subheading: string
  heading: string
  onClick?: () => void
  onBack?: () => void
  color?: 'primary' | 'secondary'
  icon?: IconDefinition
  image?: string
  action?: ReactNode
}> = ({
  className,
  subheading,
  heading,
  onClick,
  onBack,
  color,
  icon,
  image,
  action
}) => {
  const isMobile = useMedia('(max-width: 740px)')
  return (
    <div className={`${styles.header} ${className ? className : ''}`}>
      <div
        className={`${styles.icon} ${
          color === 'secondary'
            ? styles.secondary
            : color === 'primary'
            ? styles.primary
            : isMobile
            ? styles.primary
            : ''
        } ${onClick || (onBack && isMobile) ? styles.clickable : ''}`}
        onClick={() => (onBack && isMobile ? onBack() : onClick && onClick())}
        style={
          image && !icon && !isMobile
            ? {
                backgroundImage: `url('${image}')`,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat'
              }
            : {}
        }
      >
        {(icon || isMobile) && (
          <FontAwesomeIcon
            className={styles.backButton}
            icon={isMobile || !icon ? faChevronLeft : icon}
            size='2x'
          />
        )}
      </div>
      <div className={styles.title}>
        {subheading && <small>{subheading}</small>}
        <h2>{heading}</h2>
      </div>
      {action}
    </div>
  )
}

export const Placeholder = HeaderPlaceholder
export default Header

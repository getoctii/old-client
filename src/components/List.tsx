import { IconDefinition } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FC, ReactNode, Suspense, useMemo } from 'react'
import { useMedia } from 'react-use'
import styles from './List.module.scss'

const ListCardPlaceholder: FC<{ className?: string }> = ({ className }) => {
  const title = useMemo(() => Math.floor(Math.random() * 6) + 3, [])
  return (
    <div className={`${styles.cardPlaceholder} ${className ? className : ''}`}>
      <div className={styles.icon} />
      <div className={styles.info}>
        <div className={styles.title} style={{ width: `${title}rem` }} />
      </div>
    </div>
  )
}

const ListCard: FC<{
  title: ReactNode
  subtitle?: string
  icon?: ReactNode
  groups?: ReactNode
  actions?: ReactNode
  className?: string
  onClick?: () => void
}> = ({ title, subtitle, icon, groups, actions, className, onClick }) => {
  const isMobile = useMedia('(max-width: 740px)')
  return (
    <Suspense fallback={<ListCardPlaceholder />}>
      <div
        className={`${styles.card} ${className ? className : ''}`}
        onClick={() => onClick && onClick()}
      >
        {icon}
        <div className={styles.info}>
          {title && <h4>{title}</h4>}
          {subtitle && <time>{subtitle}</time>}
        </div>
        {groups && <div className={styles.groups}>{groups}</div>}
        {!isMobile && <div className={styles.actions}>{actions}</div>}
      </div>
    </Suspense>
  )
}

const ListEmpty: FC<{
  icon: IconDefinition
  title: string
  description: string
  action?: ReactNode
}> = ({ icon, title, description, action }) => {
  return (
    <div className={styles.empty}>
      <FontAwesomeIcon size={'5x'} icon={icon} />
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </div>
  )
}

const ListView: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className={styles.list}>
      <div className={styles.body}>{children}</div>
    </div>
  )
}

const ListPlaceholder: FC = () => {
  const length = useMemo(() => Math.floor(Math.random() * 4) + 1, [])
  return (
    <div className={styles.placeholder}>
      {Array.from(Array(length).keys()).map((_, index) => (
        <ListCardPlaceholder key={index} />
      ))}
    </div>
  )
}

const List = {
  View: ListView,
  Card: ListCard,
  Empty: ListEmpty,
  CardPlaceholder: ListCardPlaceholder,
  Placeholder: ListPlaceholder
}

export default List

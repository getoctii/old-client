import { faChevronRight } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useHistory, useRouteMatch } from 'react-router-dom'
import styles from './OrganizationCard.module.scss'

const OrganizationCardView = ({ id }: { id: string }) => {
  const history = useHistory()
  const match = useRouteMatch<{ id: string }>('/developer/organization/:id')
  return (
    <div
      className={`${styles.card} ${
        match?.params?.id === id ? styles.selected : ''
      }`}
      onClick={() => history.push(`/developer/organization/${id}`)}
    >
      <img
        className={styles.icon}
        src='https://file.coffee/u/LXJF3kApjb.png'
        alt='Pornhub'
      />
      <h4>Pornhub</h4>
      <div className={styles.details}>
        <FontAwesomeIcon icon={faChevronRight} />
      </div>
    </div>
  )
}

const OrganizationCardPlaceholder = () => {
  return <></>
}

const OrganizationCard = {
  View: OrganizationCardView,
  Placeholder: OrganizationCardPlaceholder
}

export default OrganizationCard

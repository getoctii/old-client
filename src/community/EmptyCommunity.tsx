import { CommunityResponse } from './remote'
import { Auth } from '../authentication/state'
import { UI } from '../state/ui'
import styles from './EmptyCommunity.module.scss'
import { Helmet } from 'react-helmet-async'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faFilm,
  faMapPin,
  faPlusCircle,
  faUserFriends
} from '@fortawesome/pro-duotone-svg-icons'
import { ModalTypes } from '../utils/constants'
import Button from '../components/Button'
import { FC } from 'react'

const cards = [
  {
    id: 'friends',
    title: 'Friends Community',
    icon: faUserFriends
  },
  {
    id: 'creator',
    title: 'Creator Community',
    icon: faFilm
  },
  {
    id: 'local',
    title: 'Local Community',
    icon: faMapPin
  }
]

const EmptyCommunity: FC<CommunityResponse> = ({ name, owner_id }) => {
  const auth = Auth.useContainer()
  const ui = UI.useContainer()
  return (
    <div className={styles.communityEmpty}>
      <Helmet>
        <title>Octii - {name}</title>
      </Helmet>
      {ui.modal?.name !== ModalTypes.NEW_CHANNEL && (
        <div className={styles.container}>
          <small>{name}</small>
          <h1>Let’s get started on your new community!</h1>
          <h3>Here are some ideas for a community</h3>
          <div className={styles.cards}>
            {cards.map((card) => (
              <div className={styles.card} key={card.id}>
                {card.title}
                <FontAwesomeIcon icon={card.icon} fixedWidth />
              </div>
            ))}
          </div>
          {owner_id === auth.id && (
            <Button
              type='button'
              className={styles.createButton}
              onClick={() => {
                ui.setModal({ name: ModalTypes.NEW_CHANNEL })
              }}
            >
              Create Community
              <FontAwesomeIcon icon={faPlusCircle} />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default EmptyCommunity

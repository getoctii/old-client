import { CommunityResponse } from './remote'
import { Auth } from '../authentication/state'
import { UI } from '../state/ui'
import styles from './EmptyCommunity.module.scss'
import { Helmet } from 'react-helmet-async'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronCircleRight,
  faFilm,
  faMapPin,
  faPlusCircle,
  faUserFriends
} from '@fortawesome/pro-duotone-svg-icons'
import { ModalTypes } from '../utils/constants'
import Button from '../components/Button'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'

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

const EmptyCommunity = ({ name, owner_id }: CommunityResponse) => {
  const auth = Auth.useContainer()
  const ui = UI.useContainer()
  const [templateSelected, setTemplateSelected] = useState<string | undefined>(
    undefined
  )
  return (
    <div className={styles.communityEmpty}>
      <Helmet>
        <title>Octii - {name}</title>
      </Helmet>
      {ui.modal?.name !== ModalTypes.NEW_CHANNEL && (
        <div className={styles.container}>
          <small>{name}</small>
          <AnimatePresence>
            {!templateSelected && (
              <>
                <motion.h1>Let’s get started on your new community!</motion.h1>
                <motion.h3>What type of community are you creating?</motion.h3>
              </>
            )}

            <div className={styles.cards}>
              {cards.map(
                (card) =>
                  (!templateSelected || templateSelected === card.id) && (
                    <>
                      <motion.div
                        transition={{
                          type: 'spring',
                          duration: 2,
                          stiffness: 200,
                          damping: 30
                        }}
                        animate={
                          templateSelected === card.id ? 'open' : 'closed'
                        }
                        variants={{
                          open: {
                            backgroundImage: 'var(--neko-colors-secondary)'
                          },
                          closed: {
                            backgroundImage: 'var(--neko-sidebar-background)'
                          }
                        }}
                        exit={{ opacity: 0 }}
                        className={styles.card}
                        onClick={() =>
                          setTemplateSelected(
                            templateSelected === card.id ? undefined : card.id
                          )
                        }
                      >
                        {card.title}
                        <FontAwesomeIcon icon={card.icon} fixedWidth />
                      </motion.div>
                    </>
                  )
              )}
            </div>
          </AnimatePresence>
          {!templateSelected && (
            <button className={styles.more}>
              Import or find more templates{' '}
              <FontAwesomeIcon icon={faChevronCircleRight} />
            </button>
          )}
          {owner_id === auth.id && (
            <Button
              type='button'
              className={styles.createButton}
              onClick={() => {
                ui.setModal({ name: ModalTypes.NEW_CHANNEL })
              }}
            >
              {templateSelected ? 'Create Community' : 'Create from Scratch'}{' '}
              <FontAwesomeIcon icon={faPlusCircle} />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default EmptyCommunity

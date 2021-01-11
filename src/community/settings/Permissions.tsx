import {
  faBoxOpen,
  faChevronLeft,
  faPencil,
  faTimesCircle
} from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { AnimatePresence, motion } from 'framer-motion'
import React, { memo, Suspense } from 'react'
import { useQuery } from 'react-query'
import { useHistory, useParams } from 'react-router-dom'
import { useMedia } from 'react-use'
import { Auth } from '../../authentication/state'
import Button from '../../components/Button'
import Loader from '../../components/Loader'
import { UI } from '../../state/ui'
import { ModalTypes } from '../../utils/constants'
import { getCommunity, getGroup, getGroups, Group } from '../remote'
import styles from './Permissions.module.scss'

const Permission = memo(({ id }: { id: string }) => {
  const params = useParams<{ id: string }>()
  const { token } = Auth.useContainer()
  const group = useQuery(['group', params.id, id, token], getGroup)
  const isMobile = useMedia('(max-width: 740px)')
  return (
    <motion.div
      className={styles.permission}
      initial={{
        opacity: 0
      }}
      animate={{
        opacity: 1,
        transition: { y: { stiffness: 1000, velocity: -100 } }
      }}
      exit={{
        opacity: 0
      }}
    >
      <div className={styles.icon} />
      <div className={styles.info}>
        <h4>{group.data?.name}</h4>
      </div>
      {!isMobile && (
        <div className={styles.actions}>
          <Button type='button'>
            <FontAwesomeIcon icon={faPencil} />
          </Button>
        </div>
      )}
    </motion.div>
  )
})

const Permissions = () => {
  const { token } = Auth.useContainer()
  const { setModal } = UI.useContainer()
  const { id } = useParams<{ id: string }>()
  const isMobile = useMedia('(max-width: 740px)')
  const history = useHistory()
  const groups = useQuery(['groups', id, token], getGroups)
  console.log(groups)
  const community = useQuery(['community', id, token], getCommunity)
  return (
    <Suspense fallback={<Loader />}>
      <div className={styles.wrapper}>
        <div className={styles.permissions}>
          {groups.data && groups.data?.length > 0 ? (
            <>
              <div className={styles.body}>
                <AnimatePresence>
                  {groups.data.map(
                    (group) =>
                      group && <Permission key={group.id} id={group.id} />
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <div className={styles.empty}>
                <FontAwesomeIcon size={'5x'} icon={faBoxOpen} />
                <br />
                <h2>No permission groups in this community!</h2>
                <br />
                <br />
                <Button
                  type='button'
                  onClick={() => setModal({ name: ModalTypes.NEW_PERMISSION })}
                >
                  Create Permission Group
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </Suspense>
  )
}

export default Permissions

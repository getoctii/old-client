import {
  faBoxOpen,
  faChevronLeft
} from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { AnimatePresence, motion } from 'framer-motion'
import dayjs from 'dayjs'
import dayjsUTC from 'dayjs/plugin/utc'
import dayjsCalendar from 'dayjs/plugin/calendar'
import React, { memo, Suspense, useMemo, useRef, useState } from 'react'
import { useInfiniteQuery } from 'react-query'
import { useHistory } from 'react-router-dom'
import { useMedia } from 'react-use'
import { Waypoint } from 'react-waypoint'
import { Auth } from '../authentication/state'
import Loader from '../components/Loader'
import styles from './Codes.module.scss'
import { clientGateway } from '../utils/constants'
import { faUserClock, faNewspaper } from '@fortawesome/pro-duotone-svg-icons'

dayjs.extend(dayjsUTC)
dayjs.extend(dayjsCalendar)

interface SubResponse {
  email: string
  created_at: number
  updated_at: number
}

const Subscriber = memo(
  ({ email, created_at }: SubResponse) => {
    return (
      <motion.div
        className={styles.code}
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
        <div
          className={styles.icon}
        >
          <FontAwesomeIcon icon={faUserClock} />
        </div>
        <div className={styles.info}>
          <h4>
            {email}
          </h4>
          <time>{dayjs.utc(created_at).local().calendar()}</time>
        </div>
      </motion.div>
    )
  }
)

export const Newsletters = () => {
  const history = useHistory()
  const { token } = Auth.useContainer()
  const { data, canFetchMore, fetchMore } = useInfiniteQuery<SubResponse[], any>(
    ['newsletters', token],
    async (_: string, token: string) => (
      await clientGateway.get<SubResponse[]>('/admin/newsletters', {
        headers: {
          Authorization: token
        }
      })
    ).data,
    {
      getFetchMore: (last) => {
        return last.length < 25 ? undefined : last[last.length - 1]?.created_at
      }
    }
  )
  const subscribers = useMemo(() => data?.flat() || [], [data])
  const ref = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)
  const isMobile = useMedia('(max-width: 740px)')
  console.log(subscribers)
  return (
    <Suspense fallback={<Loader />}>
      <div className={styles.wrapper}>
        <div className={styles.codes}>
          {subscribers.length > 0 ? (
            <>
              <div className={styles.header}>
                {isMobile ? (
                  <div
                    className={styles.icon}
                    onClick={() =>
                      isMobile &&
                      history.push(`/admin`)
                    }
                  >
                    <FontAwesomeIcon
                      className={styles.backButton}
                      icon={faChevronLeft}
                    />
                  </div>
                ) : (
                  <div
                    className={styles.icon}
                  >
                    <FontAwesomeIcon
                      icon={faNewspaper}
                    />
                  </div>
                )}
                <div className={styles.title}>
                  <small>Admin</small>
                  <h2>Newsletters</h2>
                </div>
              </div>
              <div className={styles.body} ref={ref}>
                <AnimatePresence>
                  {subscribers.map(
                    (subscriber) =>
                      subscriber ? (
                        <Subscriber {...subscriber} />
                      ) : <></>
                  )}
                  {loading && (
                    <div key='loader' className={styles.loader}>
                      <h5>Loading more...</h5>
                    </div>
                  )}
                  {!loading && canFetchMore ? (
                    <Waypoint
                      bottomOffset={20}
                      onEnter={async () => {
                        try {
                          const current = ref.current
                          if (!current || !current.scrollHeight) return
                          setLoading(true)
                          const oldHeight = current.scrollHeight
                          const oldTop = current.scrollTop
                          await fetchMore()
                          current.scrollTop = current.scrollHeight
                            ? current.scrollHeight - oldHeight + oldTop
                            : 0
                        } finally {
                          setLoading(false)
                        }
                      }}
                    />
                  ) : (
                    <></>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <div className={styles.codesEmpty}>
                <FontAwesomeIcon size={'5x'} icon={faBoxOpen} />
                <br />
                <h2>No newsletter subscribers found!</h2>
                <br />
                <br />
              </div>
            </>
          )}
        </div>
      </div>
    </Suspense>
  )
}

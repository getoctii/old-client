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
import { queryCache, useInfiniteQuery, useMutation } from 'react-query'
import { useHistory } from 'react-router-dom'
import { useMedia } from 'react-use'
import { Waypoint } from 'react-waypoint'
import { Auth } from '../authentication/state'
import Loader from '../components/Loader'
import styles from './Codes.module.scss'
import { clientGateway } from '../utils/constants'
import { faUserCheck, faUserClock, faClipboardList, faCopy, faTrashAlt } from '@fortawesome/pro-duotone-svg-icons'
import Button from '../components/Button'
import { Plugins } from '@capacitor/core'

dayjs.extend(dayjsUTC)
dayjs.extend(dayjsCalendar)

interface CodeResponse {
  id: string
  used: boolean
  created_at: number
  updated_at: number
}

const Code = memo(
  ({ id, used, created_at }: CodeResponse) => {
    const { token } = Auth.useContainer()
    const [deleteCode] = useMutation(
      async () => (
        await clientGateway.delete(`/admin/codes/${id}`, {
          headers: {
            Authorization: token
          }
        })
      ).data,
      {
        onSuccess: async () => {
          await queryCache.invalidateQueries(['codes', token])
        }
      }
    )
    const isMobile = useMedia('(max-width: 740px)')
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
          className={`${styles.icon} ${used ? styles.used : ''}`}
        >
          <FontAwesomeIcon icon={used ? faUserCheck : faUserClock} />
        </div>
        <div className={styles.info}>
          <h4>
            {id}
          </h4>
          <time>{dayjs.utc(created_at).local().calendar()}</time>
        </div>
        {!isMobile && (
          <div className={styles.actions}>
            <Button
              type='button'
              onClick={async () => {
                await Plugins.Clipboard.write({
                  string: id
                })
              }}
            >
              <FontAwesomeIcon icon={faCopy} />
              Copy
            </Button>
            <Button
              type='button'
              className={styles.delete}
              onClick={async () => {
                await deleteCode()
              }}
            >
              <FontAwesomeIcon icon={faTrashAlt} />
            </Button>
          </div>
        )}
      </motion.div>
    )
  }
)

export const Codes = () => {
  const history = useHistory()
  const { token } = Auth.useContainer()
  const { data, canFetchMore, fetchMore } = useInfiniteQuery<CodeResponse[], any>(
    ['codes', token],
    async (_: string, token: string) => (
      await clientGateway.get<CodeResponse[]>('/admin/codes', {
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
  const [createCode] = useMutation(
    async () => (
      await clientGateway.post('/admin/codes', {}, {
        headers: {
          Authorization: token
        }
      })
    ).data,
    {
      onSuccess: async () => {
        await queryCache.invalidateQueries(['codes', token])
      }
    }
  )
  const codes = useMemo(() => data?.flat() || [], [data])
  const ref = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)
  const isMobile = useMedia('(max-width: 740px)')
  console.log(codes)
  return (
    <Suspense fallback={<Loader />}>
      <div className={styles.wrapper}>
        <div className={styles.codes}>
          {codes.length > 0 ? (
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
                      icon={faClipboardList}
                    />
                  </div>
                )}
                <div className={styles.title}>
                  <small>Admin</small>
                  <h2>Beta Codes</h2>
                </div>
                <Button type={'button'} onClick={() => createCode()}>New Code</Button>
              </div>
              <div className={styles.body} ref={ref}>
                <AnimatePresence>
                  {codes.map(
                    (code) =>
                      code ? (
                        <Code {...code} />
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
                <h2>No beta codes found!</h2>
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

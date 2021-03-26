import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import dayjs from 'dayjs'
import dayjsUTC from 'dayjs/plugin/utc'
import dayjsCalendar from 'dayjs/plugin/calendar'
import React, { useMemo, useRef, useState } from 'react'
import { useInfiniteQuery } from 'react-query'
import { Waypoint } from 'react-waypoint'
import { Auth } from '../authentication/state'
import styles from './Newsletters.module.scss'
import { clientGateway } from '../utils/constants'
import {
  faUserClock,
  faClipboardList
} from '@fortawesome/pro-duotone-svg-icons'
import Header from '../components/Header'
import List from '../components/List'
import { useHistory } from 'react-router-dom'

dayjs.extend(dayjsUTC)
dayjs.extend(dayjsCalendar)

interface SubResponse {
  email: string
  created_at: number
  updated_at: number
}
const Newsletters = () => {
  const { token } = Auth.useContainer()
  const history = useHistory()
  const { data, canFetchMore, fetchMore } = useInfiniteQuery<
    SubResponse[],
    any
  >(
    ['newsletters', token],
    async (_: string, token: string, lastCodeEmail: string) =>
      (
        await clientGateway.get<SubResponse[]>('/admin/newsletters', {
          headers: {
            Authorization: token
          },
          params: { last_email_id: lastCodeEmail }
        })
      ).data,
    {
      getFetchMore: (last) => {
        return last.length < 25 ? undefined : last[last.length - 1]?.email
      }
    }
  )
  const subscribers = useMemo(() => data?.flat() || [], [data])
  const ref = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)
  return (
    <div className={styles.newsletters}>
      <Header
        heading={'Newsletters'}
        subheading={'Admin'}
        icon={faClipboardList}
        color='secondary'
        onBack={() => history.push(`/admin`)}
      />
      <br />
      <List.View>
        {subscribers.length > 0 ? (
          <div ref={ref}>
            {subscribers.map(
              (subscriber) =>
                subscriber && (
                  <List.Card
                    title={subscriber.email}
                    subtitle={dayjs
                      .utc(subscriber.created_at)
                      .local()
                      .calendar()}
                    icon={
                      <div className={styles.icon}>
                        <FontAwesomeIcon icon={faUserClock} />
                      </div>
                    }
                  />
                )
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
            ) : !!loading && canFetchMore ? (
              <div key='loader' className={styles.loader}>
                <h5>Loading more...</h5>
              </div>
            ) : (
              <></>
            )}
          </div>
        ) : (
          <List.Empty
            title={'No newsletters found'}
            description={'No idea'}
            icon={faClipboardList}
          />
        )}
      </List.View>
    </div>
  )
}

export default Newsletters

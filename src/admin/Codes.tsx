import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import dayjs from 'dayjs'
import dayjsUTC from 'dayjs/plugin/utc'
import dayjsCalendar from 'dayjs/plugin/calendar'
import React, { memo, useMemo, useRef, useState } from 'react'
import { queryCache, useInfiniteQuery, useMutation } from 'react-query'
import { Waypoint } from 'react-waypoint'
import { Auth } from '../authentication/state'
import styles from './Codes.module.scss'
import { clientGateway } from '../utils/constants'
import {
  faUserCheck,
  faUserClock,
  faClipboardList,
  faCopy,
  faTrashAlt,
  faPlusCircle
} from '@fortawesome/pro-duotone-svg-icons'
import Button from '../components/Button'
import { Plugins } from '@capacitor/core'
import Header from '../components/Header'
import List from '../components/List'
import { useHistory } from 'react-router-dom'
import { useMedia } from 'react-use'

dayjs.extend(dayjsUTC)
dayjs.extend(dayjsCalendar)

interface CodeResponse {
  id: string
  used: boolean
  created_at: number
  updated_at: number
}

const Code = memo(({ id, used, created_at }: CodeResponse) => {
  const { token } = Auth.useContainer()
  const [deleteCode] = useMutation(
    async () =>
      (
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
  return (
    <List.Card
      title={id}
      subtitle={dayjs.utc(created_at).local().calendar()}
      icon={
        <div className={`${styles.icon} ${used ? styles.used : ''}`}>
          <FontAwesomeIcon icon={used ? faUserCheck : faUserClock} />
        </div>
      }
      actions={
        <>
          <Button
            className={styles.copyButton}
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
            className={styles.deleteButton}
            type='button'
            onClick={async () => {
              await deleteCode()
            }}
          >
            <FontAwesomeIcon icon={faTrashAlt} />
          </Button>
        </>
      }
    />
  )
})

const Codes = () => {
  const isMobile = useMedia('(max-width: 740px)')
  const { token } = Auth.useContainer()
  const { data, canFetchMore, fetchMore } = useInfiniteQuery<
    CodeResponse[],
    any
  >(
    ['codes', token],
    async (_: string, token: string, lastCodeID: string) =>
      (
        await clientGateway.get<CodeResponse[]>('/admin/codes', {
          headers: {
            Authorization: token
          },
          params: { last_code_id: lastCodeID }
        })
      ).data,
    {
      getFetchMore: (last) => {
        return last.length < 25 ? undefined : last[last.length - 1]?.id
      }
    }
  )
  const [createCode] = useMutation(
    async () =>
      (
        await clientGateway.post(
          '/admin/codes',
          {},
          {
            headers: {
              Authorization: token
            }
          }
        )
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
  const history = useHistory()
  return (
    <div className={styles.codes}>
      <Header
        heading={'Codes'}
        subheading={'Admin'}
        icon={faClipboardList}
        color='secondary'
        onBack={() => history.push(`/admin`)}
        action={
          <Button
            className={styles.action}
            type={'button'}
            onClick={() => createCode()}
          >
            {isMobile ? <FontAwesomeIcon icon={faPlusCircle} /> : 'New Code'}
          </Button>
        }
      />
      <br />
      <List.View>
        {codes.length > 0 ? (
          <div ref={ref}>
            {codes.map((code) =>
              code ? <Code key={code.id} {...code} /> : <></>
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
            title={'No beta codes found'}
            description={'Generate a beta code!'}
            icon={faClipboardList}
          />
        )}
      </List.View>
    </div>
  )
}

export default Codes

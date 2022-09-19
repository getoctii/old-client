import dayjs from 'dayjs'
import dayjsUTC from 'dayjs/plugin/utc'
import dayjsCalendar from 'dayjs/plugin/calendar'
import { useQuery } from 'react-query'
import { Auth } from '../../authentication/state'
import styles from './Queue.module.scss'
import { clientGateway } from '../../utils/constants'
import { faClipboardList } from '@fortawesome/free-solid-svg-icons'
import Header from '../../components/Header'
import List from '../../components/List'
import { useHistory } from 'react-router-dom'
import { ProductCard } from '../../community/integrations/Products'
import { FC } from 'react'

dayjs.extend(dayjsUTC)
dayjs.extend(dayjsCalendar)

const Queue: FC = () => {
  const { token } = Auth.useContainer()
  const { data: queue } = useQuery<string[]>(
    ['codes', token],
    async (_: string, token: string) =>
      (
        await clientGateway.get<string[]>('/admin/store/queue', {
          headers: {
            Authorization: token
          }
        })
      ).data
  )

  const history = useHistory()
  return (
    <div className={styles.queue}>
      <Header
        heading={'Queue'}
        subheading={'Store'}
        icon={faClipboardList}
        color='secondary'
        onBack={() => history.push(`/admin`)}
      />
      <br />
      <List.View>
        {(queue?.length ?? 0) > 0 ? (
          queue?.map((queue) =>
            queue ? <ProductCard key={queue} id={queue} /> : <></>
          )
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

export default Queue

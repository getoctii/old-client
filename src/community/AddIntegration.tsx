import { faLink } from '@fortawesome/pro-solid-svg-icons'
import { useQuery } from 'react-query'
import { useRouteMatch } from 'react-router-dom'
import { Auth } from '../authentication/state'
import Button from '../components/Button'
import Modal from '../components/Modal'
import { getCommunity } from './remote'
import styles from './AddIntegration.module.scss'
import { useMemo, useState } from 'react'
import Integrations from '../integrations/state'
import { clientGateway } from '../utils/constants'

const AddIntegration = () => {
  const { token } = Auth.useContainer()
  const match = useRouteMatch<{ id: string }>('/communities/:id')

  const integerations = Integrations.useContainer()
  const items = useMemo(
    () => integerations.payloads?.flatMap((integration) => integration.server),
    [integerations]
  )

  const [selected, setSelected] = useState(items?.[0]?.id ?? '')
  const [loading, setLoading] = useState(false)

  return (
    <Modal
      icon={faLink}
      title='Add Integration'
      onDismiss={() => {}}
      bottom={
        <Button
          type='button'
          className={styles.bottom}
          onClick={async () => {
            try {
              console.log(items?.find((i) => i.id === selected))
              await clientGateway.post(
                `/communities/${match?.params.id}/integrations`,
                {
                  resource_id: items?.find((i) => i.id === selected).id
                },
                {
                  headers: {
                    Authorization: token
                  }
                }
              )
            } finally {
              setLoading(false)
            }
          }}
        >
          Install
        </Button>
      }
    >
      <div className={styles.list}>
        {items?.map(({ name, id }) => (
          <Button
            type='button'
            onClick={() => setSelected(id)}
            className={selected === id ? styles.selected : undefined}
          >
            {name}
          </Button>
        ))}
      </div>
    </Modal>
  )
}

export default AddIntegration

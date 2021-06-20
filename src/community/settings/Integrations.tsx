import { faLink, faPlusCircle } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useQuery } from 'react-query'
import { useRouteMatch } from 'react-router-dom'
import { Auth } from '../../authentication/state'
import Button from '../../components/Button'
import List from '../../components/List'
import { UI } from '../../state/ui'
import { ModalTypes } from '../../utils/constants'
import { getIntegrations } from '../remote'
import styles from './Integrations.module.scss'

const Integrations = () => {
  const ui = UI.useContainer()
  const { token } = Auth.useContainer()
  const match = useRouteMatch<{ id: string }>('/communities/:id')
  const { data: installed } = useQuery(
    ['communityIntegrations', match?.params.id, token],
    getIntegrations
  )

  return (
    <div className={styles.integrations}>
      <List.View>
        {(installed?.length ?? 0) === 0 ? (
          <List.Empty
            icon={faLink}
            title='Get started with integrations!'
            description={`Integrations give your community superpowers. Add integrations from the store and enhance your chat experience!`}
            action={
              <Button
                type='button'
                onClick={() =>
                  ui.setModal({ name: ModalTypes.ADD_INTEGRATION })
                }
              >
                Install Integration <FontAwesomeIcon icon={faPlusCircle} />
              </Button>
            }
          />
        ) : (
          <div>
            {installed?.map(({ name }) => (
              <List.Card title={name}></List.Card>
            ))}
          </div>
        )}
      </List.View>
    </div>
  )
}

export default Integrations

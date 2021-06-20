import { useMemo } from 'react'
import { useQuery } from 'react-query'
import { useRouteMatch } from 'react-router-dom'
import { Auth } from '../authentication/state'
import { getIntegrations } from '../community/remote'
import styles from './Commands.module.scss'

const Commands: React.FC<{ search: string }> = ({ search }) => {
  const { token } = Auth.useContainer()
  const match = useRouteMatch<{ id: string }>('/communities/:id')
  const { data: installed } = useQuery(
    ['communityIntegrations', match?.params.id, token],
    getIntegrations,
    {
      enabled: !!match?.params.id
    }
  )

  const commands = useMemo(
    () =>
      installed?.flatMap((integration) =>
        integration.commands.map((command) => ({
          ...command,
          icon: integration.icon
        }))
      ),
    [installed]
  )

  const filtered = useMemo(
    () => commands?.filter((command) => command.name.includes(search)),
    [commands, search]
  )

  return filtered && filtered.length > 0 ? (
    <div className={styles.commandsPopup}>
      {filtered?.map((command) => (
        <div className={styles.command}>
          <img src={command.icon}></img>
          <div className={styles.text}>
            <h1>
              /{command.name}{' '}
              {command.params.map((param) => (
                <span className={styles.arguments}>{param.name}</span>
              ))}
            </h1>
            <h2>{command.description}</h2>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <></>
  )
}

export default Commands

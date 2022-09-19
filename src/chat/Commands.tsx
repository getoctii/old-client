import { useEffect, useMemo } from 'react'
import { useQuery } from 'react-query'
import { useRouteMatch } from 'react-router-dom'
import { Auth } from '../authentication/state'
import { CommandResponse, getIntegrations } from '../community/remote'
import { clientGateway } from '../utils/constants'
import styles from './Commands.module.scss'

const Commands: React.FC<{
  search: string
  selected: number
  onFiltered: (
    commands: (CommandResponse & { icon: string; resourceID: string })[]
  ) => void
}> = ({ search, selected, onFiltered }) => {
  const { token } = Auth.useContainer()
  const match = useRouteMatch<{ id: string; channelID: string }>(
    '/communities/:id/channels/:channelID'
  )
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
          icon: integration.icon,
          resourceID: integration.id
        }))
      ),
    [installed]
  )

  const filtered = useMemo(
    () => commands?.filter((command) => command.name.includes(search)),
    [commands, search]
  )

  useEffect(() => {
    if (!filtered) return
    onFiltered(filtered)
  }, [filtered])

  return filtered && filtered.length > 0 ? (
    <div className={styles.commandsPopup}>
      {filtered?.map((command, i) => (
        <div
          className={`${styles.command} ${
            i === selected ? styles.selected : ''
          }`}
        >
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

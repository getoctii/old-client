import { faEllipsisH } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Integrations from './Integrations'
import { useState } from 'react'
import { useMutation } from 'react-query'
import { useRouteMatch } from 'react-router-dom'
import { Auth } from '../../authentication/state'
import styles from './Sidebar.module.scss'
import Channels from './Channels'
import { clientGateway, ModalTypes, Permissions } from '../../utils/constants'
import { useSuspenseStorageItem } from '../../utils/storage'
import { Permission } from '../../utils/permissions'
import {
  faBell,
  faBellSlash,
  faHouseLeave,
  faUserPlus
} from '@fortawesome/pro-duotone-svg-icons'
import { UI } from '../../state/ui'

const SidebarView = () => {
  const auth = Auth.useContainer()
  const match = useRouteMatch<{ id: string }>('/communities/:id')
  const [menu, setMenu] = useState(false)
  const [muted, setMuted] = useSuspenseStorageItem<string[]>(
    'muted-communities',
    []
  )
  const ui = UI.useContainer()
  const { community, hasPermissions } = Permission.useContainer()
  const [leaveCommunity] = useMutation(
    async () =>
      (
        await clientGateway.post(
          `/communities/${match?.params.id}/leave`,
          {},
          {
            headers: { Authorization: auth.token }
          }
        )
      ).data
  )
  return (
    <div className={styles.wrapper}>
      <div className={styles.sidebar}>
        <div className={styles.container}>
          <h3>
            {community?.name ? community?.name : ''}{' '}
            <span
              className={styles.leave}
              onClick={() => {
                setMenu(!menu)
              }}
            >
              <FontAwesomeIcon icon={faEllipsisH} className={styles.menuIcon} />
            </span>
          </h3>
          {menu && (
            <div className={styles.menu}>
              {hasPermissions([
                Permissions.CREATE_INVITES,
                Permissions.MANAGE_INVITES
              ]) && (
                <div
                  className={styles.menuItem}
                  onClick={() => ui.setModal({ name: ModalTypes.NEW_INVITE })}
                >
                  <span>Create Invite</span>{' '}
                  <FontAwesomeIcon icon={faUserPlus} fixedWidth />
                </div>
              )}
              <div
                className={styles.menuItem}
                onClick={() => {
                  if (!community?.id) return
                  if (muted?.includes(community.id))
                    setMuted(
                      muted.filter(
                        (communities) => communities !== community?.id
                      )
                    )
                  else setMuted([...(muted || []), community.id])
                }}
              >
                {community && muted?.includes(community.id) ? (
                  <>
                    <span>Unmute Community</span>{' '}
                    <FontAwesomeIcon icon={faBell} fixedWidth />
                  </>
                ) : (
                  <>
                    <span>Mute Community</span>{' '}
                    <FontAwesomeIcon icon={faBellSlash} fixedWidth />
                  </>
                )}
              </div>
              {community?.owner_id !== auth.id && (
                <>
                  <hr />
                  <div
                    className={`${styles.menuItem} ${styles.danger}`}
                    onClick={async () => {
                      await leaveCommunity()
                    }}
                  >
                    <span>Leave Community</span>{' '}
                    <FontAwesomeIcon icon={faHouseLeave} fixedWidth />
                  </div>
                </>
              )}
            </div>
          )}
          <Integrations.View />
          <Channels.View />
        </div>
      </div>
    </div>
  )
}

const SidebarPlaceholder = () => {
  return (
    <div className={styles.placeholder}>
      <div className={styles.sidebar}>
        <div className={styles.container}>
          <div className={styles.name} />
        </div>
        <Integrations.Placeholder />
        <Channels.Placeholder />
      </div>
    </div>
  )
}

const Sidebar = { View: SidebarView, Placeholder: SidebarPlaceholder }

export default Sidebar

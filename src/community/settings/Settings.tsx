import React, { memo, Suspense } from 'react'
import { General } from './General'
import { Invites } from './Invites'
import { Navbar } from './Navbar'
import { useMedia } from 'react-use'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft } from '@fortawesome/pro-solid-svg-icons'
import {
  Redirect,
  Switch,
  useHistory,
  useParams,
  useRouteMatch
} from 'react-router-dom'
import styles from './Settings.module.scss'
import Button from '../../components/Button'
import { ModalTypes, Permissions } from '../../utils/constants'
import { faPlusCircle } from '@fortawesome/pro-duotone-svg-icons'
import { PrivateRoute } from '../../authentication/PrivateRoute'
import Groups from './groups/Groups'
import { UI } from '../../state/ui'
import { Permission } from '../../utils/permissions'

export const Settings = memo(() => {
  const isMobile = useMedia('(max-width: 740px)')
  const { id } = useParams<{ id: string }>()
  const { community, hasPermissions } = Permission.useContainer()
  const { path } = useRouteMatch()
  const match = useRouteMatch<{ tab?: string; id: string }>(
    '/communities/:id/settings/:tab?'
  )
  const ui = UI.useContainer()
  const history = useHistory()

  return (
    <>
      {!hasPermissions([
        Permissions.MANAGE_INVITES,
        Permissions.MANAGE_COMMUNITY,
        Permissions.MANAGE_PERMISSIONS
      ]) ? (
        <Redirect to={`/communities/${id}`} />
      ) : (
        <div className={styles.wrapper}>
          <div className={styles.settings}>
            <div className={styles.header}>
              {isMobile ? (
                <div
                  className={styles.icon}
                  onClick={() => isMobile && history.push(`/communities/${id}`)}
                >
                  <FontAwesomeIcon
                    className={styles.backButton}
                    icon={faChevronLeft}
                  />
                </div>
              ) : (
                <div
                  className={styles.icon}
                  style={{ backgroundImage: `url('${community?.icon}')` }}
                />
              )}
              <div className={styles.title}>
                <small>{community?.name}</small>
                <h2>Settings</h2>
              </div>
              {match?.params.tab === 'invites' ? (
                <Button
                  className={styles.newButton}
                  type='button'
                  onClick={() => ui.setModal({ name: ModalTypes.NEW_INVITE })}
                >
                  {isMobile ? (
                    <FontAwesomeIcon icon={faPlusCircle} />
                  ) : (
                    'New Invite'
                  )}
                </Button>
              ) : match?.params.tab === 'groups' ? (
                <Button
                  className={styles.newButton}
                  type='button'
                  onClick={() =>
                    ui.setModal({ name: ModalTypes.NEW_PERMISSION })
                  }
                >
                  {isMobile ? (
                    <FontAwesomeIcon icon={faPlusCircle} />
                  ) : (
                    'New Group'
                  )}
                </Button>
              ) : (
                <></>
              )}
            </div>

            <Navbar />
            <Suspense fallback={<></>}>
              <Switch>
                {hasPermissions([Permissions.MANAGE_INVITES]) && (
                  <PrivateRoute
                    path={`${path}/invites`}
                    component={Invites}
                    exact
                  />
                )}
                {hasPermissions([Permissions.MANAGE_PERMISSIONS]) && (
                  <PrivateRoute
                    path={`${path}/groups`}
                    component={Groups}
                    exact
                  />
                )}
                {hasPermissions([Permissions.MANAGE_COMMUNITY]) && (
                  <PrivateRoute
                    path={`${path}/general`}
                    component={General}
                    exact
                  />
                )}
                <Redirect
                  path='*'
                  to={`${
                    hasPermissions([Permissions.MANAGE_COMMUNITY])
                      ? `/communities/${id}/settings/general`
                      : hasPermissions([Permissions.MANAGE_PERMISSIONS])
                      ? `/communities/${id}/settings/groups`
                      : hasPermissions([Permissions.MANAGE_INVITES])
                      ? `/communities/${id}/settings/invites`
                      : `/communities/${id}`
                  }`}
                />
              </Switch>
            </Suspense>
          </div>
        </div>
      )}
    </>
  )
})

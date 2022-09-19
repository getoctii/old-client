import { memo, Suspense, FC } from 'react'
import { General } from './General'
import Invites from './Invites'
import Navbar from './Navbar'
import { useMedia } from 'react-use'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
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
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons'
import { PrivateRoute } from '../../authentication/PrivateRoute'
import Groups from './groups/Groups'
import { UI } from '../../state/ui'
import { Permission } from '../../utils/permissions'
import List from '../../components/List'
import StatusBar from '../../components/StatusBar'
import Header from '../../components/Header'
import Integrations from './Integrations'

const SettingsPlaceholder: FC = () => {
  const match = useRouteMatch<{ tab?: string; id: string }>(
    '/communities/:id/settings/:tab?'
  )
  return (
    <div className={styles.placeholder}>
      <div className={styles.header}>
        <div className={styles.icon} />
        <div className={styles.title}>
          <div className={styles.community} />
          <div className={styles.subtitle} />
        </div>
      </div>
      <Navbar.Placeholder />
      <div>
        {match?.params.tab === 'groups' ? (
          <Groups.Placeholder />
        ) : match?.params.tab === 'invites' ? (
          <List.Placeholder />
        ) : (
          <></>
        )}
      </div>
    </div>
  )
}

const SettingsView: FC = memo(() => {
  const isMobile = useMedia('(max-width: 873px)')
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
        Permissions.MANAGE_GROUPS
      ]) ? (
        <Redirect to={`/communities/${id}`} />
      ) : (
        <StatusBar>
          <div className={styles.settings}>
            <Header
              heading={'Settings'}
              subheading={community?.name ?? ''}
              image={community?.icon}
              color='primary'
              onBack={() => history.push(`/communities/${id}`)}
              action={
                <>
                  {match?.params.tab === 'invites' ? (
                    <Button
                      className={styles.newButton}
                      type='button'
                      onClick={() =>
                        ui.setModal({ name: ModalTypes.NEW_INVITE })
                      }
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
                </>
              }
            />
            <Navbar.View />
            <Switch>
              {hasPermissions([Permissions.MANAGE_INVITES]) && (
                <PrivateRoute
                  path={`${path}/invites`}
                  render={Invites.View}
                  exact
                />
              )}
              {hasPermissions([Permissions.MANAGE_GROUPS]) && (
                <PrivateRoute
                  path={`${path}/groups`}
                  render={Groups.View}
                  exact
                />
              )}
              {hasPermissions([Permissions.MANAGE_COMMUNITY]) && (
                <PrivateRoute path={`${path}/general`} render={General} exact />
              )}
              {hasPermissions([Permissions.MANAGE_COMMUNITY]) && (
                <PrivateRoute
                  path={`${path}/integrations`}
                  render={Integrations}
                  exact
                />
              )}

              <Redirect
                path='*'
                to={`${
                  hasPermissions([Permissions.MANAGE_COMMUNITY])
                    ? `/communities/${id}/settings/general`
                    : hasPermissions([Permissions.MANAGE_COMMUNITY])
                    ? `/communities/${id}/settings/integrations`
                    : hasPermissions([Permissions.MANAGE_GROUPS])
                    ? `/communities/${id}/settings/groups`
                    : hasPermissions([Permissions.MANAGE_INVITES])
                    ? `/communities/${id}/settings/invites`
                    : `/communities/${id}`
                }`}
              />
            </Switch>
          </div>
        </StatusBar>
      )}
    </>
  )
})

const SettingsRouter: FC = () => {
  return (
    <Suspense fallback={SettingsPlaceholder}>
      <SettingsView />
    </Suspense>
  )
}

const Settings = { Router: SettingsRouter, Placeholder: SettingsPlaceholder }

export default Settings

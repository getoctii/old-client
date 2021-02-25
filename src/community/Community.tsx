import { Suspense, useCallback, useEffect, useState } from 'react'
import styles from './Community.module.scss'
import Chat from '../chat/Channel'
import { Redirect, Switch, useParams, useRouteMatch } from 'react-router-dom'
import { Auth } from '../authentication/state'
import { useQuery } from 'react-query'
import Channels from './sidebar/Sidebar'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Settings from './settings/Settings'
import { CommunityResponse, getChannels, getCommunity } from './remote'
import { PrivateRoute } from '../authentication/PrivateRoute'
import { useMedia } from 'react-use'
import Sidebar from '../sidebar/Sidebar'
import Members from './Members'
import { ChannelTypes, Permissions } from '../utils/constants'
import { Helmet } from 'react-helmet-async'
import { ErrorBoundary } from 'react-error-boundary'
import { faLock } from '@fortawesome/pro-duotone-svg-icons'
import EmptyCommunity from './EmptyCommunity'
import { Permission } from '../utils/permissions'
import { useMemo } from 'react'

const NoPermission = ({ name }: CommunityResponse) => (
  <div className={styles.noPermission}>
    <Helmet>
      <title>Octii - {name}</title>
    </Helmet>
    <div className={styles.locked}>
      <FontAwesomeIcon icon={faLock} size='4x' />
      <small>{name}</small>
      <h3>You cannot view this community!</h3>
    </div>
  </div>
)

const Channel = () => {
  const { id, channelID } = useParams<{ id: string; channelID: string }>()
  const auth = Auth.useContainer()
  const { data: channels } = useQuery(['channels', id, auth.token], getChannels)

  const channel = useMemo(
    () => channels?.find((channel) => channel.id === channelID),
    [channels, channelID]
  )
  if (!channel || channel.type !== ChannelTypes.TEXT) return <></>
  return <Chat.Community key={channel.id} />
}

const CommunityPlaceholder = () => {
  const isMobile = useMedia('(max-width: 740px)')
  const matchTab = useRouteMatch<{ id: string; tab: string }>(
    '/communities/:id/:tab'
  )
  return (
    <>
      <Channels.Placeholder />
      {!isMobile &&
        (matchTab?.params.tab === 'settings' ? (
          <Settings.Placeholder />
        ) : matchTab?.params.tab === 'members' ? (
          <Members.Placeholder />
        ) : (
          <Chat.Placeholder />
        ))}
    </>
  )
}

const EmptyCommunityHandler = ({
  emptyStateChange
}: {
  emptyStateChange: (state: boolean) => void
}) => {
  const { token } = Auth.useContainer()
  const match = useRouteMatch<{ id: string }>('/communities/:id')
  const { data: channels } = useQuery(
    ['channels', match?.params.id, token],
    getChannels
  )

  const showEmpty = useMemo(() => {
    return (
      (channels ?? []).filter((c) => c.type === ChannelTypes.TEXT).length <= 0
    )
  }, [channels])

  useEffect(() => {
    emptyStateChange(showEmpty)
  }, [showEmpty, emptyStateChange])

  return <></>
}

const CommunityView = () => {
  const { token } = Auth.useContainer()
  const { path } = useRouteMatch()
  const match = useRouteMatch<{ id: string }>('/communities/:id')
  const matchTab = useRouteMatch<{ id: string; tab: string }>(
    '/communities/:id/:tab'
  )
  const isMobile = useMedia('(max-width: 740px)')
  const { hasPermissions } = Permission.useContainer()

  const { data: community } = useQuery(
    ['community', match?.params.id, token],
    getCommunity
  )
  const { data: channels } = useQuery(
    ['channels', match?.params.id, token],
    getChannels,
    {
      enabled: !!hasPermissions([Permissions.READ_MESSAGES])
    }
  )
  const textChannels = useMemo(() => {
    return (channels ?? []).filter((channel) => channel?.type === 1)
  }, [channels])

  const [showEmpty, setShowEmpty] = useState(false)

  const emptyHandler = useCallback((state: boolean) => {
    setShowEmpty(state)
  }, [])

  if (!community) return <></>

  if (!hasPermissions([Permissions.READ_MESSAGES])) {
    return <NoPermission {...community} />
  }

  return (
    <>
      <EmptyCommunityHandler emptyStateChange={emptyHandler} />
      {showEmpty ? (
        <EmptyCommunity {...community} />
      ) : (
        <div className={styles.community} key={match?.params.id}>
          <Helmet>
            <title>Octii - {community.name}</title>
          </Helmet>
          {isMobile && !matchTab ? (
            <Channels.View />
          ) : !isMobile ? (
            <Channels.View />
          ) : (
            <></>
          )}
          <Suspense
            fallback={
              matchTab?.params.tab === 'settings' ? (
                <Settings.Placeholder />
              ) : matchTab?.params.tab === 'members' ? (
                <Members.Placeholder />
              ) : (
                <Chat.Placeholder />
              )
            }
          >
            <Switch>
              <PrivateRoute
                path={`${path}/settings/:tab?`}
                component={Settings.Router}
                exact
              />
              <PrivateRoute
                path={`${path}/members`}
                component={Members.View}
                exact
              />
              <PrivateRoute
                path={`${path}/channels/:channelID`}
                component={Channel}
                exact
              />
              {!isMobile && (
                <Redirect
                  path='*'
                  to={`/communities/${match?.params.id}/channels/${textChannels[0].id}`}
                />
              )}
            </Switch>
          </Suspense>
        </div>
      )}
    </>
  )
}

const CommunityProviders = () => {
  return (
    <Permission.Provider>
      <CommunityView />
    </Permission.Provider>
  )
}

const Router = () => {
  const matchTab = useRouteMatch<{ id: string; tab: string }>(
    '/communities/:id/:tab'
  )
  const isMobile = useMedia('(max-width: 740px)')
  return (
    <>
      {isMobile && !matchTab && <Sidebar />}
      <ErrorBoundary
        fallbackRender={({ error }) => {
          console.log(error)
          return <></>
        }}
      >
        <Suspense fallback={<CommunityPlaceholder />}>
          <CommunityProviders />
        </Suspense>
      </ErrorBoundary>
    </>
  )
}
export default Router

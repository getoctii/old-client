import { FC, memo, Suspense, useCallback, useEffect, useState } from 'react'
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
import Members from './integrations/Members'
import { ChannelTypes, Permissions } from '../utils/constants'
import { Helmet } from 'react-helmet-async'
import { ErrorBoundary } from 'react-error-boundary'
import { faLock } from '@fortawesome/free-solid-svg-icons'
import EmptyCommunity from './EmptyCommunity'
import { Permission } from '../utils/permissions'
import { useMemo } from 'react'
import { EditChannel } from './EditChannel'
import Error from '../components/Error'
import Products from './integrations/Products'
import Product from './integrations/product/Product'
import List from '../components/List'
import { Placeholder } from '../components/Header'
import VoiceChannel from './voice/VoiceChannel'

const NoPermission: FC<CommunityResponse> = ({ name }) => (
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

const Channel: FC = () => {
  const { id, channelID } = useParams<{ id: string; channelID: string }>()
  const auth = Auth.useContainer()
  const { data: channels } = useQuery(['channels', id, auth.token], getChannels)

  const channel = useMemo(
    () => channels?.find((channel) => channel.id === channelID),
    [channels, channelID]
  )
  if (!channel) return <></>
  return channel.type === ChannelTypes.TEXT ? (
    <Chat.Community key={channel.id} />
  ) : channel.type === ChannelTypes.VOICE ? (
    <VoiceChannel channel={channel} />
  ) : (
    <></>
  )
}

const ListPlaceholder: FC = () => {
  return (
    <div className={styles.listPlaceholder}>
      <Placeholder />
      <List.Placeholder />
    </div>
  )
}

const CommunityPlaceholder: FC = () => {
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
        ) : matchTab?.params.tab === 'members' ||
          matchTab?.params.tab === 'products' ? (
          <ListPlaceholder />
        ) : (
          <Chat.Placeholder />
        ))}
    </>
  )
}

const EmptyCommunityHandler: FC<{
  emptyStateChange: (state: boolean) => void
}> = ({ emptyStateChange }) => {
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

const CommunityChannelFallback: FC = () => {
  const { token } = Auth.useContainer()
  const match = useRouteMatch<{ id: string }>('/communities/:id')
  const { data: channels } = useQuery(
    ['channels', match?.params.id, token],
    getChannels
  )
  const textChannels = useMemo(() => {
    return (channels ?? [])
      .filter((channel) => channel?.type === 1)
      .sort((a, b) => b.order - a.order)
  }, [channels])

  return textChannels.length > 0 ? (
    <Redirect
      path='*'
      to={`/communities/${match?.params.id}/channels/${textChannels[0].id}`}
    />
  ) : (
    <></>
  )
}

const CommunityView: FC = () => {
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
              ) : matchTab?.params.tab === 'members' ||
                matchTab?.params.tab === 'products' ? (
                <ListPlaceholder />
              ) : (
                <Chat.Placeholder />
              )
            }
          >
            <Switch>
              <PrivateRoute
                path={`${path}/products/:productID`}
                render={Product}
              />
              <PrivateRoute path={`${path}/products`} render={Products} exact />

              <PrivateRoute
                path={`${path}/settings/:tab?`}
                render={Settings.Router}
                exact
              />
              <PrivateRoute path={`${path}/members`} render={Members} exact />
              <PrivateRoute
                path={`${path}/channels/:channelID`}
                render={Channel}
                exact
              />
              <PrivateRoute
                path={`${path}/channels/:channelID/settings`}
                render={EditChannel}
                exact
              />
              {!isMobile && (
                <PrivateRoute
                  render={() => (
                    <Suspense fallback={<Chat.Placeholder />}>
                      <CommunityChannelFallback />
                    </Suspense>
                  )}
                  path={'*'}
                />
              )}
            </Switch>
          </Suspense>
        </div>
      )}
    </>
  )
}

const CommunityProviders: FC = () => {
  return (
    <Permission.Provider>
      <CommunityView />
    </Permission.Provider>
  )
}

const Router: FC = () => {
  const matchTab = useRouteMatch<{ id: string; tab: string }>(
    '/communities/:id/:tab'
  )
  const isMobile = useMedia('(max-width: 740px)')
  return (
    <>
      {isMobile && !matchTab && <Sidebar />}
      <ErrorBoundary
        fallbackRender={({ error, resetErrorBoundary }) => (
          <Error
            resetErrorBoundary={resetErrorBoundary}
            error={error as any}
            className={styles.communityError}
          />
        )}
      >
        <Suspense fallback={<CommunityPlaceholder />}>
          <CommunityProviders />
        </Suspense>
      </ErrorBoundary>
    </>
  )
}
export default memo(Router)

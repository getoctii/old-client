import React, { Suspense } from 'react'
import styles from './Community.module.scss'
import Chat from '../chat/Channel'
import { Redirect, Switch, useParams, useRouteMatch } from 'react-router-dom'
import { Auth } from '../authentication/state'
import { useQuery } from 'react-query'
import Channels from './sidebar/Sidebar'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from '@fortawesome/pro-solid-svg-icons'
import Button from '../components/Button'
import Settings from './settings/Settings'
import { CommunityResponse, getCommunity } from './remote'
import { PrivateRoute } from '../authentication/PrivateRoute'
import { useMedia } from 'react-use'
import Sidebar from '../sidebar/Sidebar'
import Members from './Members'
import { ModalTypes, Permissions } from '../utils/constants'
import { Helmet } from 'react-helmet-async'
import { ErrorBoundary } from 'react-error-boundary'
import { faLock } from '@fortawesome/pro-duotone-svg-icons'
import { UI } from '../state/ui'
import { Permission } from '../utils/permissions'
import { useMemo } from 'react'

const EmptyCommunity = ({
  community,
  missingPermissions
}: {
  community: CommunityResponse
  missingPermissions?: boolean
}) => {
  const auth = Auth.useContainer()
  const ui = UI.useContainer()
  return (
    <div className={styles.communityEmpty}>
      <Helmet>
        <title>Octii - {community?.name}</title>
      </Helmet>

      {missingPermissions ? (
        <>
          <FontAwesomeIcon icon={faLock} size='4x' />
          <small>{community?.name}</small>
          <h3>
            Looks like you don't have permissions to view this community :(
          </h3>
        </>
      ) : (
        <>
          {ui.modal?.name !== ModalTypes.NEW_CHANNEL && (
            <>
              <small>{community?.name}</small>
              <h1 style={{ marginTop: 0 }}>
                <span role='img' aria-label='hands'>
                  🙌{' '}
                </span>
                Hi, this community is empty.
              </h1>
              {community?.owner_id === auth.id ? (
                <Button
                  type='button'
                  className={styles.createButton}
                  style={{ maxWidth: '300px', marginTop: 0 }}
                  onClick={() => {
                    ui.setModal({ name: ModalTypes.NEW_CHANNEL })
                  }}
                >
                  Create a Channel <FontAwesomeIcon icon={faArrowRight} />
                </Button>
              ) : (
                <></>
              )}
              <br />
              <h3>Here's a meme for now.</h3>
              <iframe
                className={styles.video}
                title='sgn'
                width='966'
                height='543'
                src='https://www.youtube.com/embed/dQw4w9WgXcQ'
                frameBorder={0}
                allow='autoplay; encrypted-media'
                allowFullScreen={false}
              />
            </>
          )}
        </>
      )}
    </div>
  )
}

const Channel = () => {
  const { id, channelID } = useParams<{ id: string; channelID: string }>()
  const auth = Auth.useContainer()
  const { data: community } = useQuery(
    ['community', id, auth.token],
    getCommunity
  )
  const channel = useMemo(
    () => community?.channels.find((channel) => channel === channelID),
    [community, channelID]
  )
  if (!channel) return <></>
  return <Chat.Community key={channel} />
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

const CommunityView = () => {
  const { path } = useRouteMatch()
  const match = useRouteMatch<{ id: string }>('/communities/:id')
  const matchTab = useRouteMatch<{ id: string; tab: string }>(
    '/communities/:id/:tab'
  )
  const isMobile = useMedia('(max-width: 740px)')

  const { community, hasPermissions } = Permission.useContainer()

  if (!community) return <></>

  if (!hasPermissions([Permissions.READ_MESSAGES])) {
    return <EmptyCommunity community={community} missingPermissions />
  }

  return (
    <>
      {community.channels.length <= 0 ? (
        <EmptyCommunity community={community} />
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
                  to={`/communities/${match?.params.id}/channels/${community.channels[0]}`}
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

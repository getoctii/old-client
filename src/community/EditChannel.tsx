import { ErrorMessage, Field, Form, Formik } from 'formik'
import { Auth } from '../authentication/state'
import Button from '../components/Button'
import Input from '../components/Input'
import {
  ChannelPermissions,
  ChannelTypes,
  clientGateway,
  ModalTypes,
  overrides,
  PermissionNames,
  supportedChannelPermissions
} from '../utils/constants'
import { BarLoader } from 'react-spinners'
import styles from './EditChannel.module.scss'
import { UI } from '../state/ui'
import { queryCache, useQuery } from 'react-query'
import { FC, useMemo, useState } from 'react'
import { ChannelResponse, getChannel, Override } from '../chat/remote'
import * as Yup from 'yup'
import { useHistory, useParams } from 'react-router-dom'
import Header from '../components/Header'
import {
  faCogs,
  faPlusCircle,
  faTimesCircle,
  faTrash,
  faUserLock
} from '@fortawesome/free-solid-svg-icons'
import { getCommunity, getGroup, getGroups } from './remote'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { BlockPicker } from 'react-color'
import { useMedia, useSet } from 'react-use'
import {
  faCheck,
  faCopy,
  faMinus,
  faTimes,
  faUndo
} from '@fortawesome/free-solid-svg-icons'
import { Permission } from '../utils/permissions'
import TextArea from '../components/TextArea'
import StatusBar from '../components/StatusBar'
import { Plugins } from '@capacitor/core'

const { Clipboard } = Plugins

const ChannelSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Too short, must be at least 2 characters.')
    .max(30, 'Too long, must be less then 30 characters.'),
  description: Yup.string()
    .min(2, 'Too short, must be at least 2 characters.')
    .max(140, 'Too long, must be less then 140 characters.')
})

const Group: FC<{
  id: string
  onClick: () => void
  plus?: boolean
  selected?: boolean
}> = ({ id, onClick, plus, selected }) => {
  const { token } = Auth.useContainer()
  const { data: group } = useQuery(['group', id, token], getGroup)
  return (
    <>
      <Button
        type={'button'}
        className={`${styles.group} ${selected ? styles.selected : ''}`}
        onClick={() => onClick()}
      >
        {group?.name}
        {plus && <FontAwesomeIcon icon={faPlusCircle} />}
      </Button>
    </>
  )
}

const EmptyOverrides: FC = () => {
  const auth = Auth.useContainer()
  const ui = UI.useContainer()
  const { id, channelID } = useParams<{ id: string; channelID: string }>()
  const { protectedGroups } = Permission.useContainer()
  const [createOverrides, setCreateOverrides] = useState(false)
  const { data: community } = useQuery(
    ['community', id, auth.token],
    getCommunity
  )
  const { data: groups } = useQuery(['groups', id, auth.token], getGroups)

  return (
    <>
      {!createOverrides ? (
        <div className={styles.emptyOverrides}>
          <FontAwesomeIcon size={'5x'} icon={faUserLock} />
          <h2>Get started with overrides!</h2>
          <p>
            Overrides allow you to restrict access to channels for specific
            groups. For example, you can make an announcements channel only
            moderators can send messages in.
          </p>
          {(groups?.length ?? 0) > 0 ? (
            <Button type='button' onClick={() => setCreateOverrides(true)}>
              Create Override <FontAwesomeIcon icon={faPlusCircle} />
            </Button>
          ) : (
            <Button
              type='button'
              onClick={() => ui.setModal({ name: ModalTypes.NEW_PERMISSION })}
            >
              Create Group <FontAwesomeIcon icon={faPlusCircle} />
            </Button>
          )}
        </div>
      ) : (
        <div className={styles.emptyOverrides}>
          <h3>Which groups would you like to add overrides for?</h3>
          <div className={styles.createGroups}>
            {groups
              ?.filter((groupID) => !protectedGroups.includes(groupID))
              ?.map((groupID) => (
                <Group
                  key={groupID}
                  id={groupID}
                  plus
                  onClick={async () => {
                    await clientGateway.post(
                      `/channels/${channelID}/overrides/${groupID}`,
                      {
                        allow:
                          community?.base_permissions?.filter((permission) =>
                            supportedChannelPermissions.includes(permission)
                          ) ?? [],
                        deny: []
                      },
                      {
                        headers: { Authorization: auth.token }
                      }
                    )
                  }}
                />
              ))}
          </div>
        </div>
      )}
    </>
  )
}

const Switch: FC<{
  permission: ChannelPermissions
  selection?: 'allow' | 'deny'
  onSwitch: (selection?: 'allow' | 'deny') => void
}> = ({ permission, selection, onSwitch }) => {
  return (
    <div className={styles.switch}>
      {PermissionNames[permission]}

      <div className={styles.groupedIcons}>
        <div
          className={`${styles.icon} ${
            selection === 'deny' ? styles.selected : ''
          }`}
          onClick={() => onSwitch('deny')}
        >
          <FontAwesomeIcon icon={faTimes} fixedWidth />
        </div>
        <div
          className={`${styles.icon} ${!selection ? styles.selected : ''}`}
          onClick={() => onSwitch()}
        >
          <FontAwesomeIcon icon={faMinus} fixedWidth />
        </div>
        <div
          className={`${styles.icon} ${
            selection === 'allow' ? styles.selected : ''
          }`}
          onClick={() => onSwitch('allow')}
        >
          <FontAwesomeIcon icon={faCheck} fixedWidth />
        </div>
      </div>
    </div>
  )
}

const PermissionOverrides: FC<
  Override & { groupID?: string; type: 'channel' | 'group' }
> = ({ allow, deny, groupID, type }) => {
  const auth = Auth.useContainer()
  const { channelID } = useParams<{ id: string; channelID: string }>()
  const [allowed, { add: addAllowed, remove: removeAllowed, has: hasAllowed }] =
    useSet<ChannelPermissions>(new Set(allow ?? []))
  const [denied, { add: addDenied, remove: removeDenied, has: hasDenied }] =
    useSet<ChannelPermissions>(new Set(deny ?? []))

  const showSave = useMemo(
    () =>
      !(
        [...allowed].every((e) => allow.includes(e)) &&
        [...denied].every((e) => deny.includes(e)) &&
        allow.every((e) => allowed.has(e)) &&
        deny.every((e) => denied.has(e))
      ),
    [allow, allowed, deny, denied]
  )

  return (
    <>
      <div className={styles.permissions}>
        {overrides.map((permission) => (
          <Switch
            key={permission}
            permission={permission}
            selection={
              hasAllowed(permission)
                ? 'allow'
                : hasDenied(permission)
                ? 'deny'
                : undefined
            }
            onSwitch={(selection) => {
              if (selection === 'allow') {
                if (!hasAllowed(permission)) addAllowed(permission)
                if (hasDenied(permission)) removeDenied(permission)
              } else if (selection === 'deny') {
                if (hasAllowed(permission)) removeAllowed(permission)
                if (!hasDenied(permission)) addDenied(permission)
              } else {
                if (hasAllowed(permission)) removeAllowed(permission)
                if (hasDenied(permission)) removeDenied(permission)
              }
            }}
          />
        ))}
      </div>

      <div className={styles.buttons}>
        {showSave && (
          <Button
            type={'button'}
            onClick={async () => {
              if (type === 'group' && groupID) {
                await clientGateway.patch(
                  `/channels/${channelID}/overrides/${groupID}`,
                  {
                    allow: Array.from(allowed),
                    deny: Array.from(denied)
                  },
                  {
                    headers: { Authorization: auth.token }
                  }
                )
                queryCache.setQueryData<ChannelResponse>(
                  ['channel', channelID, auth.token],
                  (initial) => {
                    if (initial) {
                      return {
                        ...initial,
                        overrides: {
                          ...initial.overrides,
                          [groupID]: {
                            allow: Array.from(allowed),
                            deny: Array.from(denied)
                          }
                        }
                      }
                    } else {
                      return {
                        id: channelID,
                        name: 'unknown',
                        type: ChannelTypes.TEXT,
                        order: 0,
                        overrides: {
                          [groupID]: {
                            allow: Array.from(allowed),
                            deny: Array.from(denied)
                          }
                        }
                      }
                    }
                  }
                )
              } else {
                await clientGateway.patch(
                  `/channels/${channelID}`,
                  {
                    base_allow: Array.from(allowed),
                    base_deny: Array.from(denied)
                  },
                  {
                    headers: { Authorization: auth.token }
                  }
                )
                queryCache.setQueryData<ChannelResponse>(
                  ['channel', channelID, auth.token],
                  (initial) => {
                    if (initial) {
                      return {
                        ...initial,
                        base_allow: Array.from(allowed),
                        base_deny: Array.from(denied)
                      }
                    } else {
                      return {
                        id: channelID,
                        name: 'unknown',
                        type: ChannelTypes.TEXT,
                        order: 0,
                        base_allow: Array.from(allowed),
                        base_deny: Array.from(denied)
                      }
                    }
                  }
                )
              }
            }}
          >
            Save Override
          </Button>
        )}
        {type === 'group' && (
          <Button
            type={'button'}
            className={styles.danger}
            onClick={async () => {
              await clientGateway.delete(
                `/channels/${channelID}/overrides/${groupID}`,
                {
                  headers: { Authorization: auth.token }
                }
              )
            }}
          >
            <FontAwesomeIcon icon={faTrash} />
          </Button>
        )}
      </div>
    </>
  )
}

const DefaultOverrides: FC<ChannelResponse> = ({ base_allow, base_deny }) => {
  return (
    <div className={styles.defaultOverrides}>
      <h4>Default Overrides</h4>
      <PermissionOverrides
        allow={base_allow ?? []}
        deny={base_deny ?? []}
        type='channel'
      />
    </div>
  )
}

const Overrides: FC<ChannelResponse> = ({ overrides: overrideObj }) => {
  const auth = Auth.useContainer()
  const { id, channelID } = useParams<{ id: string; channelID: string }>()
  const [overrideSelected, setOverrideSelected] = useState<string | undefined>(
    Object.keys(overrideObj ?? []).length > 0
      ? Object.keys(overrideObj ?? [])[0]
      : undefined
  )
  const { protectedGroups } = Permission.useContainer()
  const { data: community } = useQuery(
    ['community', id, auth.token],
    getCommunity
  )
  const { data: groups } = useQuery(['groups', id, auth.token], getGroups)

  const [addOverride, setAddOverride] = useState(false)
  const unusedGroups = useMemo(() => {
    return (groups ?? []).filter(
      (groupID) =>
        !Object.keys(overrideObj ?? {}).includes(groupID) &&
        !protectedGroups.includes(groupID)
    )
  }, [overrideObj, groups, protectedGroups])
  const usedGroups = useMemo(() => {
    return Object.keys(overrideObj ?? {}).filter(
      (groupID) => !protectedGroups.includes(groupID)
    )
  }, [protectedGroups, overrideObj])
  return (
    <>
      <div className={styles.groups}>
        {!addOverride &&
          usedGroups.map((groupID) => (
            <Group
              key={groupID}
              id={groupID}
              onClick={() => {
                setOverrideSelected(groupID)
              }}
              selected={overrideSelected === groupID}
            />
          ))}
        {unusedGroups.length > 0 && (
          <Button
            type={'button'}
            onClick={() => setAddOverride(!addOverride)}
            className={`${addOverride ? styles.close : styles.add} ${
              Object.keys(overrideObj ?? {}).length <= 0 ? styles.empty : ''
            }`}
          >
            {Object.keys(overrideObj ?? {}).length <= 0 ? 'Add Override' : ''}{' '}
            <FontAwesomeIcon
              icon={addOverride ? faTimesCircle : faPlusCircle}
            />
          </Button>
        )}
        {addOverride &&
          unusedGroups.map((groupID) => (
            <Group
              key={groupID}
              id={groupID}
              onClick={async () => {
                await clientGateway.post(
                  `/channels/${channelID}/overrides/${groupID}`,
                  {
                    allow:
                      community?.base_permissions?.filter((permission) =>
                        supportedChannelPermissions.includes(permission)
                      ) ?? [],
                    deny: []
                  },
                  {
                    headers: { Authorization: auth.token }
                  }
                )
              }}
            />
          ))}
      </div>
      {overrideSelected && overrideObj && (
        <PermissionOverrides
          key={overrideSelected}
          {...overrideObj[overrideSelected]}
          groupID={overrideSelected}
          type='group'
        />
      )}
    </>
  )
}

export const EditChannel: FC = () => {
  const { id, channelID } = useParams<{ id: string; channelID: string }>()
  const { token } = Auth.useContainer()
  const { protectedGroups } = Permission.useContainer()
  const ui = UI.useContainer()
  const { data: channel } = useQuery(['channel', channelID, token], getChannel)
  const isMobile = useMedia('(max-width: 740px)')
  const history = useHistory()
  return (
    <StatusBar>
      <div className={styles.editChannel}>
        <Header
          icon={faCogs}
          subheading={`#${channel?.name}`}
          heading='Edit Channel'
          onClick={() => {
            if (isMobile) history.push(`/communities/${id}`)
          }}
        />
        <Formik
          initialValues={{
            name: channel?.name ?? '',
            description: channel?.description,
            color: channel?.color
          }}
          validationSchema={ChannelSchema}
          onSubmit={async (
            values,
            { setSubmitting, setFieldError, setErrors }
          ) => {
            try {
              if (!values.name) return setFieldError('name', 'Required')
              const name = values.name
                .toString()
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^\w-]+/g, '')
                .replace(/--+/g, '-')
                .replace(/^-+/, '')
                .replace(/-+$/, '')
              await clientGateway.patch(
                `/channels/${channelID}`,
                { name, description: values.description, color: values.color },
                {
                  headers: { Authorization: token }
                }
              )
              ui.clearModal()
            } catch (e: any) {
              const errors = e.response.data.errors
              const userErrors: { name?: string } = {}
              if (errors.includes('ChannelNameInvalid'))
                userErrors.name = 'Invalid Channel Name'
              setErrors(userErrors)
              ui.clearModal()
            } finally {
              setSubmitting(false)
            }
          }}
        >
          {({ isSubmitting, values, setFieldValue }) => (
            <Form className={styles.display}>
              <div className={styles.info}>
                {channel?.type !== ChannelTypes.CATEGORY && (
                  <BlockPicker
                    colors={[
                      '#0081FF',
                      '#F47373',
                      '#37D67A',
                      '#2CCCE4',
                      '#dce775',
                      '#ff8a65',
                      '#ba68c8'
                    ]}
                    triangle={'hide'}
                    className={styles.blockPicker}
                    color={values.color}
                    onChangeComplete={(c) => {
                      setFieldValue('color', c.hex)
                    }}
                  />
                )}
                <div
                  className={`${styles.text} ${
                    channel?.type === ChannelTypes.CATEGORY
                      ? styles.category
                      : ''
                  }`}
                >
                  <h4>Display</h4>
                  <label htmlFor='name' className={styles.inputName}>
                    Name
                  </label>
                  <Field
                    component={Input}
                    id='name'
                    name='name'
                    type='name'
                    enterKeyHint='next'
                  />
                  <ErrorMessage
                    component='p'
                    className={styles.error}
                    name='name'
                  />

                  <label htmlFor='description' className={styles.inputName}>
                    Description
                  </label>
                  <TextArea name={'description'} />
                  <ErrorMessage
                    component='p'
                    className={styles.error}
                    name='description'
                  />
                </div>
              </div>
              {(values.name !== channel?.name ||
                values.description !== channel?.description ||
                values.color !== channel?.color) && (
                <Button disabled={isSubmitting} type='submit'>
                  {isSubmitting ? (
                    <BarLoader color='#ffffff' />
                  ) : (
                    'Edit Channel'
                  )}
                </Button>
              )}
            </Form>
          )}
        </Formik>

        <div className={styles.webhook}>
          <h1>Webhook</h1>
          <div className={styles.webhookRow}>
            <Input
              value={`https://gateway.octii.chat/channels/${channel?.id}/webhook/${channel?.webhook_code}`}
              disabled
            />
            <Button type={'button'}>
              <FontAwesomeIcon
                icon={faCopy}
                onClick={() => {
                  Clipboard.write({
                    string: `https://gateway.octii.chat/channels/${channel?.id}/webhook/${channel?.webhook_code}`
                  })
                }}
              />
            </Button>
            <Button
              type={'button'}
              className={styles.danger}
              onClick={async () => {
                await clientGateway.patch(
                  `/channels/${channelID}`,
                  {
                    webhook_code: true
                  },
                  {
                    headers: { Authorization: token }
                  }
                )

                await queryCache.invalidateQueries([
                  'channel',
                  channelID,
                  token
                ])
              }}
            >
              <FontAwesomeIcon icon={faUndo} />
            </Button>
          </div>
        </div>

        {Object.keys(channel?.overrides ?? {}).filter(
          (groupID) => !protectedGroups.includes(groupID)
        ).length <= 0 ? (
          <EmptyOverrides />
        ) : (
          <div className={styles.overrides}>
            <h4>Overrides</h4>
            {channel && <Overrides {...channel} />}
          </div>
        )}

        {channel && <DefaultOverrides {...channel} />}
      </div>
    </StatusBar>
  )
}

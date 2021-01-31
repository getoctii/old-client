import React, { memo, Suspense, useCallback, useMemo, useState } from 'react'
import { Editable, Slate, withReact } from 'slate-react'
import styles from './Group.module.scss'
import {
  clientGateway,
  GroupNames,
  PermissionNames,
  Permissions,
  PermissionsGroups
} from '../../../utils/constants'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheckCircle,
  faPencil,
  faTimesCircle,
  faTrash
} from '@fortawesome/pro-solid-svg-icons'
import { createEditor } from 'slate'
import { serialize } from '../../../utils/slate'
import { getGroup } from '../../remote'
import { Auth } from '../../../authentication/state'
import * as NewGroup from './NewGroup'
import Button from '../../../components/Button'
import { useMedia, useSet } from 'react-use'
import { Draggable } from '@react-forked/dnd'
import { queryCache, useQuery } from 'react-query'
import { faUsers } from '@fortawesome/pro-duotone-svg-icons'
import { Permission } from '../../../utils/permissions'

const GroupNameEditor = (group: { id: string; name: string }) => {
  const { token } = Auth.useContainer()
  const editor = useMemo(() => withReact(createEditor()), [])
  const defaultGroupName = useMemo<any[]>(
    () => [
      {
        children: [{ text: group.name ?? 'unknown' }]
      }
    ],
    [group.name]
  )
  const [name, setName] = useState<any[]>(defaultGroupName)

  return (
    <>
      <Slate editor={editor} value={name} onChange={(value) => setName(value)}>
        <Editable
          className={styles.changeName}
          onKeyDown={async (event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              await clientGateway.patch(
                `/groups/${group.id}`,
                { name: serialize(name) },
                {
                  headers: { Authorization: token }
                }
              )
            }
          }}
          placeholder='Group Name'
        />
      </Slate>
      {serialize(name) !== (group.name ?? 'unknown') ? (
        <FontAwesomeIcon
          icon={faCheckCircle}
          onClick={async () => {
            await clientGateway.patch(
              `/groups/${group.id}`,
              { name: serialize(name) },
              {
                headers: { Authorization: token }
              }
            )
          }}
        />
      ) : (
        ''
      )}
    </>
  )
}

const PermissionsEditor = ({
  id,
  permissions,
  base
}: {
  id: string
  permissions: Permissions[]
  base?: boolean
}) => {
  const { token } = Auth.useContainer()
  const [set, { add, remove, has, reset }] = useSet<Permissions>(
    new Set(permissions ?? [])
  )
  const { hasPermissions } = Permission.useContainer()
  const serverPermissions = useMemo(() => new Set(permissions ?? []), [
    permissions
  ])

  const showSave = useMemo(
    () =>
      !(
        serverPermissions.size === set.size &&
        [...serverPermissions].every((e) => set.has(e)) &&
        [...set].every((e) => serverPermissions.has(e))
      ),
    [serverPermissions, set]
  )

  return (
    <div className={styles.permissions}>
      {Object.entries(PermissionsGroups).map(([group, permissions]) => (
        <div key={group}>
          {/* @ts-ignore */}
          <h5>{GroupNames[+group]}</h5>
          <ul className={styles.list}>
            {permissions.map(
              (permission) =>
                hasPermissions([permission], true) && (
                  <NewGroup.PermissionToggle
                    key={permission}
                    name={PermissionNames[permission]}
                    toggled={has(permission)}
                    type={+group}
                    onToggle={(val) =>
                      val ? add(permission) : remove(permission)
                    }
                  />
                )
            )}
          </ul>
        </div>
      ))}

      {!!showSave && (
        <div className={styles.action}>
          <Button
            type='button'
            className={styles.discard}
            onClick={() => reset()}
          >
            Discard Changes
          </Button>
          <Button
            type='submit'
            onClick={async () => {
              await clientGateway.patch(
                base ? `/communities/${id}` : `/groups/${id}`,
                base
                  ? { base_permissions: Array.from(set) }
                  : { permissions: Array.from(set) },
                {
                  headers: { Authorization: token }
                }
              )
              if (base) {
                await queryCache.invalidateQueries(['community', id])
              }
            }}
            className={styles.save}
          >
            Save Changes
          </Button>
        </div>
      )}
    </div>
  )
}

const DraggableGroup = memo(({ id, index }: { id: string; index: number }) => {
  const { protectedGroups } = Permission.useContainer()

  const draggableChild = useCallback(
    (provided, snapshot) => (
      <div
        className={`${styles.draggable} ${
          !!snapshot.isDragging ? styles.dragging : ''
        }`}
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        style={provided.draggableProps.style}
      >
        <Suspense fallback={<Group.Placeholder />}>
          <GroupCard id={id} base={false} />
          {provided.placeholder}
        </Suspense>
      </div>
    ),
    [id]
  )
  return (
    <Draggable
      draggableId={id}
      index={index}
      isDragDisabled={!!protectedGroups.includes(id)}
    >
      {draggableChild}
    </Draggable>
  )
})

const GroupCard = ({ id, base }: { id?: string; base?: boolean }) => {
  const { token } = Auth.useContainer()
  const { data: group } = useQuery(['group', id, token], getGroup, {
    enabled: !base && !!id
  })

  const isMobile = useMedia('(max-width: 740px)')
  const [edit, setEdit] = useState<boolean>(false)
  const { protectedGroups, community } = Permission.useContainer()

  return (
    <>
      <div
        className={`${styles.card} ${!!base ? styles.base : ''} ${
          !!edit ? styles.edit : ''
        }`}
      >
        <div className={styles.icon}>
          {base && <FontAwesomeIcon icon={faUsers} fixedWidth />}
        </div>
        <div className={styles.info}>
          {edit && !base && !!id ? (
            <GroupNameEditor id={id} name={group?.name ?? 'unknown'} />
          ) : (
            <span>{base ? 'Base Group' : group?.name ?? 'unknown'}</span>
          )}
        </div>
        {!isMobile && (!!base || (!!id && !protectedGroups.includes(id))) && (
          <div
            className={styles.actions}
            style={{
              gridTemplateColumns: `repeat(${edit && !base ? '2' : '1'}, 46px)`
            }}
          >
            {edit && !base && (
              <Button
                type='button'
                onClick={async () => {
                  await clientGateway.delete(`/groups/${id}`, {
                    headers: { Authorization: token }
                  })
                }}
              >
                <FontAwesomeIcon icon={faTrash} />
              </Button>
            )}
            <Button type='button' onClick={() => setEdit(!edit)}>
              <FontAwesomeIcon icon={edit ? faTimesCircle : faPencil} />
            </Button>
          </div>
        )}
      </div>
      {edit && (!!base || (!!id && !protectedGroups?.includes(id))) && (
        <PermissionsEditor
          id={base ? community?.id! : id!}
          permissions={
            base ? community?.base_permissions ?? [] : group?.permissions ?? []
          }
          base={base}
        />
      )}
    </>
  )
}

const GroupPlaceholder = ({ className }: { className?: string }) => {
  const name = useMemo(() => Math.floor(Math.random() * 5) + 3, [])
  return (
    <div className={`${styles.placeholder} ${className ? className : ''}`}>
      <div className={styles.icon} />
      <div className={styles.name} style={{ width: `${name}rem` }} />
    </div>
  )
}

const Group = {
  Draggable: DraggableGroup,
  Card: GroupCard,
  Placeholder: GroupPlaceholder
}

export default Group

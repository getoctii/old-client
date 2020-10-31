import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { ContextMenu, ContextMenuTrigger, MenuItem } from 'react-contextmenu'
import styles from './Context.module.scss'

const Context = ({
  id,
  children,
  items
}: {
  id: string
  children: React.ReactNode
  items: {
    text: string
    icon: IconProp
    danger?: boolean
    onClick: () => void
  }[]
}) => {
  return (
    <div className={styles.wrapper}>
      <ContextMenuTrigger key='trigger' id={id}>
        {children}
      </ContextMenuTrigger>
      <ContextMenu key='context' id={id} className={styles.menu}>
        {items.map(({ text, icon, danger, onClick }, index) => (
          <>
            {danger && <hr />}
            <MenuItem
              key={`${index}-${id}`}
              onClick={() => onClick()}
              className={danger ? styles.danger : ''}
            >
              <span>{text}</span>
              <FontAwesomeIcon icon={icon} fixedWidth />
            </MenuItem>
          </>
        ))}
      </ContextMenu>
    </div>
  )
}

export default Context

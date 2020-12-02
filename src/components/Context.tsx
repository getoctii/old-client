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
    onClick: (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => void
  }[]
}) => {
  return (
    <div className={styles.wrapper} key={id}>
      <ContextMenuTrigger key='trigger' id={id}>
        {children}
      </ContextMenuTrigger>
      <ContextMenu key='menu' id={id} className={styles.menu}>
        {items.map(({ text, icon, danger, onClick }, index) => (
          <React.Fragment key={`${index}-${id}`}>
            {danger && <hr key={`hr-${id}`} />}
            <MenuItem
              key={`${index}-${id}`}
              onClick={onClick}
              className={danger ? styles.danger : ''}
            >
              <span>{text}</span>
              <FontAwesomeIcon icon={icon} fixedWidth />
            </MenuItem>
          </React.Fragment>
        ))}
      </ContextMenu>
    </div>
  )
}

export default Context

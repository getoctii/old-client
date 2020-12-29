import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useEffect } from 'react'
import { ContextMenuItems, UI } from '../state/ui'
import styles from './Context.module.scss'

export const Global = () => {
  const { contextMenu, setContextMenu } = UI.useContainer()
  const handleClick = () => {
    if (contextMenu) {
      setContextMenu(null)
    }
  }
  const handleResize = () => {
    if (contextMenu) {
      setContextMenu(null)
    }
  }
  useEffect(() => {
    window.addEventListener('resize', handleResize)
    window.addEventListener('mousedown', handleClick)
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousedown', handleClick)
    }
  })

  return <></>
}

export const Menu = ({
  position,
  items
}: {
  position: {
    top?: number
    left: number
    bottom?: number
  }
  items: ContextMenuItems
}) => {
  const { setContextMenu } = UI.useContainer()

  return (
    <div
      key={Math.random() * 100}
      className={styles.menu}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        bottom: `${position.bottom}px`
      }}
    >
      {items.map(({ text, icon, danger, onClick }, index) => (
        <React.Fragment key={index}>
          {danger && <hr />}
          <div
            className={danger ? styles.danger : ''}
            onMouseDown={(event) => {
              console.log('Click')
              event.persist()
              event.stopPropagation()
              if (event.buttons === 1) {
                onClick(event)
                setContextMenu(null)
              }
            }}
          >
            <span>{text}</span>
            <FontAwesomeIcon icon={icon} fixedWidth />
          </div>
        </React.Fragment>
      ))}
    </div>
  )
}

export const Wrapper = ({
  children,
  items
}: {
  children: React.ReactNode
  items: ContextMenuItems
}) => {
  const { setContextMenu } = UI.useContainer()

  return (
    <div
      className={styles.wrapper}
      onMouseDown={(event) => {
        event.persist()
        event.stopPropagation()
        if (event.buttons === 1) {
          setContextMenu(null)
        }
      }}
    >
      <div
        style={{ zIndex: 2 }}
        onMouseDown={(event) => {
          if (event.buttons === 2) {
            console.log(
              event.currentTarget.clientHeight,
              event.pageY,
              window.innerHeight
            )
            const itemsSize = items.length * 34 + 15
            if (window.innerHeight - (event.pageY + itemsSize) < 20) {
              setContextMenu({
                position: {
                  bottom: 10,
                  left: event.pageX,
                  top: undefined
                },
                items
              })
            } else {
              setContextMenu({
                position: {
                  top: event.pageY,
                  left: event.pageX,
                  bottom: undefined
                },
                items
              })
            }
            // if (window.screen.height - (event.pageY))
          }
        }}
      >
        {children}
      </div>
    </div>
  )
}

const Context = { Menu, Wrapper, Global }

export default Context

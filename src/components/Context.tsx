import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { isPlatform } from '@ionic/react'
import React, { useCallback, useEffect, useState } from 'react'
import { ContextMenuItems, UI } from '../state/ui'
import styles from './Context.module.scss'
import { ActionSheetOptionStyle, Plugins } from '@capacitor/core'

const { Modals } = Plugins

export const Global = () => {
  const { contextMenu, setContextMenu } = UI.useContainer()
  const handleClick = useCallback(() => {
    if (contextMenu) {
      setContextMenu(null)
    }
  }, [contextMenu, setContextMenu])
  const handleResize = useCallback(() => {
    if (contextMenu) {
      setContextMenu(null)
    }
  }, [contextMenu, setContextMenu])
  useEffect(() => {
    if (!isPlatform('mobile')) {
      window.addEventListener('resize', handleResize)
      window.addEventListener('mousedown', handleClick)
    }
    return () => {
      if (!isPlatform('mobile')) {
        window.removeEventListener('resize', handleResize)
        window.removeEventListener('mousedown', handleClick)
      }
    }
  }, [handleClick, handleResize])

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
  title,
  message,
  children,
  items
}: {
  title: string
  message?: string
  children: React.ReactNode
  items: ContextMenuItems
}) => {
  const { setContextMenu } = UI.useContainer()
  const [touchTimeout, setTouchTimeout] = useState<any>()
  return (
    <div
      className={styles.wrapper}
      onMouseDown={(event) => {
        event.persist()
        event.stopPropagation()
        if (event.buttons === 1 && !isPlatform('mobile')) {
          setContextMenu(null)
        }
      }}
    >
      <div
        style={{ zIndex: 2 }}
        onTouchStart={(event) => {
          console.log('start')
          if (isPlatform('mobile')) {
            event.preventDefault()
            setTouchTimeout(
              setTimeout(() => {
                Modals.showActions({
                  title,
                  message,
                  options: [
                    ...items.map((item) => ({
                      title: item.text,
                      style: item.danger
                        ? ActionSheetOptionStyle.Destructive
                        : ActionSheetOptionStyle.Default
                    })),
                    {
                      title: 'Cancel',
                      style: ActionSheetOptionStyle.Cancel
                    }
                  ]
                }).then(async (action) => {
                  if (action.index + 1 <= items.length) {
                    await items[action.index].onClick(undefined)
                  }
                })
              }, 500)
            )
          }
        }}
        onTouchEnd={() => {
          console.log('end')
          if (touchTimeout && isPlatform('mobile')) {
            clearTimeout(touchTimeout)
            setTouchTimeout(undefined)
          }
        }}
        onMouseDown={(event) => {
          console.log(event.buttons)
          if (event.buttons === 2 && !isPlatform('mobile')) {
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

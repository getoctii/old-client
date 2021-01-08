import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { useState } from 'react'
import { createContainer } from 'unstated-next'
import { ModalTypes } from '../utils/constants'

export interface ContextMenuItem {
  text: string
  icon: IconProp
  danger?: boolean
  onClick: (event?: React.MouseEvent) => void
}

export type ContextMenuItems = ContextMenuItem[]

const useUI = () => {
  const [modal, setModal] = useState<
    { name: ModalTypes; props?: any } | undefined
  >(undefined)
  const [contextMenu, setContextMenu] = useState<{
    position: { top?: number; left: number; bottom?: number }
    items: ContextMenuItems
  } | null>(null)
  return {
    modal,
    setModal,
    contextMenu,
    setContextMenu,
    clearModal: () => setModal(undefined)
  }
}

export const UI = createContainer(useUI)

import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { useState } from 'react'
import { createContainer } from 'unstated-next'

export interface ContextMenuItem {
  text: string
  icon: IconProp
  danger?: boolean
  onClick: (event: React.MouseEvent) => void
}

export type ContextMenuItems = ContextMenuItem[]

const useUI = () => {
  const [modal, setModal] = useState<{ name: string; props?: any }>({
    name: '',
    props: null
  })
  const [contextMenu, setContextMenu] = useState<{
    position: { top?: number; left: number; bottom?: number }
    items: ContextMenuItems
  } | null>(null)
  return {
    modal,
    setModal,
    contextMenu,
    setContextMenu,
    clearModal: () => setModal({ name: '', props: {} })
  }
}

export const UI = createContainer(useUI)

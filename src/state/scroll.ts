import { useState } from 'react'
import { createContainer } from '@innatical/innstate'

const useScrollPosition = () => {
  const sidebarScrollPosition = useState<{
    x: number
    y: number
  }>({ x: 0, y: 0 })
  const conversationScrollPosition = useState<{
    x: number
    y: number
  }>({ x: 0, y: 0 })
  return {
    sidebar: sidebarScrollPosition,
    conversation: conversationScrollPosition
  }
}

export const ScrollPosition = createContainer(useScrollPosition)

import { useState } from 'react'
import { createContainer } from 'unstated-next'

const useScrollPosition = () => {
  const scrollPosition = useState<{
    x: number
    y: number
  }>({ x: 0, y: 0 })
  return scrollPosition
}

export const ScrollPosition = createContainer(useScrollPosition)

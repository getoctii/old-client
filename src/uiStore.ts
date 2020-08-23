import { useState, useMemo } from 'react'
import decode from 'jwt-decode'
import { createContainer } from 'unstated-next'

const useUI = () => {
  const [modal, setModal] = useState<string>('')
  return { modal, setModal }
}

export const UI = createContainer(useUI)

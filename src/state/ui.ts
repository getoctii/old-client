import { useState } from 'react'
import { createContainer } from 'unstated-next'

const useUI = () => {
  const [modal, setModal] = useState<{ name: string; props?: any }>({
    name: '',
    props: null
  })
  return {
    modal,
    setModal,
    clearModal: () => setModal({ name: '', props: {} })
  }
}

export const UI = createContainer(useUI)

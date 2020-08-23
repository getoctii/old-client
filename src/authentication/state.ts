import { useState, useMemo } from 'react'
import decode from 'jwt-decode'
import { createContainer } from 'unstated-next'

const useAuth = () => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('neko-token') || null
  )
  const authenticated = !!token
  const id = useMemo<string | null>(
    () => (token ? (decode(token) as any).sub : null),
    [token]
  )
  return { token, id, authenticated, setToken }
}

export const Auth = createContainer(useAuth)

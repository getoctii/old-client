import { useState, useMemo, useEffect } from 'react'
import decode from 'jwt-decode'
import { createContainer } from 'unstated-next'

const useAuth = () => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('neko-token') || null
  )
  const authenticated = !!token
  const payload = useMemo<{ sub: string; exp: number } | null>(
    () => (token ? (decode(token) as any) : null),
    [token]
  )
  // TODO: Check every second for token expiry
  useEffect(() => {
    if (payload?.exp && payload.exp <= Math.floor(Date.now() / 1000)) {
      setToken(null)
      localStorage.removeItem('neko-token')
    }
  }, [payload])

  return { token, id: payload?.sub ?? null, authenticated, setToken }
}

export const Auth = createContainer(useAuth)

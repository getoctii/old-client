import { useState, useMemo, useEffect } from 'react'
import decode from 'jwt-decode'
import { createContainer } from 'unstated-next'
import { clientGateway } from '../utils/constants'
import { queryCache } from 'react-query'

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

  useEffect(() => {
    // @ts-ignore
    window.octiiStatus = async (title: string) => {
      if (!token || !payload?.sub) return 'failed'
      await clientGateway.patch(
        `/users/${payload.sub}`,
        new URLSearchParams({
          status: title
        }),
        {
          headers: {
            authorization: token
          }
        }
      )

      queryCache.invalidateQueries(['users', payload.sub])

      return 'success'
    }
  }, [token, payload])
  return { token, id: payload?.sub ?? null, authenticated, setToken }
}

export const Auth = createContainer(useAuth)

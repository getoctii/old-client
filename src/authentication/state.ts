import { useMemo, useEffect, useState } from 'react'
import decode from 'jwt-decode'
import { createContainer } from 'unstated-next'
import { clientGateway } from '../utils/constants'
import { queryCache } from 'react-query'
import { useSuspenseStorageItem } from '../utils/storage'

const useAuth = () => {
  const [token, setToken] = useSuspenseStorageItem<string | null>(
    'neko-token',
    null
  )
  const [betaCode, setBetaCode] = useState<string | undefined>(undefined)

  const authenticated = !!token
  const payload = useMemo<{ sub: string; exp: number } | undefined>(
    () => (token ? (decode(token) as any) : null),
    [token]
  )

  useEffect(() => {
    if (payload?.exp && payload.exp <= Math.floor(Date.now() / 1000))
      setToken(null)
  }, [payload, setToken])

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

      await queryCache.invalidateQueries(['users', payload.sub])

      return 'success'
    }
  }, [token, payload])
  return {
    id: payload?.sub ?? null,
    authenticated,
    token: token || null,
    setToken,
    betaCode,
    setBetaCode
  }
}

export const Auth = createContainer(useAuth)

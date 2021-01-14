import { Plugins } from '@capacitor/core'
import { useCallback } from 'react'
import { queryCache, useQuery } from 'react-query'

export const useSuspenseStorageItem = <T>(
  key: string,
  initialValue?: T
): [T | undefined, (value: T) => void] => {
  const { data } = useQuery<T>(
    ['storage', key, initialValue],
    async (_: string, key: string, initialValue: T) => {
      const { value } = await Plugins.Storage.get({ key })
      if (!value && !initialValue) return initialValue
      else if (!value && initialValue) {
        await Plugins.Storage.set({
          key,
          value:
            typeof value === 'string' ? value : JSON.stringify(initialValue)
        })
        return initialValue
      } else if (value) {
        if (value === 'undefined' || value === 'null') return undefined
        try {
          return JSON.parse(value)
        } catch {
          return value
        }
      } else {
        return null
      }
    }
  )

  const setValue = useCallback(
    async (value: T) => {
      console.log(key)
      try {
        console.log(typeof value === 'string' ? value : JSON.stringify(value))
        await Plugins.Storage.set({
          key,
          value: typeof value === 'string' ? value : JSON.stringify(value)
        })

        queryCache.setQueryData(['storage', key, initialValue], value)
      } catch (error) {
        console.error(error)
      }
    },
    [key, initialValue]
  )

  return [data, setValue]
}

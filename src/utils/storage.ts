import { Plugins } from '@capacitor/core'
import { queryCache, useMutation, useQuery } from 'react-query'

export const useSuspenseStorageItem = <T>(
  key: string,
  initialValue?: T
): [T | undefined, (value: T) => void] => {
  const { data } = useQuery<T>(
    ['storage', key, initialValue],
    async (_: string, key: string, initialValue: T) => {
      const { value } = await Plugins.Storage.get({ key })

      if (!value && initialValue) {
        await Plugins.Storage.set({
          key,
          value:
            typeof value === 'string' ? value : JSON.stringify(initialValue)
        })
        return initialValue
      } else if (value) {
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

  const [setValue] = useMutation(async (value: T) => {
    await Plugins.Storage.set({
      key,
      value: typeof value === 'string' ? value : JSON.stringify(initialValue)
    })

    queryCache.setQueryData(['storage', key, initialValue], value)
  })

  return [data, setValue]
}

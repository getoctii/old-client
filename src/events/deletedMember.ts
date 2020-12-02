import { useEffect } from 'react'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { queryCache } from 'react-query'
import { Events } from '../utils/constants'
import { log } from '../utils/logging'
import { Auth } from '../authentication/state'

const useDeletedMember = (eventSource: EventSourcePolyfill | null) => {
  const { id, token } = Auth.useContainer()

  useEffect(() => {
    if (!eventSource) return
    const handler = (e: MessageEvent) => {
      const member = JSON.parse(e.data)
      log('Events', 'purple', 'DELETED_MEMBER')
      queryCache.setQueryData(['communities', id, token], (initial) => {
        if (initial instanceof Array) {
          return initial.filter((m: any) => m.id !== member.id)
        } else return initial
      })
    }

    eventSource.addEventListener(Events.DELETED_MEMBER, handler)

    return () => {
      eventSource.removeEventListener(Events.DELETED_MEMBER, handler)
    }
  }, [eventSource, id, token])
}

export default useDeletedMember

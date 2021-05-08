import { useEffect } from 'react'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { Events } from '../utils/constants'
import { queryCache } from 'react-query'
import { log } from '../utils/logging'
import { Auth } from '../authentication/state'
import { MessageResponse } from '../chat/remote'
import { ExportedEncryptedMessage } from '@innatical/inncryption/dist/types'
import { getKeychain } from '../user/remote'
import {
  decryptMessage,
  importEncryptedMessage,
  importPublicKey
} from '@innatical/inncryption'
import { Keychain } from '../keychain/state'

const useUpdatedMessage = (eventSource: EventSourcePolyfill | null) => {
  const { id, token } = Auth.useContainer()
  const { keychain } = Keychain.useContainer()

  useEffect(() => {
    if (!eventSource) return
    const handler = async (e: MessageEvent) => {
      const event = JSON.parse(e.data) as {
        id: string
        channel_id: string
        content: string
        updated_at: string
        encrypted_content: ExportedEncryptedMessage
        self_encrypted_content: ExportedEncryptedMessage
      }
      log('Events', 'purple', 'UPDATED_MESSAGE')

      const initial = queryCache.getQueryData([
        'messages',
        event.channel_id,
        token
      ])
      if (initial instanceof Array) {
        queryCache.setQueryData(
          ['messages', event.channel_id, token],
          await Promise.all(
            initial.map(
              async (sub) =>
                await Promise.all(
                  sub.map(async (msg: MessageResponse) => {
                    if (msg.id === event.id) {
                      const otherKeychain = await queryCache.fetchQuery(
                        ['keychain', msg.author_id, token],
                        getKeychain
                      )

                      const publicKey = await queryCache.fetchQuery(
                        ['publicKey', otherKeychain?.signing.publicKey],
                        async (_: string, key: number[]) => {
                          if (!key) return undefined
                          return await importPublicKey(key, 'signing')
                        }
                      )

                      await queryCache.fetchQuery(
                        [
                          'messageContent',
                          event?.content ??
                            (msg.author_id === id
                              ? event.self_encrypted_content
                              : event?.encrypted_content),
                          publicKey,
                          keychain
                        ],
                        async () => {
                          const content =
                            event?.content ??
                            (msg.author_id === id
                              ? event.self_encrypted_content
                              : event?.encrypted_content)
                          if (typeof content === 'string') {
                            return content
                          } else {
                            if (!publicKey || !keychain || !content) return ''
                            try {
                              const decrypted = await decryptMessage(
                                keychain,
                                publicKey,
                                importEncryptedMessage(content)
                              )

                              if (decrypted.verified) {
                                return decrypted.message
                              } else {
                                return '*The sender could not be verified...*'
                              }
                            } catch {
                              return '*Message could not be decrypted*'
                            }
                          }
                        }
                      )

                      return {
                        ...msg,
                        content: event.content,
                        updated_at: event.updated_at,
                        encrypted_content: event.encrypted_content,
                        self_encrypted_content: event.self_encrypted_content
                      }
                    } else {
                      return msg
                    }
                  })
                )
            )
          )
        )
      }
    }

    eventSource.addEventListener(Events.UPDATED_MESSAGE, handler)

    return () => {
      eventSource.removeEventListener(Events.UPDATED_MESSAGE, handler)
    }
  }, [eventSource, id, token, keychain])
}

export default useUpdatedMessage

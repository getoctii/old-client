declare module 'event-source-polyfill' {
  import { Events } from './constants'
  export class EventSourcePolyfill extends EventSource {
    constructor(url: string, options: { headers: { [key: string]: string } })

    addEventListener(name: Events, handler: (E: MessageEvent) => void)
    removeEventListener(name: Events, handler: (E: MessageEvent) => void)
  }
}

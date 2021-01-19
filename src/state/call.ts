import { useState, useEffect, useCallback } from 'react'
import { createContainer } from 'unstated-next'
import Peer from 'peerjs'
import { clientGateway } from '../utils/constants'
import { Auth } from '../authentication/state'
import { useSuspenseStorageItem } from '../utils/storage'

const useCall = () => {
  const { token } = Auth.useContainer()
  const [peer] = useState(
    new Peer({
      host: 'signaling.octii.chat',
      secure: true
    })
  )
  const [peerID, setPeerID] = useState<null | string>(null)
  const [sessionID, setSessionID] = useState<null | string>(null)
  const [callState, setCallState] = useState<
    'idle' | 'ringing' | 'waiting' | 'connected'
  >('idle')
  const [, setOtherPeerID] = useState<null | string>(null)
  const [otherUserID, setOtherUserID] = useState<null | string>(null)
  const [call, setCall] = useState<null | Peer.MediaConnection>(null)
  const [inputStream, setInputStream] = useState<null | MediaStream>(null)
  const [stream, setStream] = useState<null | MediaStream>(null)
  const [muted, setMuted] = useSuspenseStorageItem<boolean>(
    'voice-muted',
    false
  )
  const [deafened, setDeafened] = useSuspenseStorageItem<boolean>(
    'voice-deafened',
    false
  )

  useEffect(() => {
    if (inputStream && !muted) {
      inputStream?.getTracks().forEach((track) => (track.enabled = true))
    } else if (inputStream && muted) {
      inputStream?.getTracks().forEach((track) => (track.enabled = false))
    }
  }, [muted, inputStream])

  useEffect(() => {
    if (stream && !deafened) {
      stream?.getTracks().forEach((track) => (track.enabled = true))
    } else if (inputStream && deafened) {
      stream?.getTracks().forEach((track) => (track.enabled = false))
    }
  }, [deafened, stream, inputStream])

  const endCall = useCallback(() => {
    call?.close()
    inputStream?.getTracks().forEach((track) => track.stop())

    setCallState('idle')
    setInputStream(null)
    setOtherPeerID(null)
    setOtherUserID(null)
    setSessionID(null)
    setCall(null)
    setStream(null)
  }, [call, inputStream])

  useEffect(() => {
    if (!call) return
    const handler = () => {
      console.log('call ended')
      endCall()
    }

    call.on('close', handler)

    return () => {
      call.off('close', handler)
    }
  }, [call, endCall])

  useEffect(() => {
    console.log('call', call)
    if (!call) return
    const handler = (stream: MediaStream) => {
      setCallState('connected')
      setStream(stream)
    }

    call.on('stream', handler)

    return () => {
      call.off('stream', handler)
    }
  }, [call])

  useEffect(() => {
    const handler = (id: string) => {
      setPeerID(id)
    }

    peer.on('open', handler)

    return () => {
      peer.off('open', handler)
    }
  }, [peer])

  useEffect(() => console.log('sessionID', sessionID), [sessionID])

  useEffect(() => {
    const handler = async (call: Peer.MediaConnection) => {
      console.log('CALL EVENT', call)
      setCall(call)
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false
        })
        setInputStream(stream)
        call.answer(stream)
      } catch (error) {
        console.log(error)
        const stream = new MediaStream()
        setInputStream(stream)
        call.answer(stream)
      }
    }

    peer.on('call', handler)

    return () => {
      peer.off('call', handler)
    }
  }, [peer])

  const ringUser = useCallback(
    async (userID: string) => {
      if (!peerID) return
      const sentSessionID = (
        await clientGateway.post(
          '/voice',
          { recipient: userID, peer_id: peerID },
          {
            headers: {
              authorization: token
            }
          }
        )
      ).data.id
      setSessionID(sentSessionID)
      setOtherUserID(userID)
      setCallState('ringing')
    },
    [peerID, token]
  )

  const acceptRequest = useCallback(
    async (sessionID: string, userID: string, receivedPeerID: string) => {
      if (!peerID) return
      await clientGateway.post(
        `/voice/${sessionID}/accept`,
        { peer_id: peerID },
        {
          headers: {
            authorization: token
          }
        }
      )
      setOtherPeerID(receivedPeerID)
      setOtherUserID(userID)
      setSessionID(sessionID)
      setCallState('waiting')
    },
    [peerID, token]
  )

  const establishCall = useCallback(
    async (sentSessionID: string, receivedPeerID: string) => {
      console.log(sentSessionID, sessionID)
      if (sentSessionID !== sessionID) return
      setOtherPeerID(receivedPeerID)
      setCallState('waiting')
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false
        })
        setInputStream(stream)
        setCall(peer.call(receivedPeerID, stream))
      } catch (error) {
        console.log(error)
        const stream = new MediaStream()
        setInputStream(stream)
        setCall(peer.call(receivedPeerID, stream))
      }
    },
    [sessionID, peer]
  )

  return {
    ringUser,
    acceptRequest,
    establishCall,
    endCall,
    callState,
    stream,
    otherUserID,
    deafened,
    setDeafened,
    muted,
    setMuted,
    sessionID
  }
}

export const Call = createContainer(useCall)

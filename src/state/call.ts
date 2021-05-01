import { createContainer } from '@innatical/innstate'
import { useCallback, useEffect, useState } from 'react'

const useCall = () => {
  const [room, setRoom] = useState<{
    id: string
    token: string
    server: string
    channelID: string
  } | null>()
  const [socket, setSocket] = useState<WebSocket | null>()
  const [socketReady, setSocketReady] = useState(false)
  const [connection, setConnection] = useState<RTCPeerConnection | null>()
  const [state, setConnectionState] = useState<RTCIceConnectionState | null>()
  const [localStream, setLocalSteam] = useState<MediaStream | null>()
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>()
  const [audio] = useState(new Audio())
  const [muted, setMuted] = useState(false)
  const [deafened, setDeafened] = useState(false)

  useEffect(() => {
    if (!room) return

    const params = new URLSearchParams({
      room: room.id,
      authorization: room.token
    })
    setSocket(new WebSocket(room.server + '?' + params.toString()))

    return () => {
      setSocket(null)
      setSocketReady(false)
    }
  }, [room])

  useEffect(() => {
    if (!socket) return
    return () => {
      socket.close()
    }
  }, [socket])

  useEffect(() => {
    if (!socket) return
    const cb = () => {
      setSocketReady(true)
    }

    socket.addEventListener('open', cb)

    return () => {
      socket.removeEventListener('open', cb)
    }
  }, [socket])

  useEffect(() => {
    if (!socket || !connection || !socketReady) return
    const cb = async (message: MessageEvent) => {
      const payload: { type: string; data: any } = JSON.parse(
        message.data.toString()
      )
      switch (payload.type) {
        case 'SDP':
          if (
            payload.data.type === 'offer' &&
            connection.signalingState !== 'stable'
          ) {
            await Promise.all([
              connection.setLocalDescription({ type: 'rollback' }),
              connection.setRemoteDescription(payload.data)
            ])
          } else {
            await connection.setRemoteDescription(payload.data)
          }
          if (payload.data.type === 'offer') {
            await connection.setLocalDescription(
              await connection.createAnswer()
            )
            socket.send(
              JSON.stringify({
                type: 'SDP',
                data: connection.localDescription
              })
            )
          }
          break
        case 'ICE':
          await connection.addIceCandidate(payload.data)
      }
    }

    socket.addEventListener('message', cb)

    return () => {
      socket.removeEventListener('message', cb)
    }
  }, [socket, connection, socketReady])

  useEffect(() => {
    if (!socket || !socketReady) return
    const connection = new RTCPeerConnection({
      iceServers: [
        {
          urls: ['stun:stun.l.google.com:19302']
        }
      ]
    })

    setConnection(connection)

    return () => {
      setConnection(null)
    }
  }, [socket, socketReady])

  useEffect(() => {
    if (!connection) return

    return () => {
      connection.close()
      setConnectionState(null)
    }
  }, [connection])

  useEffect(() => {
    if (!socket || !connection) return
    const cb = (c: RTCPeerConnectionIceEvent) => {
      socket.send(
        JSON.stringify({
          data: c.candidate,
          type: 'ICE'
        })
      )
    }

    connection.addEventListener('icecandidate', cb)

    return () => {
      connection.removeEventListener('icecandidate', cb)
    }
  }, [socket, connection])

  useEffect(() => {
    if (!socket || !connection) return
    const cb = async () => {
      const offer = await connection.createOffer()
      if (connection.signalingState !== 'stable') return
      await connection.setLocalDescription(offer)
      socket.send(
        JSON.stringify({
          type: 'SDP',
          data: connection.localDescription
        })
      )
    }

    connection.addEventListener('negotiationneeded', cb)

    return () => {
      connection.removeEventListener('negotiationneeded', cb)
    }
  }, [socket, connection])

  useEffect(() => {
    if (!connection) return
    const cb = () => {
      console.log(connection.iceConnectionState)
      setConnectionState(connection.iceConnectionState)
    }

    connection.addEventListener('iceconnectionstatechange', cb)

    return () => {
      connection.removeEventListener('iceconnectionstatechange', cb)
    }
  }, [connection])

  useEffect(() => {
    if (!connection) return
    ;(async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      })
      setLocalSteam(stream)
    })()

    return () => {
      setLocalSteam(null)
    }
  }, [connection])

  useEffect(() => {
    if (!connection) return
    setRemoteStream(new MediaStream())

    return () => {
      setRemoteStream(null)
    }
  }, [connection])

  useEffect(() => {
    if (!connection || !remoteStream) return
    const cb = (track: RTCTrackEvent) => {
      console.log(track)
      remoteStream.addTrack(track.track)
    }

    connection.addEventListener('track', cb)

    return () => {
      connection.removeEventListener('track', cb)
    }
  }, [connection, remoteStream])

  useEffect(() => {
    if (!localStream || !connection) return

    localStream.getTracks().forEach((track) => connection.addTrack(track))
  }, [localStream, connection])

  useEffect(() => {
    if (!localStream || !connection) return
    const cb = (track: MediaStreamTrackEvent) => {
      connection.addTrack(track.track)
    }

    localStream.addEventListener('addtrack', cb)

    return () => {
      localStream.removeEventListener('addtrack', cb)
    }
  }, [localStream, connection])

  useEffect(() => {
    if (!remoteStream || !audio) return
    audio.srcObject = remoteStream
    audio.play().catch(() => {})

    return () => {
      audio.srcObject = null
      audio.pause()
    }
  }, [remoteStream, audio])

  useEffect(() => {
    if (!localStream) return
    if (muted) {
      localStream.getTracks().forEach((track) => (track.enabled = false))
    } else {
      localStream.getTracks().forEach((track) => (track.enabled = true))
    }
  }, [muted, localStream])

  useEffect(() => {
    if (!remoteStream) return
    if (deafened) {
      remoteStream.getTracks().forEach((track) => (track.enabled = false))
    } else {
      remoteStream.getTracks().forEach((track) => (track.enabled = true))
    }
  }, [deafened, remoteStream])

  const play = useCallback(async () => {
    return await audio.play()
  }, [audio])

  return {
    setMuted,
    setDeafened,
    muted,
    deafened,
    setRoom,
    state,
    play,
    room
  }
}

export const Call = createContainer(useCall)

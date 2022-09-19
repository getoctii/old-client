import { createContainer } from '@innatical/innstate'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Auth } from '../authentication/state'

declare global {
  interface MediaDevices {
    getDisplayMedia(constraints?: MediaStreamConstraints): Promise<MediaStream>
  }

  // if constraints config still lose some prop, you can define it by yourself also
  interface MediaTrackConstraintSet {
    displaySurface?: ConstrainDOMString
    logicalSurface?: ConstrainBoolean
    // more....
  }
}

const preferCodec = (codecs: RTCRtpCodecCapability[], mimeType: string) => {
  const otherCodecs: RTCRtpCodecCapability[] = []
  const sortedCodecs: RTCRtpCodecCapability[] = []

  codecs.forEach((codec) => {
    if (codec.mimeType === mimeType) {
      sortedCodecs.push(codec)
    } else {
      otherCodecs.push(codec)
    }
  })

  return sortedCodecs.concat(otherCodecs)
}

const changeVideoCodec = (conection: RTCPeerConnection, mimeType: string) => {
  const transceivers = conection.getTransceivers()

  transceivers.forEach((transceiver) => {
    const kind = transceiver.sender.track?.kind
    if (!kind) return

    let sendCodecs = RTCRtpSender.getCapabilities(kind)?.codecs
    let recvCodecs = RTCRtpReceiver.getCapabilities(kind)?.codecs
    if (!sendCodecs || !recvCodecs) return

    if (kind === 'video') {
      sendCodecs = preferCodec(sendCodecs, mimeType)
      recvCodecs = preferCodec(recvCodecs, mimeType)
      // @ts-ignore
      transceiver.setCodecPreferences([...sendCodecs, ...recvCodecs])
    }
  })

  if (conection.onnegotiationneeded) {
    conection.onnegotiationneeded(new Event('onnegotiationneeded'))
  }
}

const useCall = () => {
  const [room, setRoom] =
    useState<{
      id: string
      token: string
      server: string
      channelID?: string
      conversationID?: string
    } | null>()
  const [socket, setSocket] = useState<WebSocket | null>()
  const [connection, setConnection] = useState<RTCPeerConnection | null>()
  const connectionRef = useRef<RTCPeerConnection | null>()
  const [state, setConnectionState] = useState<RTCIceConnectionState | null>()
  const [localStream, setLocalSteam] = useState<MediaStream | null>()
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>()
  const [remoteVideoTracks, setRemoteVideoTracks] =
    useState<MediaStreamTrack[] | null>()
  const [audio] = useState(new Audio())
  const [muted, setMuted] = useState(false)
  const [deafened, setDeafened] = useState(false)
  const [screenStream, setScreenStream] = useState<MediaStream | null>()
  const senders = useRef<Map<MediaStreamTrack, RTCRtpSender>>(new Map())
  const mediaStreamIdentifiers = useRef<Record<string, string>>({})
  const [speaking, setSpeaking] = useState<Record<string, Set<string>>>({})
  const { id } = Auth.useContainer()

  useEffect(() => {
    if (!room) return

    const params = new URLSearchParams({
      room: room.id,
      authorization: room.token
    })
    setSocket(new WebSocket(room.server + '?' + params.toString()))

    return () => {
      setSocket(null)
      setConnection(null)
      connectionRef.current = null
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
    const cb = (message: MessageEvent) => {
      const payload: {
        type: string
        data: any
        streams: Record<string, string>
      } = JSON.parse(message.data.toString())
      const connection = connectionRef.current
      switch (payload.type) {
        case 'SDP':
          if (!connection) return
          ;(async () => {
            mediaStreamIdentifiers.current = payload.streams
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
          })()
          break
        case 'ICE':
          if (!connection) return
          ;(async () => {
            await connection.addIceCandidate(payload.data)
          })()
          break
        case 'STATE':
          if (payload.data === 'ready') {
            const connection = new RTCPeerConnection({
              iceServers: [
                {
                  urls: ['stun:stun.l.google.com:19302']
                }
              ]
            })
            connectionRef.current = connection
            setConnection(connection)
          }
      }
    }

    socket.addEventListener('message', cb)

    return () => {
      socket.removeEventListener('message', cb)
    }
  }, [socket, connection])

  useEffect(() => {
    if (!connection) return

    return () => {
      connection.close()
      setConnectionState(null)
      senders.current = new Map()
      mediaStreamIdentifiers.current = {}
      setScreenStream(null)
    }
  }, [connection, senders])

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
    setRemoteVideoTracks([])

    return () => {
      setRemoteStream(null)
      setRemoteVideoTracks(null)
    }
  }, [connection])

  useEffect(() => {
    if (!connection || !remoteStream || !remoteVideoTracks) return
    const cb = (track: RTCTrackEvent) => {
      const userID = mediaStreamIdentifiers.current[track.streams[0].id]

      if (track.track.kind === 'audio') {
        console.log('user', userID)
        remoteStream.addTrack(track.track)

        const context = new AudioContext()
        const analyzer = context.createAnalyser()

        setInterval(() => {
          const dataArray = new Uint8Array(analyzer.frequencyBinCount)
          analyzer.getByteFrequencyData(dataArray)
          const trackActive =
            dataArray.reduce((a, b) => a + b) / dataArray.length > 0
          setSpeaking((speaking) => {
            const set = speaking[userID] ?? new Set()

            if (trackActive) {
              if (set.has(track.track.id)) return speaking
              set.add(track.track.id)
            } else {
              if (!set.has(track.track.id)) return speaking
              set.delete(track.track.id)
            }

            return {
              ...speaking,
              [userID]: set
            }
          })
        }, 30)

        const stream = new MediaStream()
        stream.addTrack(track.track)

        context.createMediaStreamSource(stream).connect(analyzer)
        context.createMediaStreamDestination()
      } else if (track.track.kind === 'video') {
        setRemoteVideoTracks([...remoteVideoTracks, track.track])
      }
    }

    connection.addEventListener('track', cb)

    return () => {
      connection.removeEventListener('track', cb)
    }
  }, [connection, remoteStream, remoteVideoTracks])

  useEffect(() => {
    if (!localStream || !connection) return

    localStream.getTracks().forEach((track) => {
      const context = new AudioContext()
      const analyzer = context.createAnalyser()

      setInterval(() => {
        const dataArray = new Uint8Array(analyzer.frequencyBinCount)
        analyzer.getByteFrequencyData(dataArray)
        const trackActive =
          dataArray.reduce((a, b) => a + b) / dataArray.length > 0
        setSpeaking((speaking) => {
          const set = speaking[id ?? ''] ?? new Set()

          if (trackActive) {
            if (set.has(track.id)) return speaking
            set.add(track.id)
          } else {
            if (!set.has(track.id)) return speaking
            set.delete(track.id)
          }

          return {
            ...speaking,
            [id ?? '']: set
          }
        })
      }, 30)

      const stream = new MediaStream()
      stream.addTrack(track)

      context.createMediaStreamSource(stream).connect(analyzer)
      context.createMediaStreamDestination()

      senders.current.set(track, connection.addTrack(track, localStream))
    })

    return () => {
      localStream.getTracks().forEach((track) => {
        track.stop()
        const sender = senders.current.get(track)
        if (sender) connection.removeTrack(sender)
      })
    }
  }, [localStream, connection, senders])

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
      localStream.getAudioTracks().forEach((track) => (track.enabled = false))
    } else {
      localStream.getAudioTracks().forEach((track) => (track.enabled = true))
    }
  }, [muted, localStream])

  useEffect(() => {
    if (!remoteStream) return
    if (deafened) {
      remoteStream.getAudioTracks().forEach((track) => (track.enabled = false))
    } else {
      remoteStream.getAudioTracks().forEach((track) => (track.enabled = true))
    }
  }, [deafened, remoteStream])

  const play = useCallback(async () => {
    return await audio.play()
  }, [audio])

  const shareScreen = useCallback(async () => {
    setScreenStream(await navigator.mediaDevices.getDisplayMedia())
  }, [])

  useEffect(() => {
    if (!screenStream || !connection) return
    screenStream
      .getTracks()
      .forEach((track) =>
        senders.current.set(track, connection.addTrack(track))
      )

    // @ts-ignore
    if (window.chrome)
      changeVideoCodec(connection, 'video/webm; codecs="vp9, vorbis"')

    const addTrack = (track: MediaStreamTrackEvent) => {
      senders.current.set(track.track, connection.addTrack(track.track))
      // @ts-ignore
      if (window.chrome)
        changeVideoCodec(connection, 'video/webm; codecs="vp9, vorbis"')
    }
    const removeTrack = (track: MediaStreamTrackEvent) => {
      const sender = senders.current.get(track.track)
      if (sender) {
        connection.removeTrack(sender)
        senders.current.delete(track.track)
      }
    }

    screenStream.addEventListener('addtrack', addTrack)
    screenStream.addEventListener('removetrack', removeTrack)

    return () => {
      screenStream.removeEventListener('addtrack', addTrack)
      screenStream.removeEventListener('removetrack', removeTrack)
      screenStream.getTracks().forEach((track) => {
        const sender = senders.current.get(track)
        if (sender) connection.removeTrack(sender)
      })
    }
  }, [screenStream, connection])

  useEffect(() => {
    if (!screenStream) return
    return () => {
      screenStream.getTracks().forEach((track) => track.stop())
    }
  }, [screenStream])

  const sharingScreen = useMemo(() => !!screenStream, [screenStream])

  return {
    setMuted,
    setDeafened,
    muted,
    deafened,
    setRoom,
    state,
    play,
    room,
    shareScreen,
    sharingScreen,
    setScreenStream,
    remoteVideoTracks,
    speaking
  }
}

export const Call = createContainer(useCall)

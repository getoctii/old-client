import { faDownload, faPause, faPlay } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FC } from 'react'
import { useAudio } from 'react-use'
import Button from '../../components/Button'
import styles from './Audio.module.scss'

const isCovfefe = (url: string) =>
  /^https:\/\/file\.coffee\/u\/[a-zA-Z0-9_-]{7,14}\.(aac|flac|m4a|mp3|ogg|wav|mpeg)/g.test(
    url
  )

const secondsToTimestamp = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  return `${minutes}:${Math.floor(seconds - minutes * 60)
    .toString()
    .padStart(2, '0')}`
}

const AudioEmbed: FC<{ url: string }> = ({ url }) => {
  const [audio, state, controls] = useAudio({
    src: url
  })

  return (
    <div className={styles.audioEmbed}>
      {audio}
      <Button
        type='button'
        className={styles.downloadButton}
        onClick={() => window.open(url)}
      >
        <FontAwesomeIcon icon={faDownload} width={'20px'} />
      </Button>

      <Button
        type='button'
        onClick={() => (state.paused ? controls.play() : controls.pause())}
      >
        <FontAwesomeIcon icon={state.paused ? faPlay : faPause} />
      </Button>

      <div className={styles.stack}>
        <span>
          {secondsToTimestamp(state.time)}/{secondsToTimestamp(state.duration)}
        </span>
        <input
          value={state.time}
          max={state.duration}
          onChange={(e) => controls.seek(e.target.valueAsNumber)}
          step='any'
          type='range'
        />
      </div>
    </div>
  )
}

const Audio = {
  Embed: AudioEmbed,
  isCovfefe
}

export default Audio

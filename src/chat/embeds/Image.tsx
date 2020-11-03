import React from 'react'
import styles from './Image.module.scss'

const isCovfefe = (url: string) =>
  /^https:\/\/file\.coffee\/u\/[a-zA-Z0-9_-]{7,14}\.(png|jpeg|jpg|gif)/g.test(
    url
  )

const Embed = ({ url }: { url: string }) => {
  const matches = url.match(
    /^https:\/\/file\.coffee\/u\/[a-zA-Z0-9_-]{7,14}\.(png|jpeg|jpg|gif)$/g
  )
  return matches && matches[0] ? (
    <div className={styles.imageEmbed}>
      <img alt='chat' src={matches[0]} />
    </div>
  ) : (
    <></>
  )
}

export default { Embed, isCovfefe }

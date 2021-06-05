import { faDiscord, faTwitter } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FC } from 'react'
import styles from './Footer.module.scss'

const Footer: FC = () => {
  return (
    <div className={styles.footer}>
      <div className={styles.socials}>
        <a
          target='_blank'
          rel='noopener noreferrer'
          href='https://twitter.com/innatical'
          title='Twitter'
        >
          <FontAwesomeIcon icon={faTwitter} />
        </a>
        <a
          target='_blank'
          rel='noopener noreferrer'
          href='https://discord.gg/XTFJF5pNSG '
          title='Discord'
        >
          <FontAwesomeIcon icon={faDiscord} />
        </a>
      </div>
      <p>
        Made with{' '}
        <span role='img' aria-label='heart'>
          ❤️
        </span>{' '}
        in Minnesota & California
      </p>
      <h3>© 2021 Innatical</h3>
    </div>
  )
}

export default Footer

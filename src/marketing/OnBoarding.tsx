import { faChevronCircleRight } from '@fortawesome/pro-duotone-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { motion } from 'framer-motion'
import React, { useState } from 'react'
import { Auth } from '../authentication/state'
import Button from '../components/Button'
import { clientGateway } from '../utils/constants'
import { useSuspenseStorageItem } from '../utils/storage'
import styles from './OnBoarding.module.scss'

const cards = [
  {
    id: 'simple',
    title: 'Simple',
    subtitle: 'The chat experince is desgined to be as simple as possible.'
  },
  {
    id: 'private',
    title: 'Private',
    subtitle:
      'Here at Innatical, we believe that privacy is a fundamental human right. We will never track or sell any of your data to any 3rd parties. And with our open-source end-to-end encryption for DMs, you can be assured that your data is safe with us.'
  },
  {
    id: 'extensible',
    title: 'Extensible',
    subtitle:
      'Octii integrations let developers create anything they can imagine, including themes, games, moderation tools, and other experiences. '
  }
]

const Welcome = ({ onClick }: { onClick: () => void }) => {
  return (
    <div className={styles.container}>
      <h1>Welcome to Octii!</h1>
      <p>
        You are about to enter a<br />
        new era of chat…
      </p>
      <div className={styles.cards}>
        {cards.map((card) => (
          <>
            <motion.div className={styles.card}>{card.title}</motion.div>
          </>
        ))}
      </div>

      <Button type='button' onClick={() => onClick()}>
        Get Started <FontAwesomeIcon icon={faChevronCircleRight} />
      </Button>
    </div>
  )
}

const OctiiTesters = ({ onClick }: { onClick: () => void }) => {
  const auth = Auth.useContainer()
  return (
    <div className={styles.octiiTesters}>
      <h1>Octii Testers</h1>
      <p>
        The offical community for reporting bugs and feedback directly to us,
        the developers of Octii.
      </p>
      <Button
        type='button'
        onClick={async () => {
          await clientGateway.post(
            `/invites/ca088277-8de7-4818-91e0-cfe5aa094f44/use`,
            {},
            { headers: { Authorization: auth.token } }
          )
          onClick()
        }}
      >
        Join Octii Testers
      </Button>
      <Button className={styles.skip} type='button' onClick={() => onClick()}>
        Skip
      </Button>
    </div>
  )
}

const Disclosure = () => {
  const [, setOnboardingComplete] = useSuspenseStorageItem<boolean>(
    'onboarding-complete',
    false
  )
  return (
    <div className={styles.disclosure}>
      <h1>Beta Disclosure</h1>
      <p>
        The following product is currently in limited beta, expect app-breaking
        bugs or incomplete features.
      </p>

      <Button
        type='button'
        onClick={() => {
          setOnboardingComplete(true)
        }}
      >
        I understand
      </Button>
    </div>
  )
}

const OnBoarding = () => {
  const [page, setPage] = useState(0)
  return (
    <div className={styles.onboarding}>
      {page === 0 && <Welcome onClick={() => setPage(1)} />}
      {page === 1 && <OctiiTesters onClick={() => setPage(2)} />}
      {page === 2 && <Disclosure />}
    </div>
  )
}

export default OnBoarding

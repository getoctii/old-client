import React from 'react'
import styles from './Navbar.module.scss'

export const Navbar = ({
  selected,
  setSelected
}: {
  selected: string
  setSelected: Function
}) => {
  return (
    <ul className={styles.navbar}>
      <li
        onClick={() => setSelected('general')}
        className={selected === 'general' ? styles.selected : ''}
      >
        General
      </li>
      <li
        onClick={() => setSelected('invites')}
        className={selected === 'invites' ? styles.selected : ''}
      >
        Invites
      </li>
    </ul>
  )
}

import React, { useState } from 'react'
import { General } from './General'
import Invites from './Invites'
import { Navbar } from './Navbar'
import styles from './Settings.module.scss'

export const Settings = () => {
  const [selected, setSelected] = useState('general')
  return (
    <div className={styles.settings}>
      <h2>Settings</h2>
      <Navbar selected={selected} setSelected={setSelected} />
      {selected === 'general' && <General />}
      {selected === 'invites' && <Invites />}
    </div>
  )
}

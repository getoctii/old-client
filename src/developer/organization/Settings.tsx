import React, { useState } from "react";
import styles from "./Settings.module.scss";
import IconPicker from "../../components/IconPicker";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave } from "@fortawesome/pro-duotone-svg-icons";

const Personalization = () => {
  const [saveName, setSaveName] = useState<string | undefined>(undefined)
  return (
    <div className={styles.card}>
      <h5>Personalization</h5>
      <div className={styles.personalization}>
        <div className={styles.icon}>
          <label htmlFor='icon' className={styles.inputName}>
            Icon
          </label>
          <IconPicker
            alt={'Pornhub'}
            defaultIcon={'https://file.coffee/u/fGpSBEutgA.png'}
            onUpload={async () => {}}
          />
        </div>
        <div className={styles.name}>
          <label htmlFor='name' className={styles.inputName}>
            Name
          </label>
          <div className={styles.nameInput}>
            <Input
              defaultValue={'Pornhub'}
              onChange={(event) => {
                if (event.target.value !== '') {
                  setSaveName(event.target.value)
                }
              }}
              />
            {saveName && 'Pornhub' !== saveName && (
              <Button
                type='button'>
                <FontAwesomeIcon icon={faSave} />
              </Button>
            )}
          </div>
        </div>
        <ul>
          <li>- Must be 2-16 long</li>
          <li>- Can only be letters, numbers, dashes, and underscores.</li>
        </ul>
      </div>
    </div>
  )
}

const Settings = () => {
  return <Personalization/>
}

export default Settings
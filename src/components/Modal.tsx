import React, { useEffect } from 'react'
import styles from './Modal.module.scss'
import { AnimatePresence, motion } from 'framer-motion'
import { useMedia } from 'react-use'
import { ModalTypes } from '../utils/constants'
import AddParticipant from '../chat/AddParticipant'
import { Confirmation } from './Confirmation'
import Incoming from '../call/Incoming'
import { NewCommunity } from '../sidebar/NewCommunity'
import NewConversation from '../conversation/NewConversation'
import { NewGroup } from '../community/settings/groups/NewGroup'
import Image from '../chat/embeds/Image'
import Status from './Status'
import { NewChannel } from '../community/NewChannel'
import NewInvite from '../community/NewInvite'
import ManageGroups from '../community/ManageGroups'
import { UI } from '../state/ui'
import { Permission } from '../utils/permissions'
import { Update } from './Update'
import { EditChannel } from '../community/EditChannel'

const ResolveModal = ({ name, props }: { name: ModalTypes; props?: any }) => {
  const isMobile = useMedia('(max-width: 740px)')
  switch (name) {
    case ModalTypes.ADD_PARTICIPANT:
      return <AddParticipant {...props} />
    case ModalTypes.DELETE_MESSAGE:
      return <Confirmation {...props} />
    case ModalTypes.INCOMING_CALL:
      return !isMobile ? <Incoming {...props} /> : <></>
    case ModalTypes.NEW_COMMUNITY:
      return <NewCommunity />
    case ModalTypes.NEW_CONVERSATION:
      return <NewConversation />
    case ModalTypes.NEW_PERMISSION:
      return <NewGroup />
    case ModalTypes.PREVIEW_IMAGE:
      return <Image.Preview {...props} />
    case ModalTypes.STATUS:
      return <Status />
    case ModalTypes.NEW_CHANNEL:
      return <NewChannel />
    case ModalTypes.NEW_INVITE:
      return <NewInvite />
    case ModalTypes.DELETE_CHANNEL:
      return <Confirmation {...props} />
    case ModalTypes.MANAGE_MEMBER_GROUPS:
      return <ManageGroups {...props} />
    case ModalTypes.UPDATE:
      return <Update />
    case ModalTypes.EDIT_CHANNEL:
      return <EditChannel {...props} />
    default:
      return <></>
  }
}

const Modal = () => {
  const uiStore = UI.useContainer()
  const isMobile = useMedia('(max-width: 740px)')
  useEffect(() => {
    // @ts-ignore
    window.setModal = uiStore.setModal
  }, [uiStore])
  return (
    <Permission.Provider>
      <AnimatePresence exitBeforeEnter>
        {uiStore.modal &&
          (!isMobile || uiStore.modal.name !== ModalTypes.INCOMING_CALL) && (
            <motion.div
              className={`${styles.modal} ${
                !uiStore.modal ? styles.hidden : ''
              }`}
            >
              <motion.div
                initial={{
                  opacity: 0
                }}
                animate={{
                  opacity: 1
                }}
                exit={{
                  opacity: 0
                }}
                className={styles.background}
                onClick={() =>
                  uiStore.modal?.name !== ModalTypes.UPDATE &&
                  uiStore.clearModal()
                }
              />
              <motion.div
                drag={'y'}
                dragMomentum={false}
                dragConstraints={{
                  top: 0,
                  bottom: 0
                }}
                dragElastic={0}
                onDrag={(e, info) => {
                  if (info.offset.y > 120) {
                    uiStore.clearModal()
                  }
                }}
                variants={{
                  initialModel: {
                    scale: 0
                  },
                  initialPopover: {
                    top: '100vh'
                  },
                  animateModel: {
                    scale: 1
                  },
                  animatePopover: {
                    top: '0'
                  }
                }}
                initial={'initialModel'}
                animate={'animateModel'}
                transition={{
                  type: 'spring',
                  duration: 0.25,
                  bounce: 0.5
                }}
                exit={'initialModel'}
                {...(isMobile && {
                  initial: 'initialPopover',
                  animate: 'animatePopover',

                  transition: {
                    type: ' ',
                    duration: 0.5,
                    bounce: 0,
                    when: 'afterChildren'
                  },
                  exit: 'initialPopover'
                })}
                className={styles.content}
              >
                <ResolveModal {...uiStore.modal} />
              </motion.div>
            </motion.div>
          )}
      </AnimatePresence>
    </Permission.Provider>
  )
}

export default Modal

import { FC, useEffect } from 'react'
import styles from './Modals.module.scss'
import { AnimatePresence, motion } from 'framer-motion'
import { useMedia } from 'react-use'
import { ModalTypes } from '../utils/constants'
import AddParticipant from '../chat/AddParticipant'
import { Confirmation } from './Confirmation'
import { NewCommunity } from '../sidebar/NewCommunity'
import NewConversation from '../conversation/NewConversation'
import { NewGroup } from '../community/settings/groups/NewGroup'
import File from '../chat/embeds/File'
import NewChannel from '../community/NewChannel'
import NewInvite from '../community/NewInvite'
import ManageGroups from '../community/ManageGroups'
import { UI } from '../state/ui'
import { Permission } from '../utils/permissions'
import Update from './Update'
import Status from './Status'
import AddFriend from '../hub/friends/AddFriend'
import NewProduct from '../community/integrations/NewProduct'
import NewResource from '../community/integrations/product/pages/NewResource'
import NewVersion from '../community/integrations/product/pages/NewVersion'
import PreviewUser from '../user/PreviewUser'
import GenerateKeychain from '../keychain/GenerateKeychain'
import DecryptKeychain from '../keychain/DecryptKeychain'
import MFAModal from '../authentication/MFAModal'
import CodePrompt from '../authentication/CodePrompt'
import Ringing from '../call/Ringing'
import AddIntegration from '../community/AddIntegration'

const ResolveModal = ({ name, props }: { name: ModalTypes; props?: any }) => {
  switch (name) {
    case ModalTypes.ADD_PARTICIPANT:
      return <AddParticipant {...props} />
    case ModalTypes.DELETE_MESSAGE:
      return <Confirmation {...props} />
    case ModalTypes.DEVELOPER_MODE:
      return <Confirmation {...props} />
    case ModalTypes.NEW_COMMUNITY:
      return <NewCommunity />
    case ModalTypes.NEW_CONVERSATION:
      return <NewConversation />
    case ModalTypes.NEW_PERMISSION:
      return <NewGroup />
    case ModalTypes.PREVIEW_IMAGE:
      return <File.Preview {...props} />
    case ModalTypes.NEW_CHANNEL:
      return <NewChannel />
    case ModalTypes.NEW_INVITE:
      return <NewInvite />
    case ModalTypes.NEW_PRODUCT:
      return <NewProduct />
    case ModalTypes.DELETE_CHANNEL:
      return <Confirmation {...props} />
    case ModalTypes.MANAGE_MEMBER_GROUPS:
      return <ManageGroups {...props} />
    case ModalTypes.UPDATE:
      return <Update />
    case ModalTypes.ADD_FRIEND:
      return <AddFriend />
    case ModalTypes.NEW_RESOURCE:
      return <NewResource />
    case ModalTypes.NEW_VERSION:
      return <NewVersion />
    case ModalTypes.PREVIEW_USER:
      return <PreviewUser {...props} />
    case ModalTypes.GENERATE_KEYCHAIN:
      return <GenerateKeychain />
    case ModalTypes.DECRYPT_KEYCHAIN:
      return <DecryptKeychain />
    case ModalTypes.ENABLED_2FA:
      return <MFAModal {...props} />
    case ModalTypes.CODE_PROMPT:
      return <CodePrompt {...props} />
    case ModalTypes.RINGING:
      return <Ringing {...props} />
    case ModalTypes.ADD_INTEGRATION:
      return <AddIntegration />
    default:
      return <></>
  }
}

const Modals: FC = () => {
  const uiStore = UI.useContainer()
  const isMobile = useMedia('(max-width: 740px)')
  useEffect(() => {
    // @ts-ignore
    window.setModal = uiStore.setModal
  }, [uiStore])
  if (!uiStore.modal) return <></>
  return (
    <Permission.Provider>
      <AnimatePresence exitBeforeEnter>
        {uiStore.modal.name !== ModalTypes.STATUS ? (
          !isMobile && (
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
                  uiStore.modal?.name !== ModalTypes.DECRYPT_KEYCHAIN &&
                  uiStore.modal?.name !== ModalTypes.CODE_PROMPT &&
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
                    uiStore.modal?.name !== ModalTypes.UPDATE &&
                      uiStore.modal?.name !== ModalTypes.DECRYPT_KEYCHAIN &&
                      uiStore.modal?.name !== ModalTypes.CODE_PROMPT &&
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
                className={`${styles.content} ${
                  uiStore.modal.rounded ?? true ? styles.rounded : ''
                }`}
              >
                <ResolveModal {...uiStore.modal} />
              </motion.div>
            </motion.div>
          )
        ) : uiStore.modal.name === ModalTypes.STATUS ? (
          <Status />
        ) : (
          <></>
        )}
      </AnimatePresence>
    </Permission.Provider>
  )
}

export default Modals

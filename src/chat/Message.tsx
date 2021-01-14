import React, {
  memo,
  useMemo,
  Suspense,
  useCallback,
  useState,
  useEffect
} from 'react'
import styles from './Message.module.scss'
import dayjs from 'dayjs'
import dayjsUTC from 'dayjs/plugin/utc'
import dayjsCalendar from 'dayjs/plugin/calendar'
import {
  faCopy,
  faTrashAlt,
  IconDefinition
} from '@fortawesome/pro-solid-svg-icons'
import { Plugins, PermissionType } from '@capacitor/core'
import { Auth } from '../authentication/state'
import { useMutation, useQuery } from 'react-query'
import { clientGateway, ModalTypes } from '../utils/constants'
import { getUser, UserResponse } from '../user/remote'
import { Measure } from './embeds/Measure'
import Context from '../components/Context'
import Audio from './embeds/Audio'
import Image from './embeds/Image'
import useMarkdown from '@innatical/markdown'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCatSpace,
  faTimesCircle,
  faUserNinja,
  faUserShield
} from '@fortawesome/pro-duotone-svg-icons'
import { ErrorBoundary } from 'react-error-boundary'
import { UI } from '../state/ui'
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons'
import { Editable, RenderLeafProps, Slate, withReact } from 'slate-react'
import { withHistory } from 'slate-history'
import { emptyEditor, serialize, withMentions } from '../utils/slate'
import { createEditor, Range, Node, Editor, Text, Transforms } from 'slate'
import { Message as MessageType, patchMessage } from './remote'
import Box from './Box'
import unified from 'unified'
import markdown from 'remark-parse'
import visit from 'unist-util-visit'
import gfm from 'remark-gfm'
// @ts-ignore
import underlineSyntax from '@innatical/micromark-extension-underline'
// @ts-ignore
import underlineFromMarkdown from '@innatical/mdast-util-underline/from-markdown'
// @ts-ignore
import underlineToMarkdown from '@innatical/mdast-util-underline/to-markdown'
const { Clipboard, Permissions } = Plugins
dayjs.extend(dayjsUTC)
dayjs.extend(dayjsCalendar)

type Embed = {
  embed: React.ReactNode
  link: React.ReactNode
}

const isEmbed = (element: any): element is Embed => {
  return typeof element === 'object' && element['embed'] && element['link']
}

const Mention = ({
  userID,
  selected
}: {
  userID: string
  selected?: boolean
}) => {
  const { token, id } = Auth.useContainer()
  const user = useQuery(['users', userID, token], getUser)
  return (
    <span
      className={`${styles.mention} ${userID === id ? styles.isMe : ''} ${
        selected ? styles.selected : ''
      }`}
    >
      @{user.data?.username}
    </span>
  )
}

const EditBox = ({
  id,
  authorID,
  content,
  onDismiss
}: {
  id: string
  authorID: string
  content: string
  onDismiss: () => void
}) => {
  const { token } = Auth.useContainer()
  const editor = useMemo(
    () => withHistory(withReact(withMentions(createEditor()))),
    []
  )
  const [value, setValue] = useState<Node[]>([
    {
      children: [{ text: content }]
    }
  ])
  const [target, setTarget] = useState<Range | undefined>()
  const [search, setSearch] = useState('')

  const renderElement = useCallback((props) => {
    switch (props.element.type) {
      case 'mention':
        return (
          <Box.Mention
            attributes={props.attributes}
            children={props.children}
            userID={props.element.mentionID}
          />
        )
      default:
        return <span {...props.attributes}>{props.children}</span>
    }
  }, [])
  const [selected, setSelected] = useState(0)

  const mentionable = useMemo(() => [], [])

  const onMention = useCallback(
    (id: string) => {
      if (!target) return
      Transforms.select(editor, target)
      Transforms.insertNodes(editor, {
        type: 'mention',
        mentionID: id,
        children: [
          {
            text: `<@${id}>`
          }
        ]
      })
      editor.insertText(' ')
      Transforms.move(editor)
      setTarget(undefined)
    },
    [editor, target]
  )

  const [filtered, setFiltered] = useState<UserResponse[]>([])

  const onFiltered = useCallback((users: UserResponse[]) => {
    setFiltered(users)
  }, [])

  useEffect(() => {
    setSelected(0)
  }, [target, filtered])

  const decorate = useCallback(([node, path]) => {
    const ranges: {
      anchor: {
        path: any
        offset: number
      }
      focus: {
        path: any
        offset: number
      }
      [key: string]: any
    }[] = []
    if (!Text.isText(node)) return ranges
    const tree = unified()
      .use(markdown)
      .use(gfm, { singleTilde: false })
      .use(function underline() {
        const data: any = this.data()
        const add = (field: string, value: any) => {
          if (data[field]) data[field].push(value)
          else data[field] = [value]
        }

        add('micromarkExtensions', underlineSyntax())
        add('fromMarkdownExtensions', underlineFromMarkdown)
        add('toMarkdownExtensions', underlineToMarkdown)
      })
      .parse(node.text)

    visit(
      tree,
      ['strong', 'emphasis', 'code', 'delete', 'underline', 'link'],
      (node) => {
        if (
          node.type === 'strong' ||
          node.type === 'emphasis' ||
          node.type === 'delete' ||
          node.type === 'underline'
        ) {
          ranges.push({
            [node.type]: true,
            anchor: {
              path,
              offset: (node.children as any)[0].position?.start.offset ?? 0
            },
            focus: {
              path,
              offset: (node.children as any)[0].position?.end.offset ?? 0
            }
          })
        } else {
          ranges.push({
            [node.type]: true,
            anchor: {
              path,
              offset: node.position?.start.offset ?? 0
            },
            focus: {
              path,
              offset: node.position?.end.offset ?? 0
            }
          })
        }
      }
    )
    return ranges
  }, [])

  const renderLeaf = useCallback(
    (props: RenderLeafProps) => <Box.Leaf {...props} />,
    []
  )
  return (
    <div className={styles.innerInput}>
      <Slate
        editor={editor}
        value={value}
        onChange={(value) => {
          setValue(value)
          const { selection } = editor

          if (selection && Range.isCollapsed(selection)) {
            const [start] = Range.edges(selection)
            const characterBefore = Editor.before(editor, start, {
              unit: 'character'
            })
            const wordBefore = Editor.before(editor, start, {
              unit: 'word'
            })
            const before =
              characterBefore &&
              Editor.string(
                editor,
                Editor.range(editor, characterBefore, start)
              ) === '@'
                ? characterBefore
                : wordBefore && Editor.before(editor, wordBefore)
            const beforeRange = before && Editor.range(editor, before, start)
            const beforeText = beforeRange && Editor.string(editor, beforeRange)
            const beforeMatch = beforeText && beforeText.match(/^@(\w*)$/)
            const after = Editor.after(editor, start)
            const afterRange = Editor.range(editor, start, after)
            const afterText = Editor.string(editor, afterRange)
            const afterMatch = afterText.match(/^(\s|$)/)

            if (beforeMatch && afterMatch) {
              setTarget(beforeRange)
              setSearch(beforeMatch[1])
              return
            }

            setTarget(undefined)
          }
        }}
      >
        <Editable
          className={styles.input}
          spellCheck
          renderLeaf={renderLeaf}
          renderElement={renderElement}
          decorate={decorate}
          onKeyDown={async (event) => {
            switch (event.key) {
              case 'Escape': {
                event.preventDefault()
                onDismiss()
                break
              }
              case 'Enter': {
                if (event.shiftKey) {
                  event.preventDefault()
                  editor.insertBreak()
                } else if (target) {
                  event.preventDefault()
                  if (filtered[selected].id) onMention(filtered[selected].id)
                } else {
                  event.preventDefault()
                  const content = serialize(value)
                  if (content !== '' && token) {
                    patchMessage(id, content, token)
                    onDismiss()
                  }
                }
                break
              }
              case 'Tab': {
                event.preventDefault()
                if (event.shiftKey) {
                  setSelected(
                    selected - 1 < 0 ? filtered.length - 1 : selected - 1
                  )
                } else {
                  setSelected(
                    selected + 1 > filtered.length - 1 ? 0 : selected + 1
                  )
                }
              }
            }
          }}
        />
      </Slate>
      <FontAwesomeIcon icon={faTimesCircle} onClick={() => onDismiss()} />
    </div>
  )
}

const View = memo(
  ({
    id,
    authorID,
    createdAt,
    primary,
    content,
    onResize
  }: {
    id: string
    authorID: string
    createdAt: string
    updatedAt: string
    content: string
    primary: boolean
    onResize: () => void
  }) => {
    const uiStore = UI.useContainer()
    const auth = Auth.useContainer()
    const [editMessage, setEditMessage] = useState(false)
    const [deleteMessage] = useMutation(
      async () =>
        (
          await clientGateway.delete(`/messages/${id}`, {
            headers: { Authorization: auth.token }
          })
        ).data
    )
    const user = useQuery(['users', authorID, auth.token], getUser)
    const getItems = useCallback(() => {
      const items: {
        text: string
        icon: IconDefinition
        danger: boolean
        onClick: any
      }[] = [
        {
          text: 'Copy Message',
          icon: faCopy,
          danger: false,
          onClick: async () => {
            const permission = await Permissions.query({
              name: PermissionType.ClipboardWrite
            })
            if (permission.state === 'granted') {
              await Clipboard.write({
                string: content
              })
            }
          }
        },
        {
          text: 'Copy ID',
          icon: faCopy,
          danger: false,
          onClick: async () => {
            const permission = await Permissions.query({
              name: PermissionType.ClipboardWrite
            })
            if (permission.state === 'granted') {
              await Clipboard.write({
                string: id
              })
            }
          }
        }
      ]

      if (authorID === auth.id) {
        items.push({
          text: 'Edit Message',
          icon: faPencilAlt,
          danger: false,
          onClick: () => setEditMessage(true)
        })
        items.push({
          text: 'Delete Message',
          icon: faTrashAlt,
          danger: true,
          onClick: () =>
            uiStore.setModal({
              name: ModalTypes.DELETE_MESSAGE,
              props: {
                type: 'message',
                onConfirm: () => {
                  deleteMessage()
                  uiStore.clearModal()
                },
                onDismiss: () => uiStore.clearModal()
              }
            })
        })
      }
      return items
    }, [authorID, content, deleteMessage, id, uiStore, auth.id])
    const output = useMarkdown(content, {
      bold: (str, key) => <strong key={key}>{str}</strong>,
      italic: (str, key) => <i key={key}>{str}</i>,
      underlined: (str, key) => <u key={key}>{str}</u>,
      strikethough: (str, key) => <del key={key}>{str}</del>,
      link: (str, key) => {
        const link = (
          <a href={str} key={key} target='_blank' rel='noopener noreferrer'>
            {str}
          </a>
        )
        if (Image.isCovfefe(str)) {
          return {
            link,
            embed: <Image.Embed key={key} url={str} />
          }
        } else if (Audio.isCovfefe(str)) {
          return {
            link,
            embed: <Audio.Embed key={key} url={str} />
          }
        } else {
          return link
        }
      },
      codeblock: (str, key) => <code key={key}>{str}</code>,
      custom: [
        [
          /<@([A-Za-z0-9-]+?)>/g,
          (str, key) => (
            <Suspense fallback={<>&lt;@{str}&gt;</>}>
              <ErrorBoundary fallbackRender={() => <>&lt;@{str}&gt;</>}>
                <Mention key={key} userID={str} />
              </ErrorBoundary>
            </Suspense>
          )
        ]
      ]
    })
    const main = useMemo(
      () =>
        output.map((element) => (isEmbed(element) ? element.link : element)),
      [output]
    )
    const embeds = useMemo(
      () => output.filter(isEmbed).map((element) => element.embed),
      [output]
    )
    return (
      <Context.Wrapper
        title={`${user.data?.username || 'Unknown'}'s Message`}
        message={content}
        key={id}
        items={getItems()}
      >
        <div className={`${styles.message} ${primary ? styles.primary : ''}`}>
          {primary && (
            <div
              className={styles.avatar}
              style={{ backgroundImage: `url(${user.data?.avatar})` }}
            />
          )}
          <div className={`${styles.content} ${!primary ? styles.spacer : ''}`}>
            {primary && (
              <h2 key='username'>
                <span>
                  {user.data?.username}
                  {user.data?.id === '987d59ba-1979-4cc4-8818-7fe2f3d4b560' ? (
                    <FontAwesomeIcon
                      className={styles.badge}
                      icon={faUserNinja}
                    />
                  ) : user.data?.id ===
                    '99343aac-2301-415d-aece-17b021d3a459' ? (
                    <FontAwesomeIcon
                      className={styles.badge}
                      icon={faCatSpace}
                    />
                  ) : (
                    user.data?.discriminator === 0 && (
                      <FontAwesomeIcon
                        className={styles.badge}
                        icon={faUserShield}
                      />
                    )
                  )}
                </span>
                <span className={styles.time}>
                  {dayjs.utc(createdAt).local().calendar()}
                </span>
              </h2>
            )}
            {editMessage ? (
              <EditBox
                id={id}
                authorID={authorID}
                content={content}
                onDismiss={() => setEditMessage(false)}
              />
            ) : (
              <p>{main}</p>
            )}
            <Measure onResize={onResize}>{embeds}</Measure>
          </div>
        </div>
      </Context.Wrapper>
    )
  }
)

const Placeholder = () => {
  const username = useMemo(() => Math.floor(Math.random() * 6) + 3, [])
  const message = useMemo(() => Math.floor(Math.random() * 10) + 8, [])
  const isPrimary = useMemo(() => Math.floor(Math.random() * 1000000) + 1, [])
  return (
    <div
      className={`${styles.placeholder} ${
        isPrimary % 2 === 0 ? styles.primary : ''
      }`}
    >
      {isPrimary % 2 === 0 && <div className={styles.avatar} />}
      <div
        className={`${styles.content} ${
          isPrimary % 2 !== 0 ? styles.spacer : ''
        }`}
      >
        <div className={styles.user}>
          {isPrimary % 2 === 0 && (
            <div
              className={styles.username}
              style={{ width: `${username}rem` }}
            />
          )}
          {isPrimary % 2 === 0 && <div className={styles.date} />}
        </div>
        <div className={styles.message} style={{ width: `${message}rem` }} />
      </div>
    </div>
  )
}

const Message = { View, Placeholder, Mention }

export default Message

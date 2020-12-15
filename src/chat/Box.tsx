import styles from './Box.module.scss'
import Button from '../components/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faFileUpload,
  faSmileWink,
  faTimes
} from '@fortawesome/pro-solid-svg-icons'
import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { useMedia } from 'react-use'
import Picker from 'emoji-picker-react'
import { Auth } from '../authentication/state'
import { postTyping, uploadFile } from './remote'
import { Chat } from './state'
import Upload from './Upload'
import { withHistory } from 'slate-history'
import { Editable, RenderLeafProps, Slate, withReact } from 'slate-react'
import {
  createEditor,
  Editor,
  Node,
  Transforms,
  Text,
  Element,
  Range
} from 'slate'
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
import Mentions from './Mentions'
import { getUser } from '../user/remote'
import messageStyles from './Message.module.scss'
import { useQuery } from 'react-query'

const withMentions = (editor: Editor) => {
  const { isInline, isVoid } = editor

  editor.isInline = (element) => {
    return element.type === 'mention' ? true : isInline(element)
  }

  editor.isVoid = (element) => {
    return element.type === 'mention' ? true : isVoid(element)
  }

  return editor
}

const Mention = ({
  userID,
  attributes,
  children
}: {
  userID: string
  attributes: any
  children: React.ReactChild
}) => {
  const { token, id } = Auth.useContainer()
  const user = useQuery(['users', userID, token], getUser)
  return (
    <span
      {...attributes}
      contentEditable={false}
      className={`${messageStyles.mention} ${userID === id ? styles.isMe : ''}`}
    >
      @{user.data?.username}
      {children}
    </span>
  )
}

const adjectives = [
  ' amazing',
  ' insightful',
  ' funny',
  ' about cats',
  ' interesting',
  ' special',
  ' innovative',
  ', anything really',
  ' delightful',
  ' steamy',
  ' about Innatical'
]

const serialize = (value: Node[]) =>
  value.map((node) => Node.string(node)).join('\n')

const emptyEditor = [
  {
    children: [{ text: '' }]
  }
]

const Leaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  console.log('leaf', leaf)
  return leaf.underline ? (
    <u {...attributes}>{children}</u>
  ) : leaf.strong ? (
    <strong {...attributes}>{children}</strong>
  ) : leaf.emphasis ? (
    <em {...attributes}>{children}</em>
  ) : leaf.code ? (
    <code {...attributes}>{children}</code>
  ) : leaf.delete ? (
    <del {...attributes}>{children}</del>
  ) : leaf.link ? (
    <a {...attributes}>{children}</a>
  ) : (
    <span {...attributes}>{children}</span>
  )
}

const View = ({
  channelID,
  typingIndicator,
  participants
}: {
  channelID: string
  typingIndicator: boolean
  participants?: string[]
}) => {
  const { sendMessage, uploadDetails, setUploadDetails } = Chat.useContainer()
  const { token } = Auth.useContainer()
  const isMobile = useMedia('(max-width: 940px)')
  const [typing, setTyping] = useState<boolean>(false)
  const adjective = useMemo(
    () => adjectives[Math.floor(Math.random() * adjectives.length)],
    []
  )
  const uploadInput = useRef<HTMLInputElement>(null)
  const [emojiPicker, setEmojiPicker] = useState(false)
  useEffect(() => {
    if (!token) return
    const interval = setInterval(
      () => typing && postTyping(channelID, token),
      7000
    )
    return () => {
      clearInterval(interval)
    }
  }, [typing, channelID, token])
  const editor = useMemo(
    () => withHistory(withReact(withMentions(createEditor()))),
    []
  )
  useEffect(() => {
    editor.isInline = (element: Element) => {
      if (element.type === 'mention') return true
      return false
    }
  }, [editor])
  const [value, setValue] = useState<Node[]>(emptyEditor)
  const [mentionPopup, setMentionPopup] = useState(false)
  const [target, setTarget] = useState<Range | undefined>()
  const [search, setSearch] = useState('')

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

  const renderElement = useCallback((props) => {
    switch (props.element.type) {
      case 'mention':
        return (
          <Mention
            attributes={props.attributes}
            children={props.children}
            userID={props.element.mentionID}
          />
        )
      default:
        return <span {...props.attributes}>{props.children}</span>
    }
  }, [])

  const renderLeaf = useCallback(
    (props: RenderLeafProps) => <Leaf {...props} />,
    []
  )
  const [mentionSearch, setMentionSearch] = useState('')
  const [selected, setSelected] = useState(0)

  const mentionable = useMemo(
    () => /*participants ?? []*/ [
      '987d59ba-1979-4cc4-8818-7fe2f3d4b560',
      '99343aac-2301-415d-aece-17b021d3a459'
    ],
    []
  )

  useEffect(() => {
    setSelected(0)
  }, [target, mentionable])

  useEffect(() => {
    console.log('mentionable changed', mentionable)
  }, [mentionable])
  console.log('selected', selected)

  return (
    <>
      <div className={styles.boxWrapper}>
        {target && (
          <Suspense fallback={<></>}>
            <Mentions
              ids={mentionable}
              search={search}
              selected={selected}
              onMention={(id) => {
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
                Transforms.move(editor)
                setTarget(undefined)
              }}
            />
          </Suspense>
        )}
        <div
          className={`${styles.box} ${
            typingIndicator ? styles.typingIndicator : ''
          }`}
        >
          <>
            <Slate
              editor={editor}
              value={value}
              onChange={(value) => {
                setValue(value)
                const { selection } = editor

                if (selection && Range.isCollapsed(selection)) {
                  const [start] = Range.edges(selection)
                  const wordBefore = Editor.before(editor, start, {
                    unit: 'word'
                  })
                  const before =
                    (wordBefore && Editor.before(editor, wordBefore)) ||
                    wordBefore
                  const beforeRange =
                    before && Editor.range(editor, before, start)
                  const beforeText =
                    beforeRange && Editor.string(editor, beforeRange)
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
                autoFocus={!isMobile}
                className={styles.input}
                spellCheck
                // @ts-ignore
                placeholder={
                  <span className={styles.ph}>Say something{adjective}...</span>
                }
                renderLeaf={renderLeaf}
                renderElement={renderElement}
                decorate={decorate}
                onKeyDown={async (event) => {
                  switch (event.key) {
                    case 'Enter': {
                      if (event.shiftKey) {
                        event.preventDefault()
                        editor.insertBreak()
                      } else {
                        event.preventDefault()
                        setMentionPopup(false)
                        const content = serialize(value)
                        if (content !== '' || uploadDetails) {
                          if (uploadDetails) {
                            setUploadDetails({
                              status: 'uploading',
                              file: uploadDetails.file
                            })
                            const url = await uploadFile(uploadDetails.file)
                            setTyping(false)

                            if (content !== '') {
                              sendMessage(`${content}\n${url}`)
                              Transforms.select(
                                editor,
                                Editor.start(editor, [])
                              )
                              setValue(emptyEditor)
                            } else {
                              sendMessage(url)
                            }
                            setUploadDetails(null)
                          } else {
                            setTyping(false)
                            sendMessage(content)
                            Transforms.select(editor, Editor.start(editor, []))
                            setValue(emptyEditor)
                          }
                        }
                      }
                      break
                    }
                    case 'Tab': {
                      event.preventDefault()
                      if (event.shiftKey) {
                        setSelected(
                          selected - 1 < 0
                            ? mentionable.length - 1
                            : selected - 1
                        )
                      } else {
                        setSelected(
                          selected + 1 > mentionable.length - 1
                            ? 0
                            : selected + 1
                        )
                      }
                      break
                    }
                    default: {
                      if (mentionPopup) {
                        setMentionSearch(mentionSearch + event.key)
                      }
                    }
                  }
                }}
              />
            </Slate>
            <Button
              type='button'
              onClick={() => {
                if (!!uploadDetails && emojiPicker) setEmojiPicker(false)
                else if (!!uploadDetails) {
                  if (uploadInput.current) uploadInput.current.value = ''
                  setUploadDetails(null)
                } else {
                  uploadInput.current?.click()
                }
              }}
            >
              <FontAwesomeIcon icon={uploadDetails ? faTimes : faFileUpload} />
              <input
                ref={uploadInput}
                className={styles.uploadInput}
                type='file'
                accept='.jpg, .png, .jpeg, .gif'
                onChange={async (event) => {
                  if (!token || !event.target.files?.item(0)) return
                  setUploadDetails({
                    status: 'pending',
                    file: event.target.files.item(0) as File
                  })
                }}
              />
              {uploadDetails && emojiPicker && (
                <div className={`${styles.badge}`} />
              )}
            </Button>
            {uploadDetails && !emojiPicker && (
              <Upload
                {...uploadDetails}
                onUpload={async (file) => {
                  setUploadDetails({
                    status: 'uploading',
                    file
                  })
                  const url = await uploadFile(file)
                  await sendMessage(url)
                  setUploadDetails(null)
                }}
              />
            )}
            {emojiPicker && (
              <Picker
                onEmojiClick={(_, data) => {
                  editor.insertText(data.emoji)
                }}
                native
              />
            )}
            {!isMobile && (
              <Button
                type='button'
                onClick={() => setEmojiPicker(!emojiPicker)}
              >
                <FontAwesomeIcon icon={faSmileWink} />
              </Button>
            )}
          </>
        </div>
      </div>
    </>
  )
}

const Placeholder = () => {
  return (
    <div className={styles.placeholder}>
      <div className={styles.input} />
      <div className={styles.upload} />
      <div className={styles.emoji} />
    </div>
  )
}

const Box = { View, Placeholder }

export default Box

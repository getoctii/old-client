import { FC, Suspense, useCallback, useEffect, useState } from 'react'
import { useMedia, usePageLeave } from 'react-use'
import { Element, Text, Transforms, Editor, Range, Node } from 'slate'
import { HistoryEditor } from 'slate-history'
import { RenderLeafProps, Slate, Editable, ReactEditor } from 'slate-react'
import { UserResponse } from '../user/remote'
import { serialize } from '../utils/slate'
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
import Mentions from '../chat/Mentions'
import { useRouteMatch } from 'react-router-dom'
import Mention from '../chat/Mention'
import {
  ChannelResponse,
  CommandResponse,
  IntegrationResponse
} from '../community/remote'
import { isPlatform } from '@ionic/react'
import styles from './Editor.module.scss'
import { UI } from '../state/ui'
import { useSuspenseStorageItem } from '../utils/storage'
import Commands from '../chat/Commands'
import { Auth } from '../authentication/state'

const Leaf: FC<RenderLeafProps> = ({ attributes, children, leaf }) => {
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

const allowedKeys = new Set([
  'Digit0',
  'Digit1',
  'Digit2',
  'Digit3',
  'Digit4',
  'Digit5',
  'Digit6',
  'Digit7',
  'Digit8',
  'Digit9',
  'KeyQ',
  'KeyW',
  'KeyE',
  'KeyR',
  'KeyT',
  'KeyY',
  'KeyU',
  'KeyI',
  'KeyO',
  'KeyP',
  'BracketLeft',
  'BracketRight',
  'KeyA',
  'KeyS',
  'KeyD',
  'KeyF',
  'KeyG',
  'KeyH',
  'KeyJ',
  'KeyK',
  'KeyL',
  'Semicolon',
  'Quote',
  'Backquote',
  'Baskslash',
  'KeyZ',
  'KeyX',
  'KeyC',
  'KeyV',
  'KeyB',
  'KeyN',
  'KeyM',
  'Comma',
  'Period',
  'Slash'
])

const EditorView: FC<{
  id: string
  editor: Editor & ReactEditor & HistoryEditor
  className: string
  mentionsClassName?: string
  typingClassName?: string
  inputClassName: string
  emptyEditor: Node[]
  placeholder?: string
  children?: any
  newLines: boolean
  onEnter: (content: string) => void
  onTyping?: () => void
  onDismiss?: () => void
  typingIndicator?: boolean
  userMentions?: boolean
  channelMentions?: boolean
  draftKey?: string
}> = ({
  id,
  editor,
  className,
  mentionsClassName,
  typingClassName,
  inputClassName,
  children,
  emptyEditor,
  placeholder,
  newLines,
  onEnter,
  onTyping,
  onDismiss,
  typingIndicator,
  userMentions,
  channelMentions,
  draftKey
}) => {
  const match = useRouteMatch<{ id: string }>('/communities/:id/:tab?/:tab2?')
  const isMobile = useMedia('(max-width: 740px)')
  const [typing, setTyping] = useState<boolean>(false)
  useEffect(() => {
    editor.isInline = (element: Element) => {
      return element.type === 'user' || element.type === 'channel'
    }
  }, [editor])
  usePageLeave(() => setTyping(false))
  const [value, setValue] = useState<Node[]>(emptyEditor)
  const [draft, setDraft] = useSuspenseStorageItem<Node[]>(
    'draft:' + draftKey ?? ''
  )

  useEffect(() => {
    if (!draft || !draftKey) return
    setValue(draft)
  }, [])

  useEffect(() => {
    if (!draftKey) return
    setDraft(value)
  }, [value])

  const [target, setTarget] =
    useState<
      { range: Range; type: 'user' | 'channel' | 'command' } | undefined
    >()
  const [search, setSearch] = useState('')
  useEffect(() => {
    if (!onTyping) return
    const interval = setInterval(
      () => typing && serialize(value) !== '' && onTyping(),
      7000
    )
    return () => {
      clearInterval(interval)
    }
  }, [typing, onTyping, value])
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
      case 'user':
        return (
          <Suspense fallback={'@someone'}>
            <Mention.User
              attributes={props.attributes}
              children={props.children}
              userID={props.element.mentionID}
            />
          </Suspense>
        )
      case 'channel':
        return (
          <Suspense fallback={'#something'}>
            <Mention.Channel
              attributes={props.attributes}
              children={props.children}
              channelID={props.element.mentionID}
            />
          </Suspense>
        )
      default:
        return <span {...props.attributes}>{props.children}</span>
    }
  }, [])

  const renderLeaf = useCallback(
    (props: RenderLeafProps) => <Leaf {...props} />,
    []
  )
  const [selected, setSelected] = useState(0)

  const onMention = useCallback(
    (id: string, type: 'user' | 'channel') => {
      if (!target) return
      Transforms.delete(editor, { at: target.range.anchor, unit: 'word' })
      Transforms.select(editor, target.range)
      Transforms.insertNodes(editor, {
        type: type,
        mentionID: id,
        children: [
          {
            text: `<${type === 'user' ? '@' : '#'}${id}>`
          }
        ]
      })
      editor.insertText(' ')
      Transforms.move(editor)
      setTarget(undefined)
    },
    [editor, target]
  )

  const [usersFiltered, setUsersFiltered] = useState<UserResponse[]>([])
  const [channelsFiltered] = useState<ChannelResponse[]>([])
  const [commandsFiltered, setCommandsFiltered] = useState<CommandResponse[]>(
    []
  )
  const onUsersFiltered = useCallback((users: UserResponse[]) => {
    setUsersFiltered(users)
  }, [])

  const onCommandsFiltered = useCallback(
    (commands: (CommandResponse & { icon: string })[]) => {
      setCommandsFiltered(commands)
    },
    []
  )

  useEffect(() => {
    setSelected(0)
  }, [target, usersFiltered, channelsFiltered, commandsFiltered])

  const ui = UI.useContainer()

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (
        !ui.modal &&
        !ReactEditor.isFocused(editor) &&
        !isMobile &&
        !isPlatform('ipad') &&
        (event.target as any)?.type !== 'text' &&
        (!(event.target as any)?.id || (event.target as any)?.id === id) &&
        allowedKeys.has(event.code) &&
        !event.ctrlKey &&
        !event.altKey &&
        !event.metaKey &&
        !event.shiftKey
      ) {
        ReactEditor.focus(editor)
        Transforms.move(editor)
      }
    }

    document.addEventListener('keydown', handler)

    return () => {
      document.removeEventListener('keydown', handler)
    }
  }, [editor, isMobile, id])

  console.log(selected)

  return (
    <>
      {target && (
        <div className={mentionsClassName}>
          <Suspense fallback={<></>}>
            {!match?.params && target.type === 'user' ? (
              <Mentions.Conversation
                search={search}
                selected={selected}
                onMention={onMention}
                onFiltered={onUsersFiltered}
              />
            ) : match?.params.id ? (
              target.type === 'user' ? (
                <Mentions.Community.Users
                  search={search}
                  onMention={onMention}
                  selected={selected}
                  onFiltered={onUsersFiltered}
                />
              ) : target.type === 'channel' ? (
                <Mentions.Community.Channels
                  search={search}
                  onMention={onMention}
                  selected={selected}
                />
              ) : target.type === 'command' ? (
                <Commands
                  search={search}
                  selected={selected}
                  onFiltered={onCommandsFiltered}
                ></Commands>
              ) : (
                <></>
              )
            ) : (
              <></>
            )}
          </Suspense>
        </div>
      )}
      <div
        className={`${styles.editor} ${className} ${
          typingIndicator ? typingClassName : ''
        }`}
      >
        {serialize(value) === '' && placeholder ? (
          <div
            className={styles.placeholder}
            onClick={() => ReactEditor.focus(editor)}
          >
            {placeholder}
          </div>
        ) : (
          <></>
        )}
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

              const mentionType =
                characterBefore &&
                Editor.string(
                  editor,
                  Editor.range(editor, characterBefore, start)
                )

              const before =
                mentionType === '@' ||
                mentionType === '#' ||
                mentionType === '/'
                  ? characterBefore
                  : wordBefore && Editor.before(editor, wordBefore)
              const beforeRange = before && Editor.range(editor, before, start)
              const beforeText =
                beforeRange && Editor.string(editor, beforeRange)
              const beforeMatch =
                beforeText &&
                (beforeText.match(/^@(\w*)$/) ??
                  beforeText.match(/^#(\w*)$/) ??
                  beforeText.match(/^\/(\w*)$/))
              const after = Editor.after(editor, start)
              const afterRange = Editor.range(editor, start, after)
              const afterText = Editor.string(editor, afterRange)
              const afterMatch = afterText.match(/^(\s|$)/)

              if (beforeMatch && afterMatch) {
                if (
                  mentionType === '@' ||
                  mentionType === '#' ||
                  mentionType === '/'
                ) {
                  setTarget({
                    range: beforeRange!,
                    type:
                      mentionType === '@'
                        ? 'user'
                        : mentionType === '/'
                        ? 'command'
                        : 'channel'
                  })
                }

                setSearch(beforeMatch[1])
                return
              }

              setTarget(undefined)
            }
          }}
        >
          <Editable
            autoFocus={!ui.modal && !isMobile && !isPlatform('ipad')}
            className={`${styles.input} ${inputClassName}`}
            autoCapitalize={isMobile ? 'true' : 'false'}
            spellCheck
            renderLeaf={renderLeaf}
            renderElement={renderElement}
            id={id}
            decorate={decorate}
            onKeyDown={async (event) => {
              if (!typing && onTyping && serialize(value) !== '') onTyping()
              if (serialize(value) !== '') setTyping(true)

              switch (event.key) {
                case 'Escape': {
                  if (onDismiss) {
                    event.preventDefault()
                    onDismiss()
                  }
                  break
                }
                case 'Enter': {
                  if (event.shiftKey && newLines) {
                    event.preventDefault()
                    editor.insertText('\n')
                  } else if (target && userMentions) {
                    event.preventDefault()
                    if (usersFiltered?.[selected]?.id && target.type === 'user')
                      onMention(usersFiltered[selected].id, target.type)
                    if (
                      channelsFiltered?.[selected]?.id &&
                      target.type === 'channel'
                    )
                      onMention(channelsFiltered[selected].id, target.type)
                  } else {
                    event.preventDefault()
                    const content = serialize(value)
                    setTyping(false)
                    if (content !== '') {
                      onEnter(content)
                      Transforms.select(editor, Editor.start(editor, []))
                      setValue(emptyEditor)
                    }
                  }
                  break
                }
                case 'Tab': {
                  event.preventDefault()
                  if (!target) return
                  if (!userMentions && !channelMentions) return
                  if (event.shiftKey) {
                    if (target.type === 'user')
                      setSelected(
                        selected - 1 < 0
                          ? usersFiltered.length - 1
                          : selected - 1
                      )
                    else if (target.type === 'channel')
                      setSelected(
                        selected - 1 < 0
                          ? channelsFiltered.length - 1
                          : selected - 1
                      )
                    else if (target.type === 'command')
                      setSelected(
                        selected - 1 < 0
                          ? commandsFiltered.length - 1
                          : selected - 1
                      )
                  } else {
                    if (target.type === 'user')
                      setSelected(
                        selected + 1 > usersFiltered.length - 1
                          ? 0
                          : selected + 1
                      )
                    else if (target.type === 'channel')
                      setSelected(
                        selected + 1 > channelsFiltered.length - 1
                          ? 0
                          : selected + 1
                      )
                    else if (target.type === 'command')
                      setSelected(
                        selected + 1 > commandsFiltered.length - 1
                          ? 0
                          : selected + 1
                      )
                  }
                }
              }
            }}
          />
        </Slate>
        {children}
      </div>
    </>
  )
}

export default EditorView

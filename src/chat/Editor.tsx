import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react'
import { useQuery } from 'react-query'
import { useMedia } from 'react-use'
import {
  createEditor,
  Element,
  Text,
  Transforms,
  Editor,
  Range,
  Node
} from 'slate'
import { HistoryEditor, withHistory } from 'slate-history'
import {
  RenderLeafProps,
  withReact,
  Slate,
  Editable,
  ReactEditor
} from 'slate-react'
import { Auth } from '../authentication/state'
import { getUser, UserResponse } from '../user/remote'
import { serialize, withMentions } from '../utils/slate'
import messageStyles from './Message.module.scss'
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
import { useRouteMatch } from 'react-router-dom'

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
      className={`${messageStyles.mention} ${
        userID === id ? messageStyles.isMe : ''
      }`}
    >
      @{user.data?.username}
      {children}
    </span>
  )
}

const Leaf = ({ attributes, children, leaf }: RenderLeafProps) => {
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
  participants
}: {
  className: string
  mentionsClassName: string
  typingClassName?: string
  inputClassName: string
  emptyEditor: Node[]
  placeholder?: any
  children?: (editor: Editor & ReactEditor & HistoryEditor) => any
  newLines: boolean
  onEnter: (content: string) => void
  onTyping?: () => void
  onDismiss?: () => void
  typingIndicator?: boolean
  participants?: string[]
}) => {
  const match = useRouteMatch<{ id: string }>('/communities/:id/:tab?/:tab2?')
  const isMobile = useMedia('(max-width: 740px)')
  const [typing, setTyping] = useState<boolean>(false)
  useEffect(() => {
    if (!onTyping) return
    const interval = setInterval(() => typing && onTyping(), 7000)
    return () => {
      clearInterval(interval)
    }
  }, [typing, onTyping])
  const editor = useMemo(
    () => withHistory(withReact(withMentions(createEditor()))),
    []
  )
  useEffect(() => {
    editor.isInline = (element: Element) => {
      return element.type === 'mention'
    }
  }, [editor])
  const [value, setValue] = useState<Node[]>(emptyEditor)
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
  const [selected, setSelected] = useState(0)

  const mentionable = useMemo(() => participants ?? [], [participants])

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

  return (
    <>
      {target && (
        <div className={mentionsClassName}>
          <Suspense fallback={<></>}>
            {participants ? (
              <Mentions.Conversation
                ids={mentionable}
                search={search}
                selected={selected}
                onMention={onMention}
                onFiltered={onFiltered}
              />
            ) : match?.params.id ? (
              <Mentions.Community
                communityID={match?.params.id}
                search={search}
                onMention={onMention}
                selected={selected}
                onFiltered={onFiltered}
              />
            ) : (
              <></>
            )}
          </Suspense>
        </div>
      )}
      <div className={`${className} ${typingIndicator ? typingClassName : ''}`}>
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
            className={inputClassName}
            autoCapitalize={isMobile ? 'true' : 'false'}
            spellCheck
            // @ts-ignore
            placeholder={placeholder}
            renderLeaf={renderLeaf}
            renderElement={renderElement}
            decorate={decorate}
            onKeyDown={async (event) => {
              if (!typing && onTyping) onTyping()
              setTyping(true)
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
                    editor.insertBreak()
                  } else if (target) {
                    event.preventDefault()
                    if (filtered[selected].id) onMention(filtered[selected].id)
                  } else {
                    event.preventDefault()
                    const content = serialize(value)
                    if (content !== '') {
                      setTyping(false)
                      onEnter(content)
                      Transforms.select(editor, Editor.start(editor, []))
                      setValue(emptyEditor)
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
        {children ? children(editor) : <></>}
      </div>
    </>
  )
}

export default View

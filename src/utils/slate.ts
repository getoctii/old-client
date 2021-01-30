import { Editor, Node } from 'slate'

export const withMentions = (editor: Editor) => {
  const { isInline, isVoid } = editor

  editor.isInline = (element) => {
    return element.type === 'user' || element.type === 'channel'
      ? true
      : isInline(element)
  }

  editor.isVoid = (element) => {
    return element.type === 'user' || element.type === 'channel'
      ? true
      : isVoid(element)
  }

  return editor
}

export const serialize = (value: Node[]) =>
  value.map((node) => Node.string(node)).join('\n')

export const emptyEditor = [
  {
    children: [{ text: '' }]
  }
]

import { createContainer } from 'unstated-next'
import { useEffect } from 'react'
import { useLocalStorage, useMedia } from 'react-use'
import darkTheme from './themes/default-dark.json'

const isThemeBundle = (theme: Theme | ThemeBundle): theme is ThemeBundle => {
  return (theme as ThemeBundle).dark !== undefined
}

interface ThemeBundle {
  id: string
  name: string
  dark: Theme
  light: Theme
}

interface Theme {
  id: string
  name: string
  version?: string

  colors: {
    primary: string
    secondary: string
    success: string
    info: string
    danger: string
    warning: string
    light: string
    dark: string
  }
  text: {
    normal: string
    inverse: string
    href: string
    danger: string
  }
  settings: {
    background: string
    card: string
    input: string
  }
  sidebar: {
    background: string
    seperator: string
  }
  context: {
    background: string
    seperator: string
  }
  channels: {
    background: string
    seperator: string
    search: {
      background: string
      text: string
      placeholder: string
    }
  }
  chat: {
    background: string
    hover: string
    header: {
      channel: string
      description: string
    }
  }

  status: {
    selected: string
    online: string
    idle: string
    dnd: string
    offline: string
  }
  message: {
    author: string
    date: string
    message: string
  }

  input: {
    background: string
    text: string
  }

  modal: {
    background: string
    foreground: string
  }
}

const globalStyle = document.createElement('style')
globalStyle.type = 'text/css'
document.head.appendChild(globalStyle)

const useTheme = () => {
  const [theme, setTheme] = useLocalStorage<Theme | ThemeBundle>(
    'theme',
    darkTheme
  )
  const prefersDarkMode = useMedia('prefers-color-scheme: dark')
  useEffect(() => {
    if (!theme) return
    const documentStyle = document.documentElement.style
    const currentTheme =
      isThemeBundle(theme) && prefersDarkMode
        ? theme.dark
        : isThemeBundle(theme)
        ? theme.light
        : theme
    if (!currentTheme.version) return setTheme(darkTheme)

    Object.entries({
      '--neko-colors-primary': currentTheme.colors.primary,
      '--neko-colors-secondary': currentTheme.colors.secondary,
      '--neko-colors-danger': currentTheme.colors.danger,
      '--neko-colors-light': currentTheme.colors.light,
      '--neko-colors-dark': currentTheme.colors.dark,
      '--neko-colors-warning': currentTheme.colors.warning,
      '--neko-colors-info': currentTheme.colors.info,
      '--neko-text-normal': currentTheme.text.normal,
      '--neko-text-inverse': currentTheme.text.inverse,
      '--neko-text-href': currentTheme.text.href,
      '--neko-text-danger': currentTheme.text.danger,
      '--neko-status-selected': currentTheme.status.selected,
      '--neko-status-online': currentTheme.status.online,
      '--neko-status-offline': currentTheme.status.offline,
      '--neko-status-dnd': currentTheme.status.dnd,
      '--neko-status-idle': currentTheme.status.idle,
      '--neko-modal-background': currentTheme.modal.background,
      '--neko-modal-foreground': currentTheme.modal.foreground,
      '--neko-channels-background': currentTheme.channels.background,
      '--neko-channels-seperator': currentTheme.channels.seperator,
      '--neko-chat-background': currentTheme.chat.background,
      '--neko-chat-hover': currentTheme.chat.hover,
      '--neko-sidebar-background': currentTheme.sidebar.background,
      '--neko-sidebar-seperator': currentTheme.sidebar.seperator,
      '--neko-input-background': currentTheme.input.background,
      '--neko-input-text': currentTheme.input.text,
      '--neko-settings-background': currentTheme.settings.background,
      '--neko-settings-card': currentTheme.settings.card,
      '--neko-settings-input': currentTheme.settings.input,
      '--neko-context-background': currentTheme.context.background,
      '--neko-context-seperator': currentTheme.context.seperator
    }).forEach(([key, value]) => documentStyle.setProperty(key, value))
  }, [theme, prefersDarkMode, setTheme])
  return { theme, setTheme }
}

export default createContainer(useTheme)

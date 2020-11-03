import { createContainer } from 'unstated-next'
import { useEffect, useMemo } from 'react'
import { useLocalStorage, useMedia } from 'react-use'
import octii from './themes/octii.json'
import octiiHub from './themes/octii-hub.json'
import ayu from './themes/ayu-mirage.json'
import eyestrain from './themes/eyestrain.json'
import { isPlatform } from '@ionic/react'
import {
  KeyboardResize,
  KeyboardStyle,
  Plugins,
  StatusBarStyle
} from '@capacitor/core'
const { Keyboard, StatusBar } = Plugins
const isThemeBundle = (theme: Theme | ThemeBundle): theme is ThemeBundle => {
  return (theme as ThemeBundle).dark !== undefined
}

interface ThemeBundle {
  id: string
  name: string
  version?: string
  dark: Theme
  light: Theme
}

interface Theme {
  id?: string
  name?: string
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
    warning: string
    secondary: string
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

  emojis: {
    background: string
    input: string
  }

  global?: string
}

const globalStyle = document.createElement('style')
globalStyle.type = 'text/css'
document.head.appendChild(globalStyle)

export const themes = [octii, octiiHub, ayu, eyestrain]

const useTheme = () => {
  const [themeId, setThemeId] = useLocalStorage<string>('themeId', octii.id)
  const theme = useMemo<Theme | ThemeBundle | undefined>(
    () => themes.find((t) => t.id === themeId),
    [themeId]
  )
  const [variations, setVariations] = useLocalStorage<
    'light' | 'dark' | 'system'
  >('variations', 'system')
  const prefersDarkMode = useMedia('(prefers-color-scheme: dark)')
  useEffect(() => {
    if (!theme) return setThemeId(octii.id)
    const documentStyle = document.documentElement.style

    const currentTheme = isThemeBundle(theme)
      ? variations === 'system'
        ? prefersDarkMode
          ? theme.dark
          : theme.light
        : variations === 'light'
        ? theme.light
        : theme.dark
      : theme

    if (!theme.version) return

    if (isPlatform('capacitor')) {
      StatusBar.setOverlaysWebView({ overlay: true })
      Keyboard.setResizeMode({ mode: KeyboardResize.Native })
      const isDark =
        (variations === 'system' && prefersDarkMode) || variations === 'dark'
      console.log(isDark)
      Keyboard.setStyle({
        style: isDark ? KeyboardStyle.Dark : KeyboardStyle.Light
      })
      StatusBar.setStyle({
        style: isDark ? StatusBarStyle.Dark : StatusBarStyle.Light
      })
    }

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
      '--neko-text-warning': currentTheme.text.warning,
      '--neko-text-secondary': currentTheme.text.secondary,
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
      '--neko-context-seperator': currentTheme.context.seperator,
      '--neko-emojis-background': currentTheme.emojis.background,
      '--neko-emojis-input': currentTheme.emojis.input
    }).forEach(([key, value]) => documentStyle.setProperty(key, value))
    if (currentTheme.global) globalStyle.textContent = currentTheme.global
    else globalStyle.textContent = ''
  }, [theme, prefersDarkMode, variations, setThemeId])
  return { theme, themeId, setThemeId, setVariations, variations }
}

export default createContainer(useTheme)

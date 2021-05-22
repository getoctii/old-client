import { createContainer } from '@innatical/innstate'
import { useEffect, useMemo, useState } from 'react'
import { useMedia } from 'react-use'
import octii from './themes/octii.json'
import octiiHub from './themes/octii-hub.json'
import ayu from './themes/ayu-mirage.json'
import eyestrain from './themes/eyestrain.json'
import innlove from './themes/innlove.json'
import { isPlatform } from '@ionic/react'
import {
  KeyboardResize,
  KeyboardStyle,
  Plugins,
  StatusBarStyle
} from '@capacitor/core'
import { useSuspenseStorageItem } from '../utils/storage'
import Integrations from '../integrations/state'
// import * as Yup from 'zod'
import * as Yup from 'yup'
const { Keyboard, StatusBar } = Plugins
const isThemeBundle = (theme: Theme | ThemeBundle): theme is ThemeBundle => {
  return (theme as ThemeBundle).dark !== undefined
}

export const themeSchema = Yup.object({
  colors: Yup.object({
    primary: Yup.string().defined(),
    secondary: Yup.string().defined(),
    success: Yup.string().defined(),
    info: Yup.string().defined(),
    danger: Yup.string().defined(),
    warning: Yup.string().defined(),
    light: Yup.string().defined(),
    dark: Yup.string().defined()
  }).defined(),
  text: Yup.object({
    normal: Yup.string().defined(),
    inverse: Yup.string().defined(),
    primary: Yup.string().defined(),
    danger: Yup.string().defined(),
    warning: Yup.string().defined(),
    secondary: Yup.string().defined()
  }).defined(),
  backgrounds: Yup.object({
    primary: Yup.string().defined(),
    secondary: Yup.string().defined()
  }).defined(),
  settings: Yup.object({
    background: Yup.string().defined(),
    card: Yup.string().defined(),
    input: Yup.string().defined()
  }).defined(),
  sidebar: Yup.object({
    background: Yup.string().defined(),
    seperator: Yup.string().defined(),
    shadow: Yup.string().defined()
  }).defined(),
  context: Yup.object({
    background: Yup.string().defined(),
    seperator: Yup.string().defined()
  }).defined(),
  channels: Yup.object({
    background: Yup.string().defined(),
    seperator: Yup.string().defined()
  }).defined(),
  chat: Yup.object({
    background: Yup.string().defined(),
    hover: Yup.string().defined()
  }).defined(),
  status: Yup.object({
    selected: Yup.string().defined(),
    online: Yup.string().defined(),
    idle: Yup.string().defined(),
    dnd: Yup.string().defined(),
    offline: Yup.string().defined()
  }).defined(),
  message: Yup.object({
    author: Yup.string().defined(),
    date: Yup.string().defined(),
    message: Yup.string().defined()
  }).defined(),
  mention: Yup.object({
    me: Yup.string().defined(),
    other: Yup.string().defined()
  }).defined(),
  input: Yup.object({
    background: Yup.string().defined(),
    text: Yup.string().defined()
  }).defined(),
  modal: Yup.object({
    background: Yup.string().defined(),
    foreground: Yup.string().defined()
  }).defined(),
  emojis: Yup.object({
    background: Yup.string().defined(),
    input: Yup.string().defined()
  }).defined(),
  global: Yup.string().optional().notRequired()
}).defined()

export const devThemeBundleSchema = Yup.object({
  name: Yup.string().defined(),
  dark: themeSchema,
  light: themeSchema
}).defined()

export const themeBundleSchema = Yup.object({
  name: Yup.string().defined(),
  dark: themeSchema,
  light: themeSchema,
  id: Yup.string().defined()
}).defined()

export type Theme = Yup.InferType<typeof themeSchema>
export type DevThemeBundle = Yup.InferType<typeof devThemeBundleSchema>
export type ThemeBundle = Yup.InferType<typeof themeBundleSchema>

const globalStyle = document.createElement('style')
globalStyle.type = 'text/css'
document.head.appendChild(globalStyle)

export const themes = [octii, innlove, octiiHub, ayu, eyestrain]

const useTheme = () => {
  const integerations = Integrations.useContainer()
  const [themeID, setThemeID] = useSuspenseStorageItem<string>(
    'theme-id',
    octii.id
  )
  const [variations, setVariations] = useSuspenseStorageItem<
    'light' | 'dark' | 'system'
  >('theme-variations', 'system')

  const [devTheme, setDevTheme] = useState<ThemeBundle | null>(null)

  const theme = useMemo<Theme | ThemeBundle>(
    () =>
      themeID === 'dev' && devTheme
        ? devTheme
        : themes.find((t) => t.id === themeID) ||
          integerations.payloads
            ?.flatMap((payload) => payload.themes ?? [])
            .find((theme) => theme.id === themeID) ||
          (octii as any),
    [themeID, integerations.payloads, devTheme]
  )

  const prefersDarkMode = useMedia('(prefers-color-scheme: dark)')
  useEffect(() => {
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

    if (isPlatform('capacitor')) {
      if (isPlatform('android')) {
        StatusBar.setOverlaysWebView({ overlay: true })
      }
      Keyboard.setResizeMode({ mode: KeyboardResize.Native })
      const isDark =
        (variations === 'system' && prefersDarkMode) || variations === 'dark'
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
      '--neko-text-primary': currentTheme.text.primary,
      '--neko-text-danger': currentTheme.text.danger,
      '--neko-text-warning': currentTheme.text.warning,
      '--neko-text-secondary': currentTheme.text.secondary,
      '--neko-backgrounds-primary': currentTheme.backgrounds.primary,
      '--neko-backgrounds-secondary': currentTheme.backgrounds.secondary,
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
      '--neko-sidebar-shadow': currentTheme.sidebar.shadow,
      '--neko-input-background': currentTheme.input.background,
      '--neko-input-text': currentTheme.input.text,
      '--neko-settings-background': currentTheme.settings.background,
      '--neko-settings-card': currentTheme.settings.card,
      '--neko-settings-input': currentTheme.settings.input,
      '--neko-context-background': currentTheme.context.background,
      '--neko-context-seperator': currentTheme.context.seperator,
      '--neko-emojis-background': currentTheme.emojis.background,
      '--neko-emojis-input': currentTheme.emojis.input,
      '--neko-mention-me': currentTheme.mention.me,
      '--neko-mention-other': currentTheme.mention.other
    }).forEach(([key, value]) => documentStyle.setProperty(key, value))
    if (currentTheme.global) globalStyle.textContent = currentTheme.global
    else globalStyle.textContent = ''
  }, [theme, prefersDarkMode, variations, setThemeID])
  return {
    theme,
    themeID,
    setThemeID,
    setVariations,
    variations,
    setDevTheme,
    bundle: isThemeBundle(theme) ? theme : undefined
  }
}

export default createContainer(useTheme)

import { Letter } from '../models/letter'
import {
  TEXT_COLORS, getFont, getFontSize, getLayout, getTextColor,
} from '../data/stationery'

export const LETTER_CARD = {
  width: 375,
  height: 667,
}

interface Rgb {
  r: number
  g: number
  b: number
}

export interface TextColors {
  text: string
  placeholder: string
  lowContrast?: boolean
  textShadow?: string
}

export function normalizeContent(content: string, align: string = 'left'): string {
  if (!content) return ''
  const lines = content.replace(/^[\s\u3000\r\n]+/, '').split('\n')
  if (align === 'center' || align === 'right') {
    return lines.map((line) => line.replace(/^[\s\u3000]+/, '')).join('\n')
  }
  return lines.map((line, index) => (index === 0 ? line.replace(/^[\s\u3000]+/, '') : line)).join('\n')
}

function formatDate(timestamp?: number): string {
  const date = new Date(timestamp || Date.now())
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

export function getLetterDateText(letter?: Partial<Letter>): string {
  const custom = letter && letter.dateText ? letter.dateText.trim() : ''
  if (custom) return custom
  return formatDate(letter ? letter.updatedAt : undefined)
}

function parseHexColor(hex: string): Rgb {
  if (!hex) return { r: 247, g: 245, b: 240 }
  const value = String(hex).replace('#', '').trim()
  if (value.length !== 6) return { r: 247, g: 245, b: 240 }
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  }
}

function mixRgb(a: Rgb, b: Rgb, t: number): Rgb {
  return {
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t),
  }
}

function getLuminance({ r, g, b }: Rgb): number {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

function rgbCss({ r, g, b }: Rgb): string {
  return `rgb(${r}, ${g}, ${b})`
}

export function getFooterTextColors(bgHex: string): TextColors {
  const base = parseHexColor(bgHex)
  const lum = getLuminance(base)
  const mix = lum > 0.82 ? 0.64 : lum > 0.65 ? 0.54 : lum > 0.45 ? 0.44 : 0.34
  let text = mixRgb(base, { r: 0, g: 0, b: 0 }, mix)

  if (getLuminance(text) > 0.48) {
    text = mixRgb(text, { r: 0, g: 0, b: 0 }, 0.38)
  }

  return {
    text: rgbCss(text),
    placeholder: rgbCss(mixRgb(text, base, 0.32)),
  }
}

function getRelativeLuminance({ r, g, b }: Rgb): number {
  const channels = [r, g, b].map((raw) => {
    const v = raw / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
}

function getContrastRatio(a: Rgb, b: Rgb): number {
  const l1 = getRelativeLuminance(a)
  const l2 = getRelativeLuminance(b)
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
}

export function getContentTextColors(bgHex: string, preferredColorHex: string): TextColors {
  const bg = parseHexColor(bgHex)
  const preferred = parseHexColor(preferredColorHex)
  const textLum = getLuminance(preferred)
  const bgLum = getLuminance(bg)
  const contrast = getContrastRatio(bg, preferred)
  const placeholder = mixRgb(preferred, bg, textLum > bgLum ? 0.48 : 0.38)

  return {
    text: rgbCss(preferred),
    placeholder: rgbCss(placeholder),
    lowContrast: contrast < 3,
    textShadow: contrast < 3
      ? (textLum >= bgLum
        ? '0 0 1px rgba(0,0,0,0.28), 0 1px 3px rgba(0,0,0,0.16)'
        : '0 0 1px rgba(255,255,255,0.35), 0 1px 2px rgba(255,255,255,0.2)')
      : 'none',
  }
}

export function resolveContentColors(stationeryBg: string, colorId: string): TextColors {
  const preferred = getTextColor(colorId)
  const colors = getContentTextColors(stationeryBg, preferred.value)
  if (!colors.lowContrast) return colors
  const fallbackId = getDefaultTextColorId(stationeryBg)
  const fallback = TEXT_COLORS.find((item) => item.id === fallbackId) || TEXT_COLORS[0]
  return getContentTextColors(stationeryBg, fallback.value)
}

export function isLightPaperBg(bgHex: string): boolean {
  return getRelativeLuminance(parseHexColor(bgHex)) > 0.46
}

export function getDefaultTextColorId(bgHex: string): string {
  return isLightPaperBg(bgHex) ? 'dark' : 'light-moon'
}

export interface LetterStyles {
  fontFamily: string
  fontId: string
  contentSize: number
  footerSize: number
  lineHeight: number
  align: string
  contentColor: string
  contentPlaceholder: string
  textShadow: string
  footerColor: string
  footerPlaceholder: string
}

export function getLetterStyles(letter: Letter, stationeryBg: string): LetterStyles {
  const font = getFont(letter.fontId)
  const layout = getLayout(letter.layoutId)
  const fontSize = getFontSize(letter.fontSizeId)
  const footerColors = getFooterTextColors(stationeryBg)
  const contentColors = resolveContentColors(stationeryBg, letter.colorId)

  return {
    fontFamily: font.family,
    fontId: font.id,
    contentSize: fontSize.contentSize,
    footerSize: fontSize.footerSize,
    lineHeight: layout.lineHeight,
    align: layout.align,
    contentColor: contentColors.text,
    contentPlaceholder: contentColors.placeholder,
    textShadow: contentColors.textShadow || 'none',
    footerColor: footerColors.text,
    footerPlaceholder: footerColors.placeholder,
  }
}

export function formatListDate(timestamp: number): string {
  const date = new Date(timestamp)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}/${month}/${day}`
}

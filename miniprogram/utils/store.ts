import { Letter } from '../models/letter'
import { getDefaultTextColorId } from './letter-render'
import { getStationery } from '../data/stationery'

const STORAGE_KEY = 'xinxie_letters'

export interface LetterCounts {
  all: number
  drafts: number
  mailbox: number
  favorites: number
  deleted: number
  tags: string
}

export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16)
    const v = c === 'x' ? r : ((r & 0x3) | 0x8)
    return v.toString(16)
  })
}

export function loadLetters(): Letter[] {
  try {
    const data = wx.getStorageSync<Letter[]>(STORAGE_KEY)
    if (!Array.isArray(data)) return []
    return data.filter(Boolean).map(normalizeStoredLetter)
  } catch (_error) {
    return []
  }
}

function normalizeStoredLetter(letter: Letter): Letter {
  return {
    ...letter,
    content: typeof letter.content === 'string' ? letter.content : '',
    tags: Array.isArray(letter.tags) ? letter.tags : [],
  }
}

export function saveLetters(letters: Letter[]): void {
  try {
    wx.setStorageSync(STORAGE_KEY, letters)
  } catch (_error) {
    throw new Error('本地存储失败，请清理空间后重试')
  }
}

export function createLetter(partial: Partial<Letter> = {}): Letter {
  const now = Date.now()
  return {
    id: generateId(),
    signature: '',
    dateText: '',
    recipient: '',
    content: '',
    title: '新信件',
    stationeryId: 'paper-for-you',
    fontId: 'pf-shaohua',
    colorId: 'dark',
    layoutId: 'left',
    fontSizeId: 'small',
    status: 'draft',
    favorited: false,
    tags: [],
    createdAt: now,
    updatedAt: now,
    ...partial,
  }
}

export function createLetterWithDefaults(partial: Partial<Letter> = {}): Letter {
  const letter = createLetter(partial)
  if (!partial.colorId) {
    letter.colorId = getDefaultTextColorId(getStationery(letter.stationeryId).bg)
  }
  return letter
}

export function getLetter(id: string): Letter | undefined {
  return loadLetters().find((letter) => letter.id === id)
}

export function upsertLetter(letter: Letter): Letter {
  if (!letter || !letter.id) throw new Error('信件数据无效')
  const letters = loadLetters()
  const index = letters.findIndex((item) => item.id === letter.id)
  const base = index >= 0
    ? letters[index]
    : createLetter({ id: letter.id, createdAt: letter.createdAt || Date.now() })
  const next: Letter = { ...base, ...letter, updatedAt: Date.now() }
  if (index >= 0) letters[index] = next
  else letters.unshift(next)
  saveLetters(letters)
  return next
}

export function deleteLetter(id?: string): void {
  if (!id) return
  const letters = loadLetters()
  const letter = letters.find((item) => item.id === id)
  if (!letter) return
  letter.status = 'deleted'
  letter.deletedAt = Date.now()
  saveLetters(letters)
}

export function deleteLetters(ids: string[]): number {
  if (!ids.length) return 0
  const letters = loadLetters()
  let removed = 0
  letters.forEach((letter) => {
    if (ids.indexOf(letter.id) >= 0) {
      letter.status = 'deleted'
      letter.deletedAt = Date.now()
      removed += 1
    }
  })
  saveLetters(letters)
  return removed
}

export function permanentlyDeleteLetters(ids: string[]): number {
  if (!ids.length) return 0
  const letters = loadLetters()
  const remaining = letters.filter((letter) => ids.indexOf(letter.id) < 0)
  saveLetters(remaining)
  return letters.length - remaining.length
}

export function toggleFavorite(id: string): Letter | undefined {
  const letters = loadLetters()
  const letter = letters.find((item) => item.id === id)
  if (!letter) return undefined
  letter.favorited = !letter.favorited
  saveLetters(letters)
  return letter
}

export function getCounts(): LetterCounts {
  const letters = loadLetters()
  const active = letters.filter((letter) => letter.status !== 'deleted')
  const tags: string[] = []
  active.forEach((letter) => {
    letter.tags.forEach((tag) => {
      if (tags.indexOf(tag) < 0) tags.push(tag)
    })
  })
  return {
    all: active.length,
    drafts: active.filter((letter) => letter.status === 'draft').length,
    mailbox: active.filter((letter) => letter.status === 'sent').length,
    favorites: active.filter((letter) => letter.favorited).length,
    deleted: letters.filter((letter) => letter.status === 'deleted').length,
    tags: tags.slice(0, 3).join(', ') || '生活, 旅行...',
  }
}

export type MailboxFilter = 'all' | 'sent' | 'favorited' | 'drafts' | 'deleted'

export function filterLetters(filter: MailboxFilter): Letter[] {
  const letters = loadLetters()
  switch (filter) {
    case 'sent':
      return letters.filter((letter) => letter.status === 'sent')
    case 'favorited':
      return letters.filter((letter) => letter.favorited && letter.status !== 'deleted')
    case 'drafts':
      return letters.filter((letter) => letter.status === 'draft')
    case 'deleted':
      return letters.filter((letter) => letter.status === 'deleted')
    default:
      return letters.filter((letter) => letter.status !== 'deleted')
  }
}

import { Letter } from '../models/letter'

const STORAGE_KEY = 'fl_letter_letters'

export function createLetter(partial: Partial<Letter> = {}): Letter {
  const now = Date.now()
  return {
    id: `${now}_${Math.random().toString(36).slice(2, 9)}`,
    title: '新信件',
    content: '',
    signature: '',
    dateText: formatDate(now),
    stationeryId: 'paper-for-you',
    fontId: 'serif',
    colorId: 'dark',
    layoutId: 'left',
    fontSizeId: 'small',
    status: 'draft',
    favorited: false,
    createdAt: now,
    updatedAt: now,
    ...partial,
  }
}

export function getLetters(): Letter[] {
  try {
    return wx.getStorageSync<Letter[]>(STORAGE_KEY) || []
  } catch (_error) {
    return []
  }
}

export function getLetter(id: string): Letter | undefined {
  return getLetters().find((letter) => letter.id === id)
}

export function saveLetter(letter: Letter): void {
  const letters = getLetters()
  const index = letters.findIndex((item) => item.id === letter.id)
  const next = { ...letter, updatedAt: Date.now() }
  if (index >= 0) letters[index] = next
  else letters.unshift(next)
  wx.setStorageSync(STORAGE_KEY, letters)
}

export function removeLetter(id: string): void {
  wx.setStorageSync(STORAGE_KEY, getLetters().filter((letter) => letter.id !== id))
}

export function toggleFavorite(id: string): Letter | undefined {
  const letter = getLetter(id)
  if (!letter) return undefined
  letter.favorited = !letter.favorited
  saveLetter(letter)
  return letter
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}.${month}.${day}`
}

export function getTitle(letter: Letter): string {
  const firstLine = letter.content.split('\n').find((line) => line.trim())
  return letter.title !== '新信件' ? letter.title : (firstLine || '无标题').slice(0, 18)
}

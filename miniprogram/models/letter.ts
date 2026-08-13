export type LetterStatus = 'draft' | 'sent'

export interface Letter {
  id: string
  title: string
  content: string
  signature: string
  dateText: string
  stationeryId: string
  fontId: string
  colorId: string
  layoutId: string
  fontSizeId: string
  status: LetterStatus
  favorited: boolean
  createdAt: number
  updatedAt: number
}

export interface Stationery {
  id: string
  name: string
  category: 'minimalist' | 'nature' | 'vintage'
  image: string
  background: string
}

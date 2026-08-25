export type LetterStatus = 'draft' | 'sent' | 'deleted'

export type StationeryCategory = 'minimalist' | 'nature' | 'vintage' | 'holiday'

export interface Letter {
  id: string
  title: string
  content: string
  signature: string
  dateText: string
  recipient: string
  stationeryId: string
  fontId: string
  colorId: string
  layoutId: string
  fontSizeId: string
  status: LetterStatus
  favorited: boolean
  tags: string[]
  createdAt: number
  updatedAt: number
  deletedAt?: number
}

export interface Stationery {
  id: string
  name: string
  category: StationeryCategory
  image: string
  bg: string
}

export interface FontOption {
  id: string
  name: string
  family: string
  group: string
}

export interface ColorOption {
  id: string
  value: string
  name: string
  group: string
}

export interface LayoutOption {
  id: string
  name: string
  align: 'left' | 'center' | 'right'
  lineHeight: number
}

export interface FontSizeOption {
  id: string
  name: string
  contentSize: number
  footerSize: number
}

export interface LetterTemplate {
  id: string
  name: string
  content: string
}

export interface BannerTemplate {
  id: string
  templateId: string
  title: string
  subtitle: string
  theme: 'warm' | 'sage' | 'rose' | 'mist'
}

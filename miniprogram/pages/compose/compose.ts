import { COLORS, FONTS, FONT_SIZES, LAYOUTS, STATIONERY, TEMPLATES, getStationery } from '../../data/options'
import { Letter } from '../../models/letter'
import { createLetter, getLetter, saveLetter } from '../../utils/letters'

type PanelName = '' | 'stationery' | 'font' | 'color' | 'layout'

Page({
  data: {
    letter: createLetter(),
    stationery: getStationery('paper-for-you'),
    fontFamily: 'serif',
    textColor: '#2c2c28',
    textAlign: 'left',
    fontSize: 30,
    templateNames: TEMPLATES.map((item) => item.name),
    templateIndex: 0,
    panel: '' as PanelName,
    stationeryOptions: STATIONERY,
    fonts: FONTS,
    colors: COLORS,
    layouts: LAYOUTS,
    sizes: FONT_SIZES,
  },

  onLoad(options: Record<string, string>) {
    let letter = options.id ? getLetter(options.id) : undefined
    letter = letter ? { ...letter } : createLetter()
    if (options.stationeryId) letter.stationeryId = options.stationeryId
    if (options.templateId) {
      const template = TEMPLATES.find((item) => item.id === options.templateId)
      if (template) {
        letter.title = template.name
        letter.content = template.content
      }
    }
    this.sync(letter)
  },

  sync(letter: Letter) {
    const templateIndex = Math.max(0, TEMPLATES.findIndex((item) => item.name === letter.title))
    this.setData({
      letter,
      stationery: getStationery(letter.stationeryId),
      fontFamily: FONTS.find((item) => item.id === letter.fontId)?.value || 'serif',
      textColor: COLORS.find((item) => item.id === letter.colorId)?.value || '#2c2c28',
      textAlign: LAYOUTS.find((item) => item.id === letter.layoutId)?.value || 'left',
      fontSize: FONT_SIZES.find((item) => item.id === letter.fontSizeId)?.value || 30,
      templateIndex,
    })
  },

  inputContent(event: WechatMiniprogram.TextareaInput) { this.setData({ 'letter.content': event.detail.value }) },
  inputSignature(event: WechatMiniprogram.Input) { this.setData({ 'letter.signature': event.detail.value }) },
  inputDate(event: WechatMiniprogram.Input) { this.setData({ 'letter.dateText': event.detail.value }) },
  changeTemplate(event: WechatMiniprogram.PickerChange) {
    const index = Number(event.detail.value)
    const template = TEMPLATES[index]
    this.setData({ templateIndex: index, 'letter.title': template.name, 'letter.content': template.content })
  },
  showPanel(event: WechatMiniprogram.BaseEvent) { this.setData({ panel: event.currentTarget.dataset.panel }) },
  closePanel() { this.setData({ panel: '' }) },
  stop() {},
  selectOption(event: WechatMiniprogram.BaseEvent) {
    const key = event.currentTarget.dataset.key as keyof Letter
    const value = event.currentTarget.dataset.value
    const letter = { ...this.data.letter, [key]: value }
    this.sync(letter)
  },
  finish() {
    const letter = { ...this.data.letter, status: 'sent' as const }
    saveLetter(letter)
    wx.redirectTo({ url: `/pages/preview/preview?id=${letter.id}&finished=1` })
  },
  onUnload() {
    if (this.data.letter.content.trim() && this.data.letter.status === 'draft') saveLetter(this.data.letter)
  },
})

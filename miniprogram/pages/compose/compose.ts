import {
  FONTS, FONT_SIZES, LAYOUTS, STATIONERY, TEXT_COLORS,
  getFontSize, getLayout, getStationery,
} from '../../data/stationery'
import { TEMPLATES, applyTemplateToLetter, letterPreviewTitle } from '../../data/templates'
import { Letter } from '../../models/letter'
import { createLetterWithDefaults, getLetter, upsertLetter } from '../../utils/store'
import {
  getDefaultTextColorId, getLetterDateText, getLetterStyles, normalizeContent,
} from '../../utils/letter-render'
import {
  FontStatus, ensureFont, getFontError, getFontStatus, loadFont,
  offFontStatusChange, onFontStatusChange, preloadAllFontsOnWifi,
} from '../../utils/font-loader'
import { getTopInsets } from '../../utils/page'

type PanelName = '' | 'stationery' | 'font' | 'color' | 'layout'

const PANEL_TITLES: Record<string, string> = {
  stationery: '选择信纸',
  font: '选择字体',
  color: '文字颜色',
  layout: '排版方式',
}

const FONT_GROUPS = FONTS.reduce((groups, font) => {
  const existing = groups.find((group) => group.label === font.group)
  if (existing) existing.items.push(font)
  else groups.push({ label: font.group, items: [font] })
  return groups
}, [] as { label: string; items: typeof FONTS }[])

const COLOR_GROUPS = TEXT_COLORS.reduce((groups, color) => {
  const existing = groups.find((group) => group.label === color.group)
  if (existing) existing.items.push(color)
  else groups.push({ label: color.group, light: color.group === '浅色系', items: [color] })
  return groups
}, [] as { label: string; light: boolean; items: typeof TEXT_COLORS }[])

Page({
  data: {
    topOffset: 64,
    title: '',
    content: '',
    signature: '',
    dateText: '',
    datePlaceholder: '',
    charCount: 0,
    stationery: getStationery('paper-for-you'),
    stationeryId: 'paper-for-you',
    fontId: 'pf-shaohua',
    colorId: 'dark',
    layoutId: 'left',
    fontSizeId: 'small',
    contentStyle: '',
    footerStyle: '',
    placeholderStyle: '',
    footerPlaceholderStyle: '',
    editing: false,
    cursor: 0,
    panel: '' as PanelName,
    panelTitle: '',
    stationeryOptions: STATIONERY,
    fontGroups: FONT_GROUPS,
    colorGroups: COLOR_GROUPS,
    layouts: LAYOUTS,
    fontSizes: FONT_SIZES,
    fontStates: {} as Record<string, FontStatus>,
  },

  draft: null as Letter | null,
  persistTimer: 0 as unknown as ReturnType<typeof setTimeout>,
  leaving: false,
  fontErrorShown: false,
  onFontStatus: null as null | ((fontId: string, next: FontStatus) => void),

  onLoad(options: Record<string, string>) {
    const existing = options.id ? getLetter(options.id) : undefined
    let letter = existing ? { ...existing } : createLetterWithDefaults()

    if (!existing && options.stationeryId) {
      letter.stationeryId = options.stationeryId
      letter.colorId = getDefaultTextColorId(getStationery(options.stationeryId).bg)
    }

    if (options.templateId) {
      const template = TEMPLATES.find((item) => item.id === options.templateId)
      if (template) letter = applyTemplateToLetter(letter, template)
    }

    letter.dateText = letter.dateText || getLetterDateText(letter)
    this.draft = letter

    this.setData({ topOffset: getTopInsets().topOffset })
    this.refresh(true)

    this.onFontStatus = (fontId, next) => {
      this.setData({ [`fontStates.${fontId}`]: next })
      if (next === 'failed') this.warnFontFailed()
    }
    onFontStatusChange(this.onFontStatus)
  },

  /** 字体是远程下载的，失败时要说清楚，否则用户只会看到字形没变。 */
  warnFontFailed() {
    if (this.fontErrorShown) return
    this.fontErrorShown = true
    const reason = getFontError()
    let hint = '字体下载失败'
    if (reason.indexOf('domain') >= 0) hint = '字体域名未配置'
    else if (reason.indexOf('timeout') >= 0) hint = '字体下载超时'
    else if (reason.indexOf('404') >= 0) hint = '字体文件不存在'

    wx.showToast({ title: `${hint}，暂用系统字体`, icon: 'none', duration: 2600 })
  },

  onUnload() {
    if (this.onFontStatus) offFontStatusChange(this.onFontStatus)
    clearTimeout(this.persistTimer)
    if (this.leaving) return
    this.persistDraft()
  },

  refresh(syncInputs: boolean = false) {
    const letter = this.draft
    if (!letter) return

    const stationery = getStationery(letter.stationeryId)
    const styles = getLetterStyles(letter, stationery.bg)
    ensureFont(styles.fontId)

    const data: Record<string, unknown> = {
      stationery,
      stationeryId: stationery.id,
      fontId: styles.fontId,
      colorId: letter.colorId,
      layoutId: getLayout(letter.layoutId).id,
      fontSizeId: getFontSize(letter.fontSizeId).id,
      charCount: (letter.content || '').length,
      datePlaceholder: getLetterDateText(letter),
      contentStyle: [
        `font-family:'${styles.fontFamily}'`,
        `color:${styles.contentColor}`,
        `line-height:${styles.lineHeight}`,
        `font-size:${styles.contentSize * 2}rpx`,
        `text-shadow:${styles.textShadow}`,
        `text-align:${styles.align}`,
      ].join(';'),
      footerStyle: `color:${styles.footerColor};font-size:${styles.footerSize * 2}rpx`,
      placeholderStyle: `color:${styles.contentPlaceholder}`,
      footerPlaceholderStyle: `color:${styles.footerPlaceholder}`,
    }

    if (syncInputs) {
      data.title = letter.title || ''
      data.content = letter.content || ''
      data.signature = letter.signature || ''
      data.dateText = letter.dateText || ''
    }

    this.setData(data)
  },

  inputTitle(event: WechatMiniprogram.Input) {
    if (this.draft) this.draft.title = event.detail.value.trim()
  },

  /**
   * 点正文进入编辑：换出 textarea 并聚焦。
   * 光标默认落在末尾，需要改中间位置的话在 textarea 里再点一次即可。
   */
  startEditing() {
    const content = (this.draft && this.draft.content) || ''
    this.setData({ editing: true, content, cursor: content.length })
  },

  /** 失焦后换回 text 渲染，正文立刻恢复成选定的手写字体。 */
  stopEditing() {
    this.setData({ editing: false, content: (this.draft && this.draft.content) || '' })
  },

  inputContent(event: WechatMiniprogram.TextareaInput) {
    const letter = this.draft
    if (!letter) return
    letter.content = normalizeContent(event.detail.value, getLayout(letter.layoutId).align)
    this.setData({ charCount: letter.content.length })
    this.schedulePersist()
  },

  inputSignature(event: WechatMiniprogram.Input) {
    if (this.draft) this.draft.signature = event.detail.value
  },

  inputDate(event: WechatMiniprogram.Input) {
    if (this.draft) this.draft.dateText = event.detail.value
  },

  schedulePersist() {
    clearTimeout(this.persistTimer)
    this.persistTimer = setTimeout(() => this.persistDraft(), 400)
  },

  /** 静默保存草稿，与 xinxie 的自动暂存一致。 */
  persistDraft() {
    const letter = this.draft
    if (!letter || !(letter.content || '').trim()) return
    try {
      if (!letter.status) letter.status = 'draft'
      this.draft = upsertLetter({ ...letter })
    } catch (error) {
      console.error(error)
    }
  },

  saveDraft() {
    const letter = this.draft
    if (!letter) return
    try {
      letter.status = 'draft'
      letter.content = normalizeContent(letter.content || '', getLayout(letter.layoutId).align)
      this.draft = upsertLetter({ ...letter })
      wx.showToast({ title: '保存至草稿', icon: 'none' })
    } catch (error) {
      wx.showToast({ title: (error as Error).message || '保存失败', icon: 'none' })
    }
  },

  finish() {
    const letter = this.draft
    if (!letter) return
    if (!(letter.content || '').trim()) {
      wx.showToast({ title: '请先写一些内容', icon: 'none' })
      return
    }

    try {
      letter.content = normalizeContent(letter.content, getLayout(letter.layoutId).align)
      if (!(letter.title || '').trim()) letter.title = letterPreviewTitle(letter)
      letter.status = 'sent'
      const saved = upsertLetter({ ...letter })
      this.leaving = true
      clearTimeout(this.persistTimer)
      wx.redirectTo({ url: `/pages/preview/preview?id=${saved.id}&finished=1` })
    } catch (error) {
      wx.showToast({ title: (error as Error).message || '保存失败，请重试', icon: 'none' })
    }
  },

  back() {
    this.promptSaveDraft(() => {
      this.leaving = true
      const pages = getCurrentPages()
      if (pages.length > 1) wx.navigateBack()
      else wx.switchTab({ url: '/pages/index/index' })
    })
  },

  goHome() {
    this.promptSaveDraft(() => {
      this.leaving = true
      wx.switchTab({ url: '/pages/index/index' })
    })
  },

  promptSaveDraft(done: () => void) {
    const letter = this.draft
    if (!letter || !(letter.content || '').trim()) {
      done()
      return
    }

    wx.showModal({
      title: '是否保存草稿？',
      confirmText: '保存',
      cancelText: '不保存',
      success: (result) => {
        if (result.confirm) {
          try {
            letter.status = 'draft'
            this.draft = upsertLetter({ ...letter })
            wx.showToast({ title: '草稿已保存', icon: 'none' })
          } catch (error) {
            console.error(error)
          }
        }
        done()
      },
      fail: () => done(),
    })
  },

  togglePanel(event: WechatMiniprogram.BaseEvent) {
    const panel = event.currentTarget.dataset.panel as PanelName
    const next = this.data.panel === panel ? '' : panel
    this.setData({ panel: next, panelTitle: PANEL_TITLES[next] || '' })
    if (next === 'font') this.syncFontStates()
  },

  /**
   * 16 个字体包合计 70MB 以上，移动网络下不做全量预载，
   * 只有 Wi-Fi 才逐个拉取来还原「每项按自身字形预览」的效果。
   */
  syncFontStates() {
    const states: Record<string, FontStatus> = {}
    FONTS.forEach((font) => { states[font.id] = getFontStatus(font.id) })
    this.setData({ fontStates: states })
    preloadAllFontsOnWifi()
  },

  closePanel() {
    this.setData({ panel: '', panelTitle: '' })
  },

  noop() {},

  selectOption(event: WechatMiniprogram.BaseEvent) {
    const letter = this.draft
    if (!letter) return

    const key = event.currentTarget.dataset.set as keyof Letter
    const value = event.currentTarget.dataset.value as string
    let syncInputs = false

    ;(letter as unknown as Record<string, string>)[key] = value

    if (key === 'stationeryId') {
      letter.colorId = getDefaultTextColorId(getStationery(value).bg)
    }

    if (key === 'layoutId') {
      letter.content = normalizeContent(letter.content || '', getLayout(value).align)
      syncInputs = true
    }

    if (key === 'fontId') {
      this.fontErrorShown = false
      loadFont(value)
    }

    this.refresh(syncInputs)
    this.schedulePersist()
  },
})

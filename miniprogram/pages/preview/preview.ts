import { Letter } from '../../models/letter'
import { letterPreviewTitle } from '../../data/templates'
import {
  createLetter, deleteLetter, generateId, getLetter, toggleFavorite, upsertLetter,
} from '../../utils/store'
import { exportLetterImage, saveImageToAlbum } from '../../utils/export'
import { setPendingMailboxFilter } from '../../utils/nav'
import { getTopInsets } from '../../utils/page'

/** 与 letter-card 组件一致的信纸原始尺寸（rpx）。 */
const CARD_WIDTH_RPX = 678
const CARD_HEIGHT_RPX = 1205

/**
 * 信纸之外的固定占用高度（rpx），与 preview.less / app.less 中的取值保持一致。
 * 顶部胶囊区与底部安全区不含在内，按 px 单独计算。
 */
const HEADER_RPX = 28 + 80 + 16
const QUICK_BAR_RPX = 8 + 78 + 24
const ACTIONS_RPX = 40 + 104 + 16 + 39 + 32
const CONTAINER_PADDING_RPX = 32 + 32
const FINISH_BANNER_RPX = 28 + 56 + 44

Page({
  data: {
    topOffset: 64,
    letter: null as Letter | null,
    finished: false,
    moreOpen: false,
    cardScale: 1,
    scaleBoxWidth: CARD_WIDTH_RPX,
    scaleBoxHeight: CARD_HEIGHT_RPX,
  },

  exporting: false,
  sharePath: '',

  onLoad(options: Record<string, string>) {
    const letter = options.id ? getLetter(options.id) : undefined
    if (!letter) {
      wx.showToast({ title: '信件不存在', icon: 'none' })
      setTimeout(() => this.back(), 600)
      return
    }

    const finished = options.finished === '1'
    this.setData({
      topOffset: getTopInsets().topOffset,
      letter,
      finished,
      ...this.fitCard(finished),
    })
  },

  onShow() {
    const current = this.data.letter
    if (!current) return
    const fresh = getLetter(current.id)
    if (fresh) this.setData({ letter: fresh })
  },

  /**
   * 按屏幕剩余高度等比缩放信纸，保证底部四个操作按钮始终在屏内。
   * 这里同步算出比例，避免依赖渲染后测量导致真机上信纸迟迟不出现。
   */
  fitCard(finished: boolean) {
    const info = wx.getSystemInfoSync()
    const rpxToPx = info.windowWidth / 750
    const safeBottom = info.safeArea
      ? Math.max(0, info.screenHeight - info.safeArea.bottom)
      : 0

    let chromeRpx = HEADER_RPX + QUICK_BAR_RPX + ACTIONS_RPX + CONTAINER_PADDING_RPX
    if (finished) chromeRpx += FINISH_BANNER_RPX

    const available = info.windowHeight
      - getTopInsets().topOffset
      - safeBottom
      - chromeRpx * rpxToPx
    const raw = available / (CARD_HEIGHT_RPX * rpxToPx)
    const scale = Math.round(Math.min(1, Math.max(0.4, raw)) * 1000) / 1000

    return {
      cardScale: scale,
      scaleBoxWidth: CARD_WIDTH_RPX * scale,
      scaleBoxHeight: CARD_HEIGHT_RPX * scale,
    }
  },

  onShareAppMessage(): WechatMiniprogram.Page.ICustomShareContent {
    const letter = this.data.letter
    const title = letter ? `📮 有一封信送给你 · ${letterPreviewTitle(letter)}` : '📮 有一封信送给你'
    const content: WechatMiniprogram.Page.ICustomShareContent = {
      title,
      path: letter ? `/pages/preview/preview?id=${letter.id}` : '/pages/index/index',
    }
    if (this.sharePath) content.imageUrl = this.sharePath
    return content
  },

  back() {
    const pages = getCurrentPages()
    if (pages.length > 1) wx.navigateBack()
    else wx.switchTab({ url: '/pages/index/index' })
  },

  goHome() {
    wx.switchTab({ url: '/pages/index/index' })
  },

  goDrafts() {
    setPendingMailboxFilter('drafts')
    wx.switchTab({ url: '/pages/mailbox/mailbox' })
  },

  toggleStar() {
    const letter = this.data.letter
    if (!letter) return
    const updated = toggleFavorite(letter.id)
    if (updated) this.setData({ letter: updated })
  },

  openMore() {
    this.setData({ moreOpen: true })
  },

  closeMore() {
    this.setData({ moreOpen: false })
  },

  noop() {},

  editLetter() {
    const letter = this.data.letter
    if (!letter) return
    this.setData({ moreOpen: false })
    wx.navigateTo({ url: `/pages/compose/compose?id=${letter.id}` })
  },

  async buildImage(): Promise<string> {
    const letter = this.data.letter
    if (!letter) throw new Error('信件不存在')
    const path = await exportLetterImage(letter, '#export-canvas', this as unknown as WechatMiniprogram.Component.TrivialInstance)
    this.sharePath = path
    return path
  },

  async saveLocal() {
    if (this.exporting) return
    this.exporting = true
    wx.showLoading({ title: '正在生成图片' })

    try {
      const path = await this.buildImage()
      wx.hideLoading()
      wx.showLoading({ title: '正在保存' })
      await saveImageToAlbum(path)
      wx.hideLoading()
      wx.showToast({ title: '已保存至相册', icon: 'none' })
    } catch (error) {
      wx.hideLoading()
      wx.showToast({ title: (error as Error).message || '保存失败，请重试', icon: 'none' })
    } finally {
      this.exporting = false
    }
  },

  async shareImage() {
    if (this.exporting) return
    this.exporting = true
    this.setData({ moreOpen: false })
    wx.showLoading({ title: '正在生成信件' })

    try {
      const path = await this.buildImage()
      wx.hideLoading()
      wx.showShareImageMenu({
        path,
        fail: () => {
          wx.showToast({ title: '已取消', icon: 'none' })
        },
      })
    } catch (error) {
      wx.hideLoading()
      wx.showToast({ title: (error as Error).message || '生成失败，请重试', icon: 'none' })
    } finally {
      this.exporting = false
    }
  },

  duplicateLetter() {
    const letter = this.data.letter
    if (!letter) return
    const copy = createLetter({
      ...letter,
      id: generateId(),
      status: 'draft',
      favorited: false,
      title: `${letter.title} (副本)`,
    })
    upsertLetter(copy)
    this.setData({ moreOpen: false })
    wx.showToast({ title: '已复制', icon: 'none' })
  },

  deleteLetter() {
    const letter = this.data.letter
    if (!letter) return
    wx.showModal({
      title: '删除信件',
      content: '确定移到已删除吗？',
      success: (result) => {
        if (!result.confirm) return
        deleteLetter(letter.id)
        this.setData({ moreOpen: false })
        setPendingMailboxFilter('deleted')
        wx.showToast({ title: '已移到已删除', icon: 'none' })
        wx.switchTab({ url: '/pages/mailbox/mailbox' })
      },
    })
  },
})

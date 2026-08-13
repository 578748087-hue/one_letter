import { STATIONERY, TEMPLATES } from '../../data/options'
import { getLetters } from '../../utils/letters'

Page({
  data: {
    greeting: '',
    counts: { drafts: 0, sent: 0, favorites: 0 },
    stationery: STATIONERY.slice(0, 4),
    inspirations: TEMPLATES.filter((item) => item.id !== 'blank'),
  },

  onShow() {
    const hour = new Date().getHours()
    const letters = getLetters()
    this.setData({
      greeting: hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening',
      counts: {
        drafts: letters.filter((item) => item.status === 'draft').length,
        sent: letters.filter((item) => item.status === 'sent').length,
        favorites: letters.filter((item) => item.favorited).length,
      },
    })
  },

  compose() { wx.navigateTo({ url: '/pages/compose/compose' }) },
  openMailbox(event: WechatMiniprogram.BaseEvent) {
    wx.setStorageSync('mailbox_filter', event.currentTarget.dataset.filter)
    wx.switchTab({ url: '/pages/mailbox/mailbox' })
  },
  openStationery() { wx.navigateTo({ url: '/pages/stationery/stationery' }) },
  chooseStationery(event: WechatMiniprogram.BaseEvent) {
    wx.navigateTo({ url: `/pages/compose/compose?stationeryId=${event.currentTarget.dataset.id}` })
  },
  useTemplate(event: WechatMiniprogram.BaseEvent) {
    wx.navigateTo({ url: `/pages/compose/compose?templateId=${event.currentTarget.dataset.id}` })
  },
})

import { STATIONERY } from '../../data/stationery'
import { BANNER_TEMPLATES } from '../../data/templates'
import { getCounts } from '../../utils/store'
import { setPendingMailboxFilter } from '../../utils/nav'
import { getTopInsets, syncTabBar } from '../../utils/page'

function getGreetingEn(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 18) return 'Good Afternoon'
  return 'Good Evening'
}

Page({
  data: {
    statusBarHeight: 20,
    greetingEn: getGreetingEn(),
    counts: getCounts(),
    stationery: STATIONERY.slice(0, 4),
    banners: BANNER_TEMPLATES,
  },

  onLoad() {
    this.setData({ statusBarHeight: getTopInsets().statusBarHeight })
  },

  onShow() {
    syncTabBar(this, 0)
    this.setData({
      greetingEn: getGreetingEn(),
      counts: getCounts(),
    })
  },

  compose() {
    wx.navigateTo({ url: '/pages/compose/compose' })
  },

  composeTemplate(event: WechatMiniprogram.BaseEvent) {
    const templateId = event.currentTarget.dataset.template as string
    wx.navigateTo({ url: `/pages/compose/compose?templateId=${templateId}` })
  },

  openMailbox(event: WechatMiniprogram.BaseEvent) {
    setPendingMailboxFilter(event.currentTarget.dataset.filter as string)
    wx.switchTab({ url: '/pages/mailbox/mailbox' })
  },

  openStationery() {
    wx.navigateTo({ url: '/pages/stationery/stationery' })
  },

  pickStationery(event: WechatMiniprogram.BaseEvent) {
    const id = event.currentTarget.dataset.id as string
    wx.navigateTo({ url: `/pages/compose/compose?stationeryId=${id}` })
  },

  comingSoon() {
    wx.showToast({ title: '功能待开放', icon: 'none' })
  },
})

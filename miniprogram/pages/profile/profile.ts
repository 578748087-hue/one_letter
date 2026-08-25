import { APP_VERSION } from '../../config/index'
import { getCounts } from '../../utils/store'
import { setPendingMailboxFilter } from '../../utils/nav'
import { getTopInsets, syncTabBar } from '../../utils/page'

Page({
  data: {
    topOffset: 64,
    version: APP_VERSION,
    counts: getCounts(),
  },

  onLoad() {
    this.setData({ topOffset: getTopInsets().topOffset })
  },

  onShow() {
    syncTabBar(this, 2)
    this.setData({ counts: getCounts() })
  },

  openMailbox(event: WechatMiniprogram.BaseEvent) {
    setPendingMailboxFilter(event.currentTarget.dataset.filter as string)
    wx.switchTab({ url: '/pages/mailbox/mailbox' })
  },
})

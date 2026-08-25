import { CATEGORIES, STATIONERY } from '../../data/stationery'
import { getTopInsets } from '../../utils/page'

Page({
  data: {
    topOffset: 64,
    categories: CATEGORIES,
    filter: 'all',
    papers: STATIONERY,
  },

  onLoad() {
    this.setData({ topOffset: getTopInsets().topOffset })
  },

  changeFilter(event: WechatMiniprogram.BaseEvent) {
    const filter = event.currentTarget.dataset.id as string
    this.setData({
      filter,
      papers: filter === 'all' ? STATIONERY : STATIONERY.filter((item) => item.category === filter),
    })
  },

  pickStationery(event: WechatMiniprogram.BaseEvent) {
    const id = event.currentTarget.dataset.id as string
    wx.navigateTo({ url: `/pages/compose/compose?stationeryId=${id}` })
  },

  back() {
    const pages = getCurrentPages()
    if (pages.length > 1) wx.navigateBack()
    else wx.switchTab({ url: '/pages/index/index' })
  },
})

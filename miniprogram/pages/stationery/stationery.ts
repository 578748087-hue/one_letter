import { STATIONERY } from '../../data/options'

Page({
  data: { categories: [{ id: 'all', name: '全部' }, { id: 'minimalist', name: '简约' }, { id: 'nature', name: '自然' }, { id: 'vintage', name: '复古' }], category: 'all', items: STATIONERY },
  filter(event: WechatMiniprogram.BaseEvent) {
    const category = event.currentTarget.dataset.id
    this.setData({ category, items: category === 'all' ? STATIONERY : STATIONERY.filter((item) => item.category === category) })
  },
  choose(event: WechatMiniprogram.BaseEvent) { wx.navigateTo({ url: `/pages/compose/compose?stationeryId=${event.currentTarget.dataset.id}` }) },
})

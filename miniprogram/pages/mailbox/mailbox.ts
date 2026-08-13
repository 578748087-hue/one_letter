import { getStationery } from '../../data/options'
import { Letter } from '../../models/letter'
import { formatDate, getLetters, getTitle, toggleFavorite } from '../../utils/letters'

interface LetterView extends Letter { displayTitle: string; displayDate: string; preview: string; image: string }

Page({
  data: {
    filter: 'all',
    tabs: [
      { id: 'all', name: '全部' }, { id: 'sent', name: '已寄出' },
      { id: 'draft', name: '草稿' }, { id: 'favorite', name: '收藏' },
    ],
    letters: [] as LetterView[],
  },
  onShow() {
    const filter = wx.getStorageSync<string>('mailbox_filter') || this.data.filter
    wx.removeStorageSync('mailbox_filter')
    this.load(filter)
  },
  load(filter: string) {
    let letters = getLetters()
    if (filter === 'sent' || filter === 'draft') letters = letters.filter((item) => item.status === filter)
    if (filter === 'favorite') letters = letters.filter((item) => item.favorited)
    const views = letters.map((item) => ({ ...item, displayTitle: getTitle(item), displayDate: formatDate(item.updatedAt), preview: item.content.slice(0, 40) || '空白信件', image: getStationery(item.stationeryId).image }))
    this.setData({ filter, letters: views })
  },
  changeFilter(event: WechatMiniprogram.BaseEvent) { this.load(event.currentTarget.dataset.id) },
  open(event: WechatMiniprogram.BaseEvent) { wx.navigateTo({ url: `/pages/preview/preview?id=${event.currentTarget.dataset.id}` }) },
  edit(event: WechatMiniprogram.BaseEvent) { wx.navigateTo({ url: `/pages/compose/compose?id=${event.currentTarget.dataset.id}` }) },
  favorite(event: WechatMiniprogram.BaseEvent) { toggleFavorite(event.currentTarget.dataset.id); this.load(this.data.filter) },
  compose() { wx.navigateTo({ url: '/pages/compose/compose' }) },
})

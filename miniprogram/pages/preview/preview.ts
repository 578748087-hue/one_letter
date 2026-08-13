import { COLORS, FONTS, FONT_SIZES, LAYOUTS, getStationery } from '../../data/options'
import { Letter } from '../../models/letter'
import { getLetter, removeLetter, toggleFavorite } from '../../utils/letters'

Page({
  data: { letter: {} as Letter, stationery: getStationery('paper-for-you'), fontFamily: 'serif', textColor: '#2c2c28', textAlign: 'left', fontSize: 30, finished: false },
  onLoad(options: Record<string, string>) {
    const letter = getLetter(options.id)
    if (!letter) { wx.showToast({ title: '信件不存在', icon: 'none' }); wx.navigateBack(); return }
    this.setData({ letter, stationery: getStationery(letter.stationeryId), fontFamily: FONTS.find((item) => item.id === letter.fontId)?.value || 'serif', textColor: COLORS.find((item) => item.id === letter.colorId)?.value || '#2c2c28', textAlign: LAYOUTS.find((item) => item.id === letter.layoutId)?.value || 'left', fontSize: FONT_SIZES.find((item) => item.id === letter.fontSizeId)?.value || 30, finished: options.finished === '1' })
  },
  edit() { wx.redirectTo({ url: `/pages/compose/compose?id=${this.data.letter.id}` }) },
  favorite() { const letter = toggleFavorite(this.data.letter.id); if (letter) this.setData({ letter }) },
  remove() { wx.showModal({ title: '删除信件', content: '删除后无法恢复，确定继续吗？', success: (result) => { if (result.confirm) { removeLetter(this.data.letter.id); wx.switchTab({ url: '/pages/mailbox/mailbox' }) } } }) },
  onShareAppMessage() { return { title: '给你的一封信', path: `/pages/preview/preview?id=${this.data.letter.id}` } },
})

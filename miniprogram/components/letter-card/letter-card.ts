import { Letter } from '../../models/letter'
import { getStationery } from '../../data/stationery'
import { getLetterDateText, getLetterStyles, normalizeContent } from '../../utils/letter-render'
import { ensureFont } from '../../utils/font-loader'

Component({
  options: {
    styleIsolation: 'apply-shared',
  },

  properties: {
    letter: { type: Object, value: {} },
  },

  data: {
    image: '',
    bg: '#f7f5f0',
    content: '',
    dateText: '',
    signature: '',
    contentStyle: '',
    footerStyle: '',
  },

  observers: {
    letter(letter: Letter) {
      if (!letter || !letter.id) return
      const stationery = getStationery(letter.stationeryId)
      const styles = getLetterStyles(letter, stationery.bg)
      ensureFont(styles.fontId)

      this.setData({
        image: stationery.image,
        bg: stationery.bg,
        content: normalizeContent(letter.content || '', styles.align),
        signature: letter.signature || '',
        dateText: getLetterDateText(letter),
        contentStyle: [
          `font-family:'${styles.fontFamily}'`,
          `color:${styles.contentColor}`,
          `line-height:${styles.lineHeight}`,
          `font-size:${styles.contentSize * 2}rpx`,
          `text-shadow:${styles.textShadow}`,
          `text-align:${styles.align}`,
        ].join(';'),
        footerStyle: `color:${styles.footerColor};font-size:${styles.footerSize * 2}rpx`,
      })
    },
  },
})

import { setPendingMailboxFilter } from '../utils/nav'

const ACTIVE_COLOR = '#3a3834'
const INACTIVE_COLOR = '#b0aca6'

Component({
  data: {
    selected: 0,
    activeColor: ACTIVE_COLOR,
    inactiveColor: INACTIVE_COLOR,
  },

  methods: {
    switchTab(event: WechatMiniprogram.BaseEvent) {
      const { index, path } = event.currentTarget.dataset as { index: number; path: string }
      if (path === 'compose') {
        wx.navigateTo({ url: '/pages/compose/compose' })
        return
      }
      // 与 xinxie 一致：从底部导航进入信箱时始终回到「全部」。
      if (path === '/pages/mailbox/mailbox') setPendingMailboxFilter('all')
      this.setData({ selected: index })
      wx.switchTab({ url: path })
    },
  },
})

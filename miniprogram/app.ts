import { preloadDefaultFont } from './utils/font-loader'

App<IAppOption>({
  globalData: {
    statusBarHeight: 20,
    navBarHeight: 44,
    topOffset: 64,
  },

  onLaunch() {
    this.measureNavBar()
    preloadDefaultFont()
  },

  measureNavBar() {
    try {
      const statusBarHeight = wx.getSystemInfoSync().statusBarHeight || 20
      let navBarHeight = 44

      const menuButton = wx.getMenuButtonBoundingClientRect()
      if (menuButton && menuButton.height) {
        navBarHeight = (menuButton.top - statusBarHeight) * 2 + menuButton.height
      }

      this.globalData.statusBarHeight = statusBarHeight
      this.globalData.navBarHeight = navBarHeight
      this.globalData.topOffset = statusBarHeight + navBarHeight
    } catch (_error) {
      /* 保留默认值 */
    }
  },
})

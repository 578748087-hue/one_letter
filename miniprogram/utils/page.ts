interface TopInsets {
  statusBarHeight: number
  navBarHeight: number
  topOffset: number
}

const FALLBACK: TopInsets = { statusBarHeight: 20, navBarHeight: 44, topOffset: 64 }

export function getTopInsets(): TopInsets {
  try {
    const app = getApp<IAppOption>()
    if (app && app.globalData && app.globalData.topOffset) return app.globalData
  } catch (_error) {
    /* 兜底 */
  }
  return FALLBACK
}

interface TabBarHost {
  getTabBar?: () => { setData: (data: Record<string, unknown>) => void } | undefined
}

export function syncTabBar(page: TabBarHost, selected: number): void {
  if (typeof page.getTabBar !== 'function') return
  const tabBar = page.getTabBar()
  if (tabBar) tabBar.setData({ selected })
}

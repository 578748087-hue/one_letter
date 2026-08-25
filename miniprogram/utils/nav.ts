import { MailboxFilter } from './store'

const PENDING_FILTER_KEY = 'pending_mailbox_filter'

const VALID_FILTERS: MailboxFilter[] = ['all', 'sent', 'favorited', 'drafts', 'deleted']

export function setPendingMailboxFilter(filter: string): void {
  wx.setStorageSync(PENDING_FILTER_KEY, filter)
}

/** 读取一次即清空，避免下次进入信箱时沿用旧筛选。 */
export function takePendingMailboxFilter(): MailboxFilter | null {
  try {
    const value = wx.getStorageSync<string>(PENDING_FILTER_KEY)
    if (!value) return null
    wx.removeStorageSync(PENDING_FILTER_KEY)
    return VALID_FILTERS.indexOf(value as MailboxFilter) >= 0 ? (value as MailboxFilter) : null
  } catch (_error) {
    return null
  }
}

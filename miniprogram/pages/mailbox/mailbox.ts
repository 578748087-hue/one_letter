import { getStationery } from '../../data/stationery'
import { letterPreviewTitle } from '../../data/templates'
import { Letter } from '../../models/letter'
import {
  MailboxFilter, deleteLetters, filterLetters, getCounts,
  permanentlyDeleteLetters, toggleFavorite,
} from '../../utils/store'
import { formatListDate } from '../../utils/letter-render'
import { takePendingMailboxFilter } from '../../utils/nav'
import { getTopInsets, syncTabBar } from '../../utils/page'

const EMPTY_MESSAGES: Record<MailboxFilter, string> = {
  all: '还没有信件\n写第一封信吧',
  sent: '还没有已寄出的信件',
  favorited: '还没有收藏的信件',
  drafts: '还没有草稿',
  deleted: '还没有已删除的信件',
}

interface MailboxItem {
  id: string
  image: string
  bg: string
  displayTitle: string
  preview: string
  displayDate: string
  favorited: boolean
  selected: boolean
}

function toItem(letter: Letter, selectedIds: string[]): MailboxItem {
  const stationery = getStationery(letter.stationeryId)
  return {
    id: letter.id,
    image: stationery.image,
    bg: stationery.bg,
    displayTitle: letterPreviewTitle(letter),
    preview: (letter.content || '').slice(0, 50) || '空白信件',
    displayDate: formatListDate(letter.updatedAt),
    favorited: !!letter.favorited,
    selected: selectedIds.indexOf(letter.id) >= 0,
  }
}

Page({
  data: {
    topOffset: 64,
    filter: 'all' as MailboxFilter,
    tabs: [] as { id: MailboxFilter; name: string; count: number }[],
    letters: [] as MailboxItem[],
    emptyMessage: EMPTY_MESSAGES.all,
    isDeletedView: false,
    hasManageLetters: false,
    selectMode: false,
    selectedIds: [] as string[],
    allSelected: false,
    batchDeleteLabel: '删除',
  },

  onLoad() {
    this.setData({ topOffset: getTopInsets().topOffset })
  },

  onShow() {
    syncTabBar(this, 1)
    const pending = takePendingMailboxFilter()
    if (pending) {
      this.setData({ filter: pending, selectMode: false, selectedIds: [] })
    }
    this.refresh()
  },

  refresh() {
    const { filter, selectMode } = this.data
    const counts = getCounts()
    const letters = filterLetters(filter)
    const selectedIds = this.data.selectedIds.filter(
      (id) => letters.some((letter) => letter.id === id),
    )
    const isDeletedView = filter === 'deleted'

    this.setData({
      tabs: [
        { id: 'all', name: '全部', count: counts.all },
        { id: 'sent', name: '已寄出', count: counts.mailbox },
        { id: 'favorited', name: '已收藏', count: counts.favorites },
        { id: 'drafts', name: '草稿', count: counts.drafts },
        { id: 'deleted', name: '已删除', count: counts.deleted },
      ],
      letters: letters.map((letter) => toItem(letter, selectedIds)),
      emptyMessage: EMPTY_MESSAGES[filter] || EMPTY_MESSAGES.all,
      isDeletedView,
      hasManageLetters: counts.all > 0 || counts.deleted > 0,
      selectedIds,
      allSelected: letters.length > 0 && letters.every((letter) => selectedIds.indexOf(letter.id) >= 0),
      batchDeleteLabel: this.buildBatchLabel(isDeletedView, selectedIds.length),
      selectMode: selectMode && (counts.all > 0 || counts.deleted > 0),
    })
  },

  buildBatchLabel(isDeletedView: boolean, count: number): string {
    return `${isDeletedView ? '彻底删除' : '删除'}${count > 0 ? ` (${count})` : ''}`
  },

  changeFilter(event: WechatMiniprogram.BaseEvent) {
    this.setData({
      filter: event.currentTarget.dataset.id as MailboxFilter,
      selectedIds: [],
    })
    this.refresh()
  },

  tapItem(event: WechatMiniprogram.BaseEvent) {
    const id = event.currentTarget.dataset.id as string
    if (this.data.selectMode) {
      this.toggleSelect(id)
      return
    }
    wx.navigateTo({ url: `/pages/preview/preview?id=${id}` })
  },

  toggleSelect(id: string) {
    const selectedIds = this.data.selectedIds.slice()
    const index = selectedIds.indexOf(id)
    if (index >= 0) selectedIds.splice(index, 1)
    else selectedIds.push(id)

    this.setData({
      selectedIds,
      letters: this.data.letters.map((item) => ({
        ...item,
        selected: selectedIds.indexOf(item.id) >= 0,
      })),
      allSelected: this.data.letters.length > 0
        && this.data.letters.every((item) => selectedIds.indexOf(item.id) >= 0),
      batchDeleteLabel: this.buildBatchLabel(this.data.isDeletedView, selectedIds.length),
    })
  },

  toggleAll() {
    const selectedIds = this.data.allSelected ? [] : this.data.letters.map((item) => item.id)
    this.setData({
      selectedIds,
      letters: this.data.letters.map((item) => ({
        ...item,
        selected: selectedIds.indexOf(item.id) >= 0,
      })),
      allSelected: !this.data.allSelected && selectedIds.length > 0,
      batchDeleteLabel: this.buildBatchLabel(this.data.isDeletedView, selectedIds.length),
    })
  },

  enterSelect() {
    this.setData({ selectMode: true, selectedIds: [] })
    this.refresh()
  },

  cancelSelect() {
    this.setData({ selectMode: false, selectedIds: [] })
    this.refresh()
  },

  batchDelete() {
    const ids = this.data.selectedIds
    if (ids.length === 0) return

    const isDeletedView = this.data.isDeletedView
    wx.showModal({
      title: isDeletedView ? '彻底删除' : '删除信件',
      content: isDeletedView
        ? `确定彻底删除选中的 ${ids.length} 封信吗？此操作不可恢复。`
        : `确定删除选中的 ${ids.length} 封信吗？`,
      success: (result) => {
        if (!result.confirm) return
        if (isDeletedView) {
          permanentlyDeleteLetters(ids)
          wx.showToast({ title: `已彻底删除 ${ids.length} 封信`, icon: 'none' })
        } else {
          deleteLetters(ids)
          wx.showToast({ title: `已移到已删除 ${ids.length} 封信`, icon: 'none' })
        }
        this.setData({ selectedIds: [], selectMode: false })
        this.refresh()
      },
    })
  },

  toggleStar(event: WechatMiniprogram.BaseEvent) {
    const id = event.currentTarget.dataset.id as string
    const letter = toggleFavorite(id)
    if (!letter) return

    if (this.data.filter === 'favorited' && !letter.favorited) {
      this.refresh()
      return
    }

    this.setData({
      letters: this.data.letters.map((item) => (
        item.id === id ? { ...item, favorited: letter.favorited } : item
      )),
      tabs: this.data.tabs.map((tab) => (
        tab.id === 'favorited'
          ? { ...tab, count: tab.count + (letter.favorited ? 1 : -1) }
          : tab
      )),
    })
  },

  editLetter(event: WechatMiniprogram.BaseEvent) {
    const id = event.currentTarget.dataset.id as string
    wx.navigateTo({ url: `/pages/compose/compose?id=${id}` })
  },

  compose() {
    wx.navigateTo({ url: '/pages/compose/compose' })
  },
})

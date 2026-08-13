import { Stationery } from '../models/letter'

export const STATIONERY: Stationery[] = [
  { id: 'paper-for-you', name: '叶影 FOR YOU', category: 'nature', image: '/assets/stationery/paper-for-you.png', background: '#f7f5f0' },
  { id: 'paper-bamboo', name: '水墨竹枝', category: 'nature', image: '/assets/stationery/paper-bamboo.png', background: '#f5f2ea' },
  { id: 'paper-border-grey', name: '极简灰框', category: 'minimalist', image: '/assets/stationery/paper-border-grey.png', background: '#ffffff' },
  { id: 'paper-apricot', name: '奶杏温柔', category: 'minimalist', image: '/assets/stationery/paper-apricot.png', background: '#f5ebe0' },
  { id: 'paper-warm', name: '暖橙细线', category: 'nature', image: '/assets/stationery/paper-warm.png', background: '#f8f4ee' },
  { id: 'paper-cream-apricot', name: '奶杏细线', category: 'minimalist', image: '/assets/stationery/paper-cream-apricot.webp', background: '#f4e7d4' },
  { id: 'paper-milk-tea', name: '奶茶暖棕', category: 'vintage', image: '/assets/stationery/paper-milk-tea.webp', background: '#e7c6ae' },
  { id: 'paper-slate-blue', name: '雾面藏蓝', category: 'minimalist', image: '/assets/stationery/paper-slate-blue.webp', background: '#a8b8c7' },
  { id: 'paper-vintage-yellow', name: '复古奶黄', category: 'vintage', image: '/assets/stationery/paper-vintage-yellow.webp', background: '#fef5d8' },
  { id: 'paper-off-white', name: '高级米白', category: 'minimalist', image: '/assets/stationery/paper-off-white.webp', background: '#f8f0e5' },
  { id: 'paper-khaki', name: '卡其复古', category: 'vintage', image: '/assets/stationery/paper-khaki.webp', background: '#cdad86' },
  { id: 'paper-leaf-frame', name: '浅米枝叶', category: 'nature', image: '/assets/stationery/paper-leaf-frame.webp', background: '#f7f6f1' },
]

export const TEMPLATES = [
  { id: 'blank', name: '空白信纸', content: '' },
  { id: 'future-self', name: '给未来的自己', content: '当你读到这封信的时候，不知道过了多久。此刻的我，正把心里的话慢慢写下来。\n\n希望你还记得现在的梦想，也记得那些让你微笑的小事。愿你温柔，也愿你勇敢。' },
  { id: 'gratitude', name: '感恩信', content: '想对你说一声谢谢。谢谢你出现在我的生命里，带给我温暖和力量。\n\n那些一起走过的日子和无声的陪伴，我都记在心里。愿你一切安好。' },
  { id: 'love', name: '情书', content: '见字如面。\n\n想用这封信，把平时说不出口的话慢慢写给你。愿我们的故事，经得起时间的翻阅。' },
  { id: 'farewell', name: '告别信', content: '到了该说再见的时候了。不是结束，而是另一段旅程的开始。\n\n感谢相遇，感谢陪伴。愿你前路光明，万事顺遂。' },
]

export const FONTS = [
  { id: 'serif', name: '宋体', value: 'serif' },
  { id: 'sans', name: '清雅黑体', value: 'sans-serif' },
  { id: 'cursive', name: '手写体', value: 'cursive' },
]

export const COLORS = [
  { id: 'dark', name: '墨黑', value: '#2c2c28' },
  { id: 'sage', name: '青墨', value: '#3d5248' },
  { id: 'brown', name: '褐棕', value: '#5c4a3a' },
  { id: 'grey', name: '灰褐', value: '#6b6560' },
]

export const LAYOUTS = [
  { id: 'left', name: '左对齐', value: 'left' },
  { id: 'center', name: '居中', value: 'center' },
  { id: 'right', name: '右对齐', value: 'right' },
]

export const FONT_SIZES = [
  { id: 'small', name: '小', value: 30 },
  { id: 'medium', name: '中', value: 34 },
  { id: 'large', name: '大', value: 38 },
]

export function getStationery(id: string): Stationery {
  return STATIONERY.find((item) => item.id === id) || STATIONERY[0]
}

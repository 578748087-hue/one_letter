import {
  ColorOption, FontOption, FontSizeOption, LayoutOption, Stationery,
} from '../models/letter'

export const STATIONERY: Stationery[] = [
  { id: 'paper-for-you', name: '叶影 FOR YOU', category: 'nature', image: '/assets/stationery/paper-for-you.jpg', bg: '#f7f5f0' },
  { id: 'paper-bamboo', name: '水墨竹枝', category: 'nature', image: '/assets/stationery/paper-bamboo.jpg', bg: '#f5f2ea' },
  { id: 'paper-border-grey', name: '极简灰框', category: 'minimalist', image: '/assets/stationery/paper-border-grey.jpg', bg: '#ffffff' },
  { id: 'paper-apricot', name: '奶杏温柔', category: 'minimalist', image: '/assets/stationery/paper-apricot.jpg', bg: '#f5ebe0' },
  { id: 'paper-warm', name: '暖橙细线', category: 'nature', image: '/assets/stationery/paper-warm.jpg', bg: '#f8f4ee' },
  { id: 'paper-cream-apricot', name: '奶杏细线', category: 'minimalist', image: '/assets/stationery/paper-cream-apricot.jpg', bg: '#f4e7d4' },
  { id: 'paper-milk-tea', name: '奶茶暖棕', category: 'vintage', image: '/assets/stationery/paper-milk-tea.jpg', bg: '#e7c6ae' },
  { id: 'paper-slate-blue', name: '雾面藏蓝', category: 'minimalist', image: '/assets/stationery/paper-slate-blue.jpg', bg: '#a8b8c7' },
  { id: 'paper-vintage-yellow', name: '复古奶黄', category: 'vintage', image: '/assets/stationery/paper-vintage-yellow.jpg', bg: '#fef5d8' },
  { id: 'paper-off-white', name: '高级米白', category: 'minimalist', image: '/assets/stationery/paper-off-white.jpg', bg: '#f8f0e5' },
  { id: 'paper-khaki', name: '卡其复古', category: 'vintage', image: '/assets/stationery/paper-khaki.jpg', bg: '#cdad86' },
  { id: 'paper-leaf-frame', name: '浅米枝叶', category: 'nature', image: '/assets/stationery/paper-leaf-frame.jpg', bg: '#f7f6f1' },
  { id: 'paper-cream-bloom', name: '奶油小朵', category: 'nature', image: '/assets/stationery/paper-cream-bloom.jpg', bg: '#fbf1ce' },
  { id: 'paper-oat', name: '燕麦卡其', category: 'minimalist', image: '/assets/stationery/paper-oat.jpg', bg: '#e5d6c1' },
  { id: 'paper-mist-blue', name: '雾霾灰蓝', category: 'minimalist', image: '/assets/stationery/paper-mist-blue.jpg', bg: '#c5d6e0' },
  { id: 'paper-lavender', name: '灰紫薰衣草', category: 'nature', image: '/assets/stationery/paper-lavender.jpg', bg: '#e5ddec' },
  { id: 'paper-haze-blue', name: '雾霾蓝', category: 'minimalist', image: '/assets/stationery/paper-haze-blue.jpg', bg: '#cadff0' },
  { id: 'paper-sage-green', name: '莫兰迪灰绿', category: 'nature', image: '/assets/stationery/paper-sage-green.jpg', bg: '#c6cfba' },
  { id: 'paper-tea-brown', name: '奶茶印记', category: 'vintage', image: '/assets/stationery/paper-tea-brown.jpg', bg: '#cfad94' },
  { id: 'paper-rice-xuan', name: '米杏宣纸', category: 'vintage', image: '/assets/stationery/paper-rice-xuan.jpg', bg: '#f7ead9' },
  { id: 'paper-milk-white', name: '奶雾白', category: 'minimalist', image: '/assets/stationery/paper-milk-white.jpg', bg: '#fcfbf6' },
  { id: 'paper-gold-corner', name: '奶杏金线', category: 'vintage', image: '/assets/stationery/paper-gold-corner.jpg', bg: '#fdedde' },
  { id: 'paper-dusty-pink', name: '灰粉柔雾', category: 'nature', image: '/assets/stationery/paper-dusty-pink.jpg', bg: '#e3c6ca' },
  { id: 'paper-ivory', name: '奶白细线', category: 'minimalist', image: '/assets/stationery/paper-ivory.jpg', bg: '#faf7ed' },
]

export const FONTS: FontOption[] = [
  { id: 'pf-jiangnan', name: '平方江南体', family: 'PF Jiangnan', group: '平方系列' },
  { id: 'pf-shaohua', name: '平方韶华体', family: 'PF Shaohua', group: '平方系列' },
  { id: 'pf-qiaomu', name: '平方乔木体', family: 'PF Qiaomu', group: '平方系列' },
  { id: 'pf-gongzi', name: '平方公子体', family: 'PF Gongzi', group: '平方系列' },
  { id: 'pf-jiangjun', name: '平方将军体', family: 'PF Jiangjun', group: '平方系列' },
  { id: 'pf-shiguang', name: '平方时光体', family: 'PF Shiguang', group: '平方系列' },
  { id: 'pf-xingchen', name: '平方星辰体', family: 'PF Xingchen', group: '平方系列' },
  { id: 'pf-suotuo', name: '平方洒脱体', family: 'PF Suotuo', group: '平方系列' },
  { id: 'pf-sansheng', name: '平方三生体', family: 'PF Sansheng', group: '平方系列' },
  { id: 'pf-changan', name: '平方长安体', family: 'PF Changan', group: '苹方系列' },
  { id: 'pf-lele', name: '平方乐乐体', family: 'PF Lele', group: '苹方系列' },
  { id: 'pf-qingchun', name: '平方青春体', family: 'PF Qingchun', group: '苹方系列' },
  { id: 'pf-shangqian', name: '平方上上签体', family: 'PF Shangqian', group: '苹方系列' },
  { id: 'pf-zhuifeng', name: '平方追风体', family: 'PF Zhuifeng', group: '苹方系列' },
  { id: 'pf-zhuiguang', name: '平方追光体', family: 'PF Zhuiguang', group: '苹方系列' },
  { id: 'pf-xianmo', name: '平方线磨体', family: 'PF Xianmo', group: '其他' },
]

const LEGACY_FONTS: Record<string, string> = {
  kaiti: 'pf-jiangnan',
  songti: 'pf-shaohua',
  heiti: 'pf-jiangnan',
  xingshu: 'pf-suotuo',
  serif: 'pf-shaohua',
  sans: 'pf-jiangnan',
  cursive: 'pf-suotuo',
}

export function getFont(fontId: string): FontOption {
  const id = LEGACY_FONTS[fontId] || fontId
  return FONTS.find((item) => item.id === id) || FONTS[0]
}

export const TEXT_COLORS: ColorOption[] = [
  { id: 'dark', value: '#2c2c28', name: '墨黑', group: '深色系' },
  { id: 'sage', value: '#3d5248', name: '青墨', group: '深色系' },
  { id: 'brown', value: '#5c4a3a', name: '褐棕', group: '深色系' },
  { id: 'grey', value: '#6b6560', name: '灰褐', group: '深色系' },
  { id: 'dusty-purple', value: '#524a58', name: '烟紫', group: '深色系' },
  { id: 'slate-navy', value: '#3e4d5c', name: '藏青', group: '深色系' },
  { id: 'light-moon', value: '#faf6f0', name: '月白', group: '浅色系' },
  { id: 'light-apricot', value: '#f0e6d8', name: '浅杏', group: '浅色系' },
  { id: 'light-mist', value: '#e9eef2', name: '雾白', group: '浅色系' },
  { id: 'light-cream', value: '#f5efe6', name: '奶绒', group: '浅色系' },
  { id: 'light-blush', value: '#f2e8e6', name: '淡粉', group: '浅色系' },
  { id: 'light-cloud', value: '#e8ecef', name: '云灰', group: '浅色系' },
]

export function getTextColor(colorId: string): ColorOption {
  return TEXT_COLORS.find((item) => item.id === colorId) || TEXT_COLORS[0]
}

export const LAYOUTS: LayoutOption[] = [
  { id: 'left', name: '左对齐', align: 'left', lineHeight: 1.75 },
  { id: 'right', name: '右对齐', align: 'right', lineHeight: 1.75 },
  { id: 'center', name: '居中', align: 'center', lineHeight: 1.75 },
]

const LEGACY_LAYOUTS: Record<string, string> = { wide: 'left' }

export function getLayout(layoutId: string): LayoutOption {
  const id = LEGACY_LAYOUTS[layoutId] || layoutId
  return LAYOUTS.find((item) => item.id === id) || LAYOUTS[0]
}

export const FONT_SIZES: FontSizeOption[] = [
  { id: 'small', name: '小', contentSize: 16, footerSize: 12 },
  { id: 'medium', name: '中', contentSize: 18, footerSize: 13 },
  { id: 'large', name: '大', contentSize: 20, footerSize: 14 },
]

export function getFontSize(fontSizeId: string): FontSizeOption {
  return FONT_SIZES.find((item) => item.id === fontSizeId) || FONT_SIZES[0]
}

export const CATEGORIES = [
  { id: 'all', name: '全部' },
  { id: 'minimalist', name: '简约' },
  { id: 'nature', name: '自然' },
  { id: 'vintage', name: '复古' },
  { id: 'holiday', name: '节日' },
]

const LEGACY_STATIONERY: Record<string, string> = {
  'minimal-cream': 'paper-for-you',
  'minimal-grey': 'paper-border-grey',
  'nature-leaf': 'paper-for-you',
  'nature-botanical': 'paper-bamboo',
  'nature-cloud': 'paper-warm',
  'vintage-paper': 'paper-apricot',
  'vintage-seal': 'paper-bamboo',
  'holiday-snow': 'paper-border-grey',
  'holiday-spring': 'paper-apricot',
  'peach-gradient': 'paper-apricot',
  'sage-gradient': 'paper-bamboo',
  landscape: 'paper-bamboo',
}

export function getStationery(id: string): Stationery {
  const resolved = LEGACY_STATIONERY[id] || id
  return STATIONERY.find((item) => item.id === resolved) || STATIONERY[0]
}

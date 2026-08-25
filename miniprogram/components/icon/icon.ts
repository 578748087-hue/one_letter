const ICONS: Record<string, string> = {
  home: '<path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.5V20h14V9.5"/><path d="M9 20v-6h6v6"/>',
  mailbox: '<rect x="2" y="6" width="20" height="14" rx="2"/><path d="M2 8l10 7 10-7"/>',
  write: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>',
  profile: '<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  feather: '<path d="M20 4C16 4 8 8 4 16c4-2 8-2 12-2 0-4-2-8-4-10z"/><path d="M4 16c2 2 6 4 10 4"/>',
  quill: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>',
  draft: '<path d="M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M8 11h8"/><path d="M8 15h8"/>',
  envelope: '<rect x="2" y="6" width="20" height="14" rx="2"/><path d="M2 8l10 7 10-7"/>',
  star: '<path d="M12 3.2l2.65 5.38 5.92.86-4.28 4.18 1.01 5.9L12 16.9l-5.3 2.78 1.01-5.9-4.28-4.18 5.92-.86L12 3.2z"/>',
  tag: '<path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><circle cx="7" cy="7" r="1.5"/>',
  paper: '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h5"/>',
  font: '<path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/>',
  palette: '<circle cx="12" cy="12" r="9"/><circle cx="8" cy="10" r="1.5" fill="currentColor" stroke="none"/><circle cx="15" cy="9" r="1.5" fill="currentColor" stroke="none"/><circle cx="10" cy="15" r="1.5" fill="currentColor" stroke="none"/><circle cx="16" cy="14" r="1.5" fill="currentColor" stroke="none"/>',
  layout: '<path d="M3 6h18M3 12h12M3 18h15"/>',
  back: '<path d="M15 6l-6 6 6 6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  share: '<path d="M4 12v7a2 2 0 002 2h12a2 2 0 002-2v-7"/><path d="M12 3v13"/><path d="M8 7l4-4 4 4"/>',
  download: '<path d="M12 3v12"/><path d="M8 11l4 4 4-4"/><path d="M4 19h16"/>',
  more: '<circle cx="6" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="18" cy="12" r="1.5" fill="currentColor" stroke="none"/>',
  check: '<path d="M5 12l4 4 10-10"/>',
  chevronDown: '<path d="M6 9l6 6 6-6"/>',
  chevronRight: '<path d="M9 6l6 6-6 6"/>',
  homeFilled: '<path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1V10.5z"/>',
  plane: '<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/>',
  empty: '<rect x="2" y="6" width="20" height="14" rx="2"/><path d="M2 8l10 7 10-7"/>',
  send: '<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/>',
  trash: '<path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14"/>',
}

function buildSvg(name: string, color: string, filled: boolean): string {
  const paths = ICONS[name]
  if (!paths) return ''

  let fill = 'none'
  let stroke = color
  let strokeWidth = '1.5'

  if (name === 'star' && filled) {
    fill = color
    strokeWidth = '1.2'
  } else if (name === 'homeFilled') {
    fill = color
    stroke = 'none'
    strokeWidth = '0'
  }

  const body = paths.replace(/currentColor/g, color)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`
}

Component({
  properties: {
    name: { type: String, value: '' },
    size: { type: Number, value: 24 },
    color: { type: String, value: '#3a3834' },
    filled: { type: Boolean, value: false },
  },

  data: {
    encoded: '',
    px: 48,
  },

  observers: {
    'name, size, color, filled': function observe(name: string, size: number, color: string, filled: boolean) {
      const svg = buildSvg(name, color, filled)
      this.setData({
        // 括号必须一并转义，否则会提前闭合内联样式里的 url()。
        encoded: svg ? encodeURIComponent(svg).replace(/\(/g, '%28').replace(/\)/g, '%29') : '',
        px: size * 2,
      })
    },
  },
})

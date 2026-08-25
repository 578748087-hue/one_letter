import { Letter } from '../models/letter'
import { getStationery } from '../data/stationery'
import { getLetterDateText, getLetterStyles, normalizeContent } from './letter-render'
import { loadFont } from './font-loader'

/** 与 web 端 letter-render 的 LETTER_CARD 保持一致的导出画布尺寸。 */
const CARD_WIDTH = 375
const CARD_HEIGHT = 667
const PADDING_X = 28
const PADDING_TOP = 36
const FOOTER_BOTTOM = 28
const DPR = 2

/** 小程序 Canvas 2D 的类型定义未包含在 miniprogram-api-typings 中，这里按用到的接口声明。 */
interface ExportContext {
  fillStyle: string
  font: string
  textAlign: string
  textBaseline: string
  scale(x: number, y: number): void
  fillRect(x: number, y: number, width: number, height: number): void
  fillText(text: string, x: number, y: number): void
  measureText(text: string): { width: number }
  drawImage(image: unknown, dx: number, dy: number, dWidth: number, dHeight: number): void
}

interface CanvasImage {
  src: string
  width: number
  height: number
  onload: () => void
  onerror: () => void
}

interface Canvas2D {
  width: number
  height: number
  getContext(type: '2d'): ExportContext
  createImage(): CanvasImage
}

function queryCanvas(selector: string, component?: WechatMiniprogram.Component.TrivialInstance): Promise<Canvas2D> {
  return new Promise((resolve, reject) => {
    const query = component ? component.createSelectorQuery() : wx.createSelectorQuery()
    query.select(selector).fields({ node: true, size: true }).exec((res) => {
      const node = res && res[0] && (res[0] as { node?: Canvas2D }).node
      if (node) resolve(node)
      else reject(new Error('画布初始化失败'))
    })
  })
}

function loadCanvasImage(canvas: Canvas2D, src: string): Promise<CanvasImage | null> {
  return new Promise((resolve) => {
    const image = canvas.createImage()
    image.onload = () => resolve(image)
    image.onerror = () => resolve(null)
    image.src = src
  })
}

/** 等价于 CSS object-fit: cover。 */
function drawCover(
  ctx: ExportContext,
  image: CanvasImage,
  width: number,
  height: number,
): void {
  const iw = image.width || width
  const ih = image.height || height
  const scale = Math.max(width / iw, height / ih)
  const dw = iw * scale
  const dh = ih * scale
  ctx.drawImage(image, (width - dw) / 2, (height - dh) / 2, dw, dh)
}

function wrapLine(ctx: ExportContext, line: string, maxWidth: number): string[] {
  if (!line) return ['']
  const result: string[] = []
  let current = ''

  for (let i = 0; i < line.length; i += 1) {
    const next = current + line[i]
    if (ctx.measureText(next).width > maxWidth && current) {
      result.push(current)
      current = line[i]
    } else {
      current = next
    }
  }
  result.push(current)
  return result
}

export async function exportLetterImage(
  letter: Letter,
  selector: string,
  component?: WechatMiniprogram.Component.TrivialInstance,
): Promise<string> {
  const stationery = getStationery(letter.stationeryId)
  const styles = getLetterStyles(letter, stationery.bg)

  await loadFont(styles.fontId)

  const canvas = await queryCanvas(selector, component)
  const ctx = canvas.getContext('2d')

  canvas.width = CARD_WIDTH * DPR
  canvas.height = CARD_HEIGHT * DPR
  ctx.scale(DPR, DPR)

  ctx.fillStyle = stationery.bg || '#fdfbf7'
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT)

  const paper = await loadCanvasImage(canvas, stationery.image)
  if (paper) drawCover(ctx, paper, CARD_WIDTH, CARD_HEIGHT)

  // 正文
  const content = normalizeContent(letter.content || '', styles.align)
  ctx.font = `${styles.contentSize}px "${styles.fontFamily}"`
  ctx.fillStyle = styles.contentColor
  ctx.textBaseline = 'top'
  ctx.textAlign = styles.align

  const maxWidth = CARD_WIDTH - PADDING_X * 2
  const lineHeight = styles.contentSize * styles.lineHeight
  const textX = styles.align === 'center'
    ? CARD_WIDTH / 2
    : styles.align === 'right' ? CARD_WIDTH - PADDING_X : PADDING_X

  let y = PADDING_TOP
  content.split('\n').forEach((rawLine) => {
    wrapLine(ctx, rawLine, maxWidth).forEach((line) => {
      if (line) ctx.fillText(line, textX, y)
      y += lineHeight
    })
  })

  // 署名与日期
  const footerLines: string[] = []
  if (letter.signature) footerLines.push(letter.signature)
  footerLines.push(getLetterDateText(letter))

  ctx.font = `${styles.footerSize}px "${styles.fontFamily}"`
  ctx.fillStyle = styles.footerColor
  ctx.textAlign = 'right'

  const footerLineHeight = styles.footerSize * 1.55
  const footerHeight = footerLines.length * footerLineHeight + (letter.signature ? 2 : 0)
  let footerY = CARD_HEIGHT - FOOTER_BOTTOM - footerHeight
  footerLines.forEach((line, index) => {
    ctx.fillText(line, CARD_WIDTH - PADDING_X, footerY)
    footerY += footerLineHeight + (index === 0 && letter.signature ? 2 : 0)
  })

  return new Promise((resolve, reject) => {
    wx.canvasToTempFilePath({
      canvas: canvas as unknown as WechatMiniprogram.Canvas,
      destWidth: CARD_WIDTH * DPR,
      destHeight: CARD_HEIGHT * DPR,
      fileType: 'png',
      success: (res) => resolve(res.tempFilePath),
      fail: () => reject(new Error('图片生成失败')),
    })
  })
}

export function saveImageToAlbum(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    wx.saveImageToPhotosAlbum({
      filePath,
      success: () => resolve(),
      fail: (error) => {
        const message = error && error.errMsg ? error.errMsg : ''
        if (message.indexOf('auth deny') >= 0 || message.indexOf('authorize') >= 0) {
          reject(new Error('请在设置中允许保存到相册'))
        } else if (message.indexOf('cancel') >= 0) {
          reject(new Error('已取消'))
        } else {
          reject(new Error('保存失败，请重试'))
        }
      },
    })
  })
}

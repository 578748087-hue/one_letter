import { FONT_BASE_URL, FONT_FILES, FONT_LOAD_TIMEOUT } from '../config/index'
import { FONTS, getFont } from '../data/stationery'
import { FontOption } from '../models/letter'

export type FontStatus = 'idle' | 'loading' | 'loaded' | 'failed'

/**
 * 16 个平方字体合计 70MB 以上，只能远程加载。
 * wx.loadFontFace 的 source 仅支持 https 链接或 Data URL（不支持本地文件路径），
 * 所以无法自建本地缓存，只能依赖微信网络层的 HTTP 缓存，按需逐个加载。
 */
const status: Record<string, FontStatus | undefined> = {}
const pending: Record<string, Promise<boolean> | undefined> = {}
const listeners: Array<(fontId: string, next: FontStatus) => void> = []

let lastError = ''
let preloading = false
let diagnosed = ''

async function explainFailure(url: string): Promise<string> {
  if (!diagnosed) diagnosed = await diagnose(url)
  return diagnosed
}

function setStatus(fontId: string, next: FontStatus) {
  status[fontId] = next
  listeners.forEach((listener) => listener(fontId, next))
}

/** 云存储上的文件名含中文，必须编码后才能作为 URL 使用。 */
function fontUrl(font: FontOption): string {
  const file = FONT_FILES[font.id]
  return file ? `${FONT_BASE_URL}/${encodeURIComponent(file)}` : ''
}

const TIMEOUT_FLAG = 'timeout'

function applyFont(font: FontOption): Promise<void> {
  return new Promise((resolve, reject) => {
    let settled = false
    const timer = setTimeout(() => {
      settled = true
      reject(new Error(TIMEOUT_FLAG))
    }, FONT_LOAD_TIMEOUT)

    wx.loadFontFace({
      family: font.family,
      global: true,
      scopes: ['webview', 'native'],
      source: `url("${fontUrl(font)}")`,
      success: () => {
        clearTimeout(timer)
        // 超时后才回来的成功也要认，界面上从「失败」补正成已加载
        setStatus(font.id, 'loaded')
        if (!settled) resolve()
      },
      fail: (err) => {
        clearTimeout(timer)
        if (!settled) reject(new Error((err as { status?: string }).status || 'unknown'))
      },
    })
  })
}

/**
 * loadFontFace 失败时只回传一个笼统的 status，无法区分是域名没配、404 还是超时。
 * 用 downloadFile 打一次同地址（走同一份 downloadFile 白名单）拿到真实 errMsg。
 * 整个运行期只探测一次，避免重复消耗流量。
 */
function diagnose(url: string): Promise<string> {
  return new Promise((resolve) => {
    wx.downloadFile({
      url,
      success: (res) => {
        resolve(res.statusCode === 200
          ? '文件可下载，但字体解析失败（检查 content-type 是否为 font/*）'
          : `HTTP ${res.statusCode}`)
      },
      fail: (err) => resolve(err.errMsg || '网络请求失败'),
    })
  })
}

export function getFontStatus(fontId: string): FontStatus {
  return status[fontId] || 'idle'
}

export function isFontLoaded(fontId: string): boolean {
  return getFontStatus(getFont(fontId).id) === 'loaded'
}

/** 最近一次失败原因，用于提示用户而不是静默回退系统字体。 */
export function getFontError(): string {
  return lastError
}

export function onFontStatusChange(listener: (fontId: string, next: FontStatus) => void) {
  listeners.push(listener)
}

export function offFontStatusChange(listener: (fontId: string, next: FontStatus) => void) {
  const index = listeners.indexOf(listener)
  if (index >= 0) listeners.splice(index, 1)
}

export function loadFont(fontId: string): Promise<boolean> {
  const font = getFont(fontId)
  if (status[font.id] === 'loaded') return Promise.resolve(true)

  const inFlight = pending[font.id]
  if (inFlight) return inFlight

  const url = fontUrl(font)
  if (!url) {
    lastError = `未配置 ${font.id} 的字体文件名`
    console.error(`[font] ${lastError}`)
    setStatus(font.id, 'failed')
    return Promise.resolve(false)
  }

  setStatus(font.id, 'loading')

  const task = (async (): Promise<boolean> => {
    try {
      await applyFont(font)
      setStatus(font.id, 'loaded')
      return true
    } catch (error) {
      const message = (error as Error).message
      console.warn(`[font] ${font.id} 加载失败：${message}`)
      // 超时时不再发探测请求，那只会和还在传的字体抢带宽
      lastError = message === TIMEOUT_FLAG
        ? `timeout 超过 ${FONT_LOAD_TIMEOUT / 1000}s`
        : await explainFailure(url)
      setStatus(font.id, 'failed')
      return false
    }
  })()

  pending[font.id] = task
  task.then(() => { delete pending[font.id] })
  return task
}

/** 触发加载但不等待结果，字体就绪后由渲染层自动重排。 */
export function ensureFont(fontId: string): void {
  if (!fontId) return
  loadFont(fontId)
}

export function preloadDefaultFont(): void {
  ensureFont('pf-shaohua')
}

/**
 * 逐个把全部字体加载出来，让字体面板的每一项都能预览真实字形。
 * 单个字体 3~8MB，仅在 Wi-Fi 下做，且串行执行避免抢占选中字体的带宽。
 */
export function preloadAllFontsOnWifi(): void {
  if (preloading) return

  wx.getNetworkType({
    success: async ({ networkType }) => {
      if (networkType !== 'wifi') return
      preloading = true
      let misses = 0
      try {
        for (let i = 0; i < FONTS.length; i += 1) {
          const font = FONTS[i]
          if (status[font.id] === 'loaded') continue
          // eslint-disable-next-line no-await-in-loop
          const ok = await loadFont(font.id)
          misses = ok ? 0 : misses + 1
          // 连续失败说明网络或托管有问题，继续排队只是白等
          if (misses >= 2) break
        }
      } finally {
        preloading = false
      }
    },
  })
}

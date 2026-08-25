/**
 * 平方字体共 16 款，原始 TTF 合计 72MB，远超小程序 2MB 主包 / 20MB 总包上限，
 * 且 wx.loadFontFace 只认 https 链接，无法随包发布，只能远程加载。
 *
 * 现托管在微信云开发存储。该桶为公开读，直接用不带 ?sign= 的永久地址，
 * 避免控制台复制出来的签名链接过期后字体集体失效。
 */
export const FONT_BASE_URL = 'https://7072-prod-d6g4mp54v8d74a904-1474643785.tcb.qcloud.la/font'

/**
 * 字体 id 到云存储文件名的映射。上传时的文件名与 id 无对应规律（中英文混杂），
 * 这份映射由本地原始 TTF 与云端文件逐字节比对尺寸确认，16 个全部唯一匹配。
 *
 * 若后续改用 scripts/build-fonts.py 生成的子集包（体积降到 35%），
 * 把文件传成 <id>.woff 后，这里的值统一换成 `${id}.woff` 即可。
 */
export const FONT_FILES: Record<string, string> = {
  'pf-changan': 'PingFangChangAnTi-2.ttf',
  'pf-gongzi': '平方公子体.ttf',
  'pf-jiangjun': '平方将军体.ttf',
  'pf-jiangnan': '平方江南体.ttf',
  'pf-lele': 'PingFangLiuAngLeTianTi-2.ttf',
  'pf-qiaomu': '平方乔木体.ttf',
  'pf-qingchun': 'PingFangQingChunTi-2.ttf',
  'pf-sansheng': '平方三生体.ttf',
  'pf-shangqian': 'PingFangShangShangQianTi-2.ttf',
  'pf-shaohua': '平方韶华体.ttf',
  'pf-shiguang': '平方时光体.ttf',
  'pf-suotuo': '平方洒脱体.ttf',
  'pf-xianmo': 'QianTuXianMoTi-2.ttf',
  'pf-xingchen': '平方星辰体.ttf',
  'pf-zhuifeng': 'PingFangZhuiFengTi-2.ttf',
  'pf-zhuiguang': 'PingFangZhuiGuangTi-2.ttf',
}

/**
 * 单次加载的等待上限（毫秒）。wx.loadFontFace 没有超时参数，
 * 网络卡住时 fail 可能永远不回调，必须自己兜时间，否则界面会一直停在「下载中」。
 * 超时只是停止等待，底层下载仍在继续，真的加载成功了会补上状态。
 */
export const FONT_LOAD_TIMEOUT = 20000

export const APP_VERSION = 'v1.0'

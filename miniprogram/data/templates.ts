import { BannerTemplate, Letter, LetterTemplate } from '../models/letter'

export const TEMPLATES: LetterTemplate[] = [
  {
    id: 'future-self',
    name: '给未来的自己',
    content: `当你读到这封信的时候，不知道过了多久。此刻的我，正坐在窗前，把心里的话慢慢写下来。

希望你还记得现在的梦想，还记得那些让你微笑的小事。如果生活变得忙碌，请记得停下来，给自己写一封信。

愿你温柔，也愿你勇敢。

此刻的你`,
  },
  {
    id: 'gratitude',
    name: '感恩信',
    content: `想对你说一声谢谢。谢谢你出现在我的生命里，带给我温暖和力量。

那些一起走过的日子，那些无声的陪伴，我都记在心里。这封信装不下所有的感激，但每一个字都是真心的。

愿你一切安好。

你的朋友`,
  },
  {
    id: 'love',
    name: '情书',
    content: `见字如面。

想用这封信，把平时说不出口的话，慢慢写给你。你的笑容、你的声音、你认真做事的样子，都让我心动。

愿我们的故事，像这封信一样，经得起时间的翻阅。

永远爱你的`,
  },
  {
    id: 'farewell',
    name: '告别信',
    content: `到了该说再见的时候了。不是结束，而是另一段旅程的开始。

感谢相遇，感谢陪伴。那些共度的时光，会是我珍藏的记忆。愿你前路光明，万事顺遂。

后会有期。

你的朋友`,
  },
  {
    id: 'blank',
    name: '空白信纸',
    content: '',
  },
]

export function getTemplate(id: string): LetterTemplate {
  return TEMPLATES.find((item) => item.id === id) || TEMPLATES[4]
}

export function applyTemplateToLetter(letter: Letter, template: LetterTemplate): Letter {
  letter.content = (template.content || '').replace(/^[\s\u3000\r\n]+/, '')
  letter.title = template.name
  return letter
}

export function letterPreviewTitle(letter: Partial<Letter>): string {
  const line = (letter.content || '').trim().split('\n').find((item) => item.trim())
  return letter.title || (line ? line.slice(0, 24) : '') || '无标题'
}

export const BANNER_TEMPLATES: BannerTemplate[] = [
  {
    id: 'future-self',
    templateId: 'future-self',
    title: '一封信的时间',
    subtitle: '给未来的自己，也给想念的你。',
    theme: 'warm',
  },
  {
    id: 'gratitude',
    templateId: 'gratitude',
    title: '感恩时刻',
    subtitle: '把感谢写进字里，温暖彼此。',
    theme: 'sage',
  },
  {
    id: 'love',
    templateId: 'love',
    title: '写一封情书',
    subtitle: '见字如面，纸短情长。',
    theme: 'rose',
  },
  {
    id: 'farewell',
    templateId: 'farewell',
    title: '好好告别',
    subtitle: '不说再见，只说后会有期。',
    theme: 'mist',
  },
]

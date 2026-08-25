#!/usr/bin/env python3
"""把信纸素材转成小程序可用的 JPEG。

image 组件在 iOS 上不支持 webp，所以包内素材统一用 JPEG。
优先取 xinxie 的原图，避免二次有损压缩；按目标体积自动降质量。
"""
import os
import sys
from io import BytesIO

from PIL import Image

SRC_DIR = '/Users/lili/Projects/xinxie/assets/stationery'
OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                       'miniprogram/assets/stationery')

TARGET_W, TARGET_H = 750, 1334
SIZE_CAP = 56 * 1024
Q_START, Q_MIN, Q_STEP = 78, 40, 6

NAMES = [
    'paper-apricot', 'paper-bamboo', 'paper-border-grey', 'paper-cream-apricot',
    'paper-cream-bloom', 'paper-dusty-pink', 'paper-for-you', 'paper-gold-corner',
    'paper-haze-blue', 'paper-ivory', 'paper-khaki', 'paper-lavender',
    'paper-leaf-frame', 'paper-milk-tea', 'paper-milk-white', 'paper-mist-blue',
    'paper-oat', 'paper-off-white', 'paper-rice-xuan', 'paper-sage-green',
    'paper-slate-blue', 'paper-tea-brown', 'paper-vintage-yellow', 'paper-warm',
]


def find_source(name):
    for ext in ('.png', '.webp', '.jpg', '.jpeg'):
        path = os.path.join(SRC_DIR, name + ext)
        if os.path.exists(path):
            return path
    return None


def encode(im, quality):
    buf = BytesIO()
    im.save(buf, 'JPEG', quality=quality, optimize=True, subsampling=1)
    return buf.getvalue()


def main():
    total = 0
    missing = []
    for name in NAMES:
        src = find_source(name)
        if not src:
            missing.append(name)
            continue

        im = Image.open(src).convert('RGB')
        # 素材均为 9:16，等比缩放后居中裁到统一尺寸，避免边缘出现空白
        scale = max(TARGET_W / im.width, TARGET_H / im.height)
        im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
        left = (im.width - TARGET_W) // 2
        top = (im.height - TARGET_H) // 2
        im = im.crop((left, top, left + TARGET_W, top + TARGET_H))

        quality = Q_START
        data = encode(im, quality)
        while len(data) > SIZE_CAP and quality > Q_MIN:
            quality -= Q_STEP
            data = encode(im, quality)

        out = os.path.join(OUT_DIR, name + '.jpg')
        with open(out, 'wb') as fh:
            fh.write(data)
        total += len(data)
        print(f'{name:24s} q{quality:<3d} {len(data)/1024:7.1f} KB  <- {os.path.basename(src)}')

    print(f'\ntotal {total/1024/1024:.2f} MB over {len(NAMES) - len(missing)} files')
    if missing:
        print('MISSING SOURCES:', ', '.join(missing), file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())

#!/usr/bin/env python3
"""把平方字体子集化成小程序可用的 WOFF。

原始 16 个 TTF 合计 72MB，每个 3~8MB，真机远程加载太慢。
这些字体本身已是 GB2312 字符集（6892 字形），体积几乎全在 glyf 轮廓表，
没有 hinting 也没有多余表可裁，所以只能从字符集下手：
只保留 GB2312 一级汉字（3755 个常用字）+ ASCII + 常用中文标点，再用 WOFF 压缩。

结果约为原始的 35%。二级汉字（生僻字、部分姓名用字）会回退到系统字体。

用法：
    python3 scripts/build-fonts.py [源目录] [输出目录]
"""
import io
import os
import sys

from fontTools.subset import Options, Subsetter
from fontTools.ttLib import TTFont

SRC_DIR = '/Users/lili/Projects/xinxie/fonts'
OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'dist/fonts')

# 输出格式。微信文档建议 TTF / WOFF，WOFF2 在低版本 iOS 上不兼容，
# 且 Canvas 2D（scopes: native）下的解析器更保守，所以选 WOFF。
FLAVOR = 'woff'

PUNCTUATION = '　、。，．；：？！…—～《》〈〉「」『』（）【】〔〕·“”‘’－＋％＃＆＊＠／＼｜'


def common_charset():
    """GB2312 一级汉字：区 16-55，按国标定义即常用字。"""
    chars = []
    for qu in range(16, 56):
        for wei in range(1, 95):
            try:
                chars.append(bytes([qu + 0xA0, wei + 0xA0]).decode('gb2312'))
            except UnicodeDecodeError:
                pass
    ascii_chars = [chr(code) for code in range(0x20, 0x7F)]
    return set(chars) | set(ascii_chars) | set(PUNCTUATION)


def subset_font(src_path, keep_text):
    font = TTFont(src_path)
    options = Options()
    options.drop_tables += ['post', 'FFTM', 'DSIG']
    options.notdef_outline = False
    subsetter = Subsetter(options=options)
    subsetter.populate(text=keep_text)
    subsetter.subset(font)

    font.flavor = FLAVOR
    buf = io.BytesIO()
    font.save(buf)
    covered = len(font.getBestCmap())
    font.close()
    return buf.getvalue(), covered


def main():
    src_dir = sys.argv[1] if len(sys.argv) > 1 else SRC_DIR
    out_dir = sys.argv[2] if len(sys.argv) > 2 else OUT_DIR
    os.makedirs(out_dir, exist_ok=True)

    keep = common_charset()
    keep_text = ''.join(keep)
    print(f'保留字符 {len(keep)} 个（GB2312 一级汉字 + ASCII + 标点）\n')

    names = sorted(f[:-4] for f in os.listdir(src_dir) if f.endswith('.ttf'))
    total_src = total_out = 0

    for name in names:
        src = os.path.join(src_dir, name + '.ttf')
        data, covered = subset_font(src, keep_text)
        out = os.path.join(out_dir, f'{name}.{FLAVOR}')
        with open(out, 'wb') as fh:
            fh.write(data)

        src_size = os.path.getsize(src)
        total_src += src_size
        total_out += len(data)
        print(f'{name:16s} {src_size/1024/1024:5.2f}MB -> {len(data)/1024/1024:5.2f}MB '
              f'({len(data)/src_size*100:4.1f}%)  {covered} 字形')

    print(f'\n合计 {total_src/1024/1024:.1f}MB -> {total_out/1024/1024:.1f}MB '
          f'({total_out/total_src*100:.1f}%)，单个平均 {total_out/len(names)/1024/1024:.2f}MB')
    print(f'输出目录：{out_dir}')


if __name__ == '__main__':
    main()

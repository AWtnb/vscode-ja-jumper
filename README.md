# ja-jumper

( ﾟдﾟ) ＜ じゃじゃんぱー。

Cursor-jumper for Japanese (and other any language) punctuations.

## Features

### Default behavior

+ Jumping:
    + `alt+j` snaps cursor forward to next punctuation.
    + `alt+k` snaps cursor backward to previous punctuation.
    + You can select characters with `Shift` modifier.
+ Swapping:
    + `alt+shift+s` swaps selection anchor and active cursor position.

### Target punctuations

```
、，。．；：「」『』【】（）〔〕《》〈〉［］“”‘’・！？～／…―　←↓↑→○●▲△▼▽◆◇■□★☆〓[]().,=<>:;`'\" #/-
```

+ Modifiable with `ja-jumper.delimiters` in `setting.json`.
+ If `ja-jumper.isGreedy` in `setting.json` is `true` (default), cursor jumps as far as possible.

---

アイコン画像：[「ロイター板のイラスト」 by いらすとや](https://www.irasutoya.com/2014/11/blog-post_66.html)
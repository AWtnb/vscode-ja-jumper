# ja-jumper

( ﾟдﾟ) ＜ じゃじゃんぱー。

Cursor-jumper for Japanese (and other any language) punctuations.

## Features

### Default behavior

+ Jumping (text selectable with `Shift` modifier):
    + `alt+j` snaps cursor forward to next punctuation.
    + `alt+k` snaps cursor backward to previous punctuation.
    + `ctrl+down` snaps cursor to the bottom of block.
    + `ctrl+up` snaps cursor to the top of block.
+ Swapping:
    + `alt+shift+s` swaps selection anchor and active cursor position.

### Configuration

Keybindings for cursor-jumping are configurable in `keybindings.json` .

For example, `ja-jumper.jumpFore` command can be binded to `ctrl+k n` (`n` after `ctrl k`) by setting `keybindings.json` as below:

```
[
    {
        "key": "ctrl+k n",
        "command": "ja-jumper.jumpFore",
        "when": "editorTextFocus",
    },
    {
        "key": "ctrl+k shift+n",
        "command": "ja-jumper.jumpFore",
        "args": true,
        "when": "editorTextFocus",
    }
]
```

Text selection behavior on cursor-jumping can be specified with `args` to `ja-jumper.jumpFore` (default is `false`).


#### Target punctuations

```
、，。．；：「」『』【】（）〔〕《》〈〉［］“”‘’・！？～／…―　←↓↑→○●▲△▼▽◆◇■□★☆〓[]().,=<>:;`'\" #/-
```

+ Modifiable with `ja-jumper.delimiters` in `setting.json`.
+ If `ja-jumper.isGreedy` in `setting.json` is `true` (default), cursor jumps as far as possible.

---

アイコン画像：[「ロイター板のイラスト」 by いらすとや](https://www.irasutoya.com/2014/11/blog-post_66.html)
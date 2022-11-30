# ja-jumper

( ﾟдﾟ) ＜ じゃじゃんぱー。

## Features

Enabled on plaintext or markdown file, or manually, `ja-jumper.helloJumper` command.

### Default behavior

+ Jumping:
    + `alt+j` snaps cursor forward to next punctuation.
    + `alt+k` snaps cursor backward to previous punctuation.
    + You can select characters with `Shift` modifier.
+ Swapping:
    + `alt+shift+s` swaps selection anchor and active cursor position.

### Target punctuations

```
、，。．；：「」『』【】（）〔〕《》〈〉［］“”‘’・！？～／…―　[]().,=<>:;`'\" #/-"
```

Modifiable with `ja-jumper.extras` and `ja-jumper.exclude` in `setting.json`.

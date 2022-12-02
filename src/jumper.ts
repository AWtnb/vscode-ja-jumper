import * as vscode from "vscode";

class ActiveCursor {
  readonly editor: vscode.TextEditor;
  readonly ancPos: vscode.Position;
  readonly curPos: vscode.Position;
  readonly curLine: vscode.TextLine;
  readonly isBeginningOfLine: boolean;
  readonly isEndOfLine: boolean;
  constructor(editor: vscode.TextEditor) {
    this.editor = editor;
    this.ancPos = this.editor.selection.anchor;
    this.curPos = this.editor.selection.active;
    this.curLine = this.editor.document.lineAt(this.curPos.line);
    this.isBeginningOfLine = this.curPos.character == 0;
    this.isEndOfLine = this.curPos.character == this.curLine.text.length;
  }

  searchNextNonBlankLine(): number {
    const max = this.editor.document.lineCount;
    for (let i = this.curLine.lineNumber + 1; i < max; i++) {
      const line = this.editor.document.lineAt(i).text;
      if (line.trim().length > 0) {
        return i;
      }
    }
    return max - 1;
  }

  searchPreviousNonBlankLine(): number {
    for (let i = 1; i <= this.curLine.lineNumber; i++) {
      const line = this.editor.document.lineAt(this.curLine.lineNumber - i).text;
      if (line.trim().length > 0) {
        return this.curLine.lineNumber - i;
      }
    }
    return 0;
  }
}

const scrollToLine = (line: number) => {
  vscode.commands.executeCommand("revealLine", {
    lineNumber: line,
    at: "center",
  });
};

export class Jumper {
  readonly delimiters: string[];

  constructor(extra: string = "", exclude: string = "") {
    const full = "、，。．；：「」『』【】（）〔〕《》〈〉［］“”‘’・！？～／…―　";
    const half = "[]().,=<>:;`'\" #/-";
    this.delimiters = (full + half + extra).split("").filter((c) => exclude.indexOf(c) == -1);
  }

  private searchFore(s: string): number {
    for (let i = 0; i < s.length - 1; i++) {
      const c = s.charAt(i);
      const next = s.charAt(i + 1);
      if (this.delimiters.includes(c) && !this.delimiters.includes(next)) {
        return i;
      }
    }
    return -1;
  }

  private searchBack(s: string): number {
    for (let i = 0; i < s.length - 1; i++) {
      const c = s.charAt(s.length - i - 1);
      const previous = s.charAt(s.length - i - 2);
      if (this.delimiters.includes(c) && !this.delimiters.includes(previous)) {
        return i;
      }
    }
    return -1;
  }

  jumpFore(selecting: boolean = false) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    const ac = new ActiveCursor(editor);
    if (ac.isEndOfLine) {
      const lineIndex = ac.searchNextNonBlankLine();
      const jumpTo = new vscode.Position(lineIndex, editor.document.lineAt(lineIndex).firstNonWhitespaceCharacterIndex);
      const anchor = selecting ? ac.ancPos : jumpTo;
      editor.selection = new vscode.Selection(anchor, jumpTo);
      scrollToLine(jumpTo.line);
      return;
    }
    const afterCursor = ac.curLine.text.substring(ac.curPos.character);
    const delta = this.searchFore(afterCursor);
    const toChar = delta < 0 ? ac.curLine.text.length : ac.curPos.character + delta + 1;
    const jumpTo = new vscode.Position(ac.curLine.lineNumber, toChar);
    if (selecting) {
      editor.selection = new vscode.Selection(ac.ancPos, jumpTo);
      return;
    }
    if (editor.selection.isEmpty) {
      editor.selection = new vscode.Selection(jumpTo, jumpTo);
      return;
    }
    editor.selection = new vscode.Selection(ac.curPos, ac.curPos);
  }

  jumpBack(selecting: boolean = false) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    const ac = new ActiveCursor(editor);
    if (ac.isBeginningOfLine) {
      const lineIndex = ac.searchPreviousNonBlankLine();
      const jumpTo = new vscode.Position(lineIndex, editor.document.lineAt(lineIndex).text.length);
      const anchor = selecting ? ac.ancPos : jumpTo;
      editor.selection = new vscode.Selection(anchor, jumpTo);
      scrollToLine(jumpTo.line);
      return;
    }
    const beforeCursor = ac.curLine.text.substring(0, ac.curPos.character);
    const delta = this.searchBack(beforeCursor);
    const toChar = delta < 0 ? 0 : ac.curPos.character - delta - 1;
    const jumpTo = new vscode.Position(ac.curLine.lineNumber, toChar);
    if (selecting) {
      editor.selection = new vscode.Selection(ac.ancPos, jumpTo);
      return;
    }
    if (editor.selection.isEmpty) {
      editor.selection = new vscode.Selection(jumpTo, jumpTo);
      return;
    }
    editor.selection = new vscode.Selection(ac.curPos, ac.curPos);
  }

  static swapAnchor() {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      editor.selections = editor.selections.map((sel) => {
        return new vscode.Selection(sel.active, sel.anchor);
      });
    }
  }
}

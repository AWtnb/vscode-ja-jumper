import * as vscode from "vscode";

class Cursor {
  readonly editor: vscode.TextEditor;
  readonly anchor: vscode.Position;
  readonly active: vscode.Position;
  readonly curLine: vscode.TextLine;
  readonly isBeginningOfLine: boolean;
  readonly isEndOfLine: boolean;
  readonly isBeginningOfFile: boolean;
  readonly isEndOfFile: boolean;
  constructor(editor: vscode.TextEditor) {
    this.editor = editor;
    this.anchor = this.editor.selection.anchor;
    this.active = this.editor.selection.active;
    this.curLine = this.editor.document.lineAt(this.active.line);
    this.isBeginningOfLine = this.active.character == 0;
    this.isBeginningOfFile = this.isBeginningOfLine && this.active.line == 0;
    this.isEndOfLine = this.active.character == this.curLine.text.length;
    this.isEndOfFile = this.isEndOfLine && this.active.line == editor.document.lineCount - 1;
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

const scrollToCursor = (editor: vscode.TextEditor) => {
  const cursor = editor.selection;
  const range = new vscode.Range(cursor.active, cursor.active);
  editor.revealRange(range);
};

const makeSelection = (anchor: vscode.Position, active: vscode.Position): vscode.Selection => {
  return new vscode.Selection(anchor, active);
};

export class Jumper {
  readonly delimiters: string;
  readonly greedy: boolean;

  constructor(delimiters: string = "", greedy: boolean = true) {
    this.delimiters = delimiters;
    this.greedy = greedy;
  }

  private searchFore(s: string): number {
    for (let i = 0; i < s.length; i++) {
      const c = s.charAt(i);
      if (this.delimiters.includes(c)) {
        if (this.greedy && i < s.length - 1) {
          const next = s.charAt(i + 1);
          if (this.delimiters.includes(next)) {
            continue;
          }
        }
        return i;
      }
    }
    return -1;
  }

  private searchBack(s: string): number {
    for (let i = 0; i < s.length; i++) {
      const c = s.charAt(s.length - i - 1);
      if (this.delimiters.includes(c)) {
        if (this.greedy && i < s.length - 1) {
          const previous = s.charAt(s.length - i - 2);
          if (this.delimiters.includes(previous)) {
            continue;
          }
        }
        return i;
      }
    }
    return -1;
  }

  jumpFore(editor: vscode.TextEditor, selecting: boolean = false) {
    const cursor = new Cursor(editor);
    if (!selecting && !editor.selection.isEmpty) {
      editor.selection = makeSelection(cursor.active, cursor.active);
      return;
    }
    if (cursor.isEndOfFile) {
      return;
    }
    if (cursor.isEndOfLine) {
      const lineIndex = cursor.searchNextNonBlankLine();
      const jumpTo = new vscode.Position(lineIndex, editor.document.lineAt(lineIndex).firstNonWhitespaceCharacterIndex);
      const anchor = selecting ? cursor.anchor : jumpTo;
      editor.selection = makeSelection(anchor, jumpTo);
      scrollToCursor(editor);
      return;
    }
    const afterCursor = cursor.curLine.text.substring(cursor.active.character);
    const delta = this.searchFore(afterCursor);
    const toChar = delta < 0 ? cursor.curLine.text.length : cursor.active.character + delta + 1;
    const jumpTo = new vscode.Position(cursor.curLine.lineNumber, toChar);
    const anchor = selecting ? cursor.anchor : jumpTo;
    editor.selection = makeSelection(anchor, jumpTo);
    scrollToCursor(editor);
  }

  jumpBack(editor: vscode.TextEditor, selecting: boolean = false) {
    const cursor = new Cursor(editor);
    if (!selecting && !editor.selection.isEmpty) {
      editor.selection = makeSelection(cursor.active, cursor.active);
      return;
    }
    if (cursor.isBeginningOfFile) {
      return;
    }
    if (cursor.isBeginningOfLine) {
      const lineIndex = cursor.searchPreviousNonBlankLine();
      const jumpTo = new vscode.Position(lineIndex, editor.document.lineAt(lineIndex).text.length);
      const anchor = selecting ? cursor.anchor : jumpTo;
      editor.selection = makeSelection(anchor, jumpTo);
      scrollToCursor(editor);
      return;
    }
    const beforeCursor = cursor.curLine.text.substring(0, cursor.active.character);
    const delta = this.searchBack(beforeCursor);
    const toChar = delta < 0 ? 0 : cursor.active.character - delta - 1;
    const jumpTo = new vscode.Position(cursor.curLine.lineNumber, toChar);
    const anchor = selecting ? cursor.anchor : jumpTo;
    editor.selection = makeSelection(anchor, jumpTo);
    scrollToCursor(editor);
  }

  static swapAnchor(editor: vscode.TextEditor) {
    editor.selections = editor.selections.map((sel) => {
      return makeSelection(sel.active, sel.anchor);
    });
    if (editor.selections.length == 1) {
      scrollToCursor(editor);
    }
  }
}

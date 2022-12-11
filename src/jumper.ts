import * as vscode from "vscode";

class Cursor {
  readonly editor: vscode.TextEditor;
  readonly anchor: vscode.Position;
  readonly active: vscode.Position;
  readonly curLine: vscode.TextLine;
  readonly isBeginningOfLine: boolean;
  readonly isEndOfLine: boolean;
  constructor(editor: vscode.TextEditor) {
    this.editor = editor;
    this.anchor = this.editor.selection.anchor;
    this.active = this.editor.selection.active;
    this.curLine = this.editor.document.lineAt(this.active.line);
    this.isBeginningOfLine = this.active.character == 0;
    this.isEndOfLine = this.active.character == this.curLine.text.length;
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

const scrollToLine = (line: number, position: string = "center") => {
  vscode.commands.executeCommand("revealLine", {
    lineNumber: line,
    at: position,
  });
};

const makeSelection = (anchor: vscode.Position, active: vscode.Position): vscode.Selection => {
  return new vscode.Selection(anchor, active);
};

export class Jumper {
  readonly delimiters: string[];
  readonly scrollPosition: string;

  constructor(delimiters: string = "", scrollPosition: string = "") {
    this.delimiters = delimiters.split("");
    this.scrollPosition = scrollPosition;
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

  jumpFore(editor: vscode.TextEditor, selecting: boolean = false) {
    const cursor = new Cursor(editor);
    if (!selecting && !editor.selection.isEmpty) {
      editor.selection = makeSelection(cursor.active, cursor.active);
      return;
    }
    if (cursor.isEndOfLine) {
      const lineIndex = cursor.searchNextNonBlankLine();
      const jumpTo = new vscode.Position(lineIndex, editor.document.lineAt(lineIndex).firstNonWhitespaceCharacterIndex);
      const anchor = selecting ? cursor.anchor : jumpTo;
      editor.selection = makeSelection(anchor, jumpTo);
      scrollToLine(jumpTo.line, this.scrollPosition);
      return;
    }
    const afterCursor = cursor.curLine.text.substring(cursor.active.character);
    const delta = this.searchFore(afterCursor);
    const toChar = delta < 0 ? cursor.curLine.text.length : cursor.active.character + delta + 1;
    const jumpTo = new vscode.Position(cursor.curLine.lineNumber, toChar);
    const anchor = selecting ? cursor.anchor : jumpTo;
    editor.selection = makeSelection(anchor, jumpTo);
  }

  jumpBack(editor: vscode.TextEditor, selecting: boolean = false) {
    const cursor = new Cursor(editor);
    if (!selecting && !editor.selection.isEmpty) {
      editor.selection = makeSelection(cursor.active, cursor.active);
      return;
    }
    if (cursor.isBeginningOfLine) {
      const lineIndex = cursor.searchPreviousNonBlankLine();
      const jumpTo = new vscode.Position(lineIndex, editor.document.lineAt(lineIndex).text.length);
      const anchor = selecting ? cursor.anchor : jumpTo;
      editor.selection = makeSelection(anchor, jumpTo);
      scrollToLine(jumpTo.line, this.scrollPosition);
      return;
    }
    const beforeCursor = cursor.curLine.text.substring(0, cursor.active.character);
    const delta = this.searchBack(beforeCursor);
    const toChar = delta < 0 ? 0 : cursor.active.character - delta - 1;
    const jumpTo = new vscode.Position(cursor.curLine.lineNumber, toChar);
    const anchor = selecting ? cursor.anchor : jumpTo;
    editor.selection = makeSelection(anchor, jumpTo);
  }

  static swapAnchor(editor: vscode.TextEditor) {
    editor.selections = editor.selections.map((sel) => {
      return makeSelection(sel.active, sel.anchor);
    });
  }
}

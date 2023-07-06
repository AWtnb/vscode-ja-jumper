import * as vscode from "vscode";

export class Cursor {
  readonly editor: vscode.TextEditor;
  readonly anchor: vscode.Position;
  readonly active: vscode.Position;
  readonly line: vscode.TextLine;
  readonly isBOL: boolean; // beginning of line
  readonly isBOF: boolean; // beginning of file
  readonly isBeforeContent: boolean;
  readonly isEOL: boolean; // end of line
  readonly isEOF: boolean; // end of file

  constructor(editor: vscode.TextEditor) {
    this.editor = editor;
    this.anchor = this.editor.selection.anchor;
    this.active = this.editor.selection.active;
    this.line = this.editor.document.lineAt(this.active.line);
    this.isBOL = this.active.character == 0;
    this.isBOF = this.isBOL && this.active.line == 0;
    this.isBeforeContent = this.active.character <= this.line.firstNonWhitespaceCharacterIndex;
    this.isEOL = this.active.character == this.line.text.length;
    this.isEOF = this.isEOL && this.active.line == this.editor.document.lineCount - 1;
  }

  getNextLine(): vscode.TextLine | null {
    if (this.active.line == this.editor.document.lineCount - 1) {
      return null;
    }
    return this.editor.document.lineAt(this.active.line + 1);
  }

  getPreviousLine(): vscode.TextLine | null {
    if (this.active.line == 0) {
      return null;
    }
    return this.editor.document.lineAt(this.active.line - 1);
  }

  searchNextNonBlankLine(): number {
    const max = this.editor.document.lineCount;
    for (let i = this.line.lineNumber + 1; i < max; i++) {
      const line = this.editor.document.lineAt(i).text;
      if (line.trim().length > 0) {
        return i;
      }
    }
    return max - 1;
  }

  searchPreviousNonBlankLine(): number {
    const curLine = this.line;
    for (let i = 1; i <= curLine.lineNumber; i++) {
      const lineIdx = curLine.lineNumber - i;
      const line = this.editor.document.lineAt(lineIdx).text;
      if (line.trim().length > 0) {
        return lineIdx;
      }
    }
    return 0;
  }

  searchNextBlankLine(): number {
    const max = this.editor.document.lineCount;
    for (let i = this.line.lineNumber + 1; i < max; i++) {
      const line = this.editor.document.lineAt(i).text;
      if (line.trim().length < 1) {
        return i;
      }
    }
    return max - 1;
  }

  searchPreviousBlankLine(): number {
    const curLine = this.line;
    for (let i = 1; i <= curLine.lineNumber; i++) {
      const lineIdx = curLine.lineNumber - i;
      const line = this.editor.document.lineAt(lineIdx).text;
      if (line.trim().length < 1) {
        return lineIdx;
      }
    }
    return 0;
  }

  reveal(pos: vscode.Position) {
    const range = new vscode.Range(pos, pos);
    this.editor.revealRange(range);
  }

  update(anchor: vscode.Position, active: vscode.Position) {
    this.editor.selection = new vscode.Selection(anchor, active);
    this.reveal(active);
  }

  swapAnchor() {
    this.editor.selections = this.editor.selections.map((sel) => {
      return new vscode.Selection(sel.active, sel.anchor);
    });
    if (this.editor.selections.length == 1) {
      this.reveal(this.editor.selection.active);
    }
  }
}

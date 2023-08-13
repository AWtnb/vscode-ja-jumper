import * as vscode from "vscode";

export class Cursor {
  private readonly _editor: vscode.TextEditor;
  private readonly _selecting: boolean;
  private readonly _maxLineIdx: number;
  readonly active: vscode.Position;
  readonly anchor: vscode.Position;
  readonly line: vscode.TextLine;
  readonly isBOL: boolean; // beginning of line
  readonly isBOF: boolean; // beginning of file
  readonly isBeforeContent: boolean;
  readonly isEOL: boolean; // end of line
  readonly isEOF: boolean; // end of file

  constructor(editor: vscode.TextEditor, sel: vscode.Selection, selecting:boolean) {
    this._editor = editor;
    this._selecting = selecting;
    this._maxLineIdx = this._editor.document.lineCount - 1;
    this.active = sel.active;
    this.anchor = sel.anchor;
    this.line = this._editor.document.lineAt(this.active.line);
    this.isBOL = this.active.character == 0;
    this.isBOF = this.isBOL && this.active.line == 0;
    this.isBeforeContent = this.isBOL || this.active.character <= this.line.firstNonWhitespaceCharacterIndex;
    this.isEOL = this.active.character == this.line.text.length;
    this.isEOF = this.isEOL && this.active.line == this._maxLineIdx;
  }

  getNextLine(): vscode.TextLine | null {
    if (this.active.line == this._maxLineIdx) {
      return null;
    }
    return this._editor.document.lineAt(this.active.line + 1);
  }

  getPreviousLine(): vscode.TextLine | null {
    if (this.active.line == 0) {
      return null;
    }
    return this._editor.document.lineAt(this.active.line - 1);
  }

  private searchNextNonBlankLineIndex(): number {
    for (let i = this.line.lineNumber + 1; i <= this._maxLineIdx; i++) {
      const line = this._editor.document.lineAt(i).text;
      if (line.trim().length > 0) {
        return i;
      }
    }
    return -1;
  }

  private searchPreviousNonBlankLineIndex(): number {
    const curLine = this.line;
    for (let i = 1; i <= curLine.lineNumber; i++) {
      const lineIdx = curLine.lineNumber - i;
      const line = this._editor.document.lineAt(lineIdx).text;
      if (line.trim().length > 0) {
        return lineIdx;
      }
    }
    return -1;
  }

  private searchNextBlankLineIndex(): number {
    for (let i = this.line.lineNumber + 1; i <= this._maxLineIdx; i++) {
      const line = this._editor.document.lineAt(i).text;
      if (line.trim().length < 1) {
        return i;
      }
    }
    return -1;
  }

  private searchPreviousBlankLineIndex(): number {
    const curLine = this.line;
    for (let i = 1; i <= curLine.lineNumber; i++) {
      const lineIdx = curLine.lineNumber - i;
      const line = this._editor.document.lineAt(lineIdx).text;
      if (line.trim().length < 1) {
        return lineIdx;
      }
    }
    return -1;
  }

  collapse(): vscode.Selection {
    const dest = new vscode.Position(this.active.line, this.active.character);
    const sel = new vscode.Selection(dest, dest);
    return sel;
  }

  invoke(lineIdx: number, charIdx: number): vscode.Selection {
    const dest = new vscode.Position(lineIdx, charIdx);
    const anchor = this._selecting ? this.anchor : dest;
    const sel = new vscode.Selection(anchor, dest);
    return sel;
  }

  endOfBlock(): vscode.Selection {
    const nextBlank = this.searchNextBlankLineIndex();
    const lineIdx = nextBlank < 0 ? this._maxLineIdx : nextBlank - 1;
    const charIdx = this._editor.document.lineAt(lineIdx).text.length;
    return this.invoke(lineIdx, charIdx);
  }

  beginningOfNextBlock(): vscode.Selection {
    const nextNonBlank = this.searchNextNonBlankLineIndex();
    const lineIdx = nextNonBlank < 0 ? this._maxLineIdx : nextNonBlank;
    const charIdx = this._editor.document.lineAt(lineIdx).firstNonWhitespaceCharacterIndex;
    return this.invoke(lineIdx, charIdx);
  }

  beginningOfBlock(): vscode.Selection {
    const prevBlank = this.searchPreviousBlankLineIndex();
    const lineIdx = prevBlank < 0 ? 0 : prevBlank + 1;
    const charIdx = this._editor.document.lineAt(lineIdx).firstNonWhitespaceCharacterIndex;
    return this.invoke(lineIdx, charIdx);
  }

  endOfPreviousBlock(): vscode.Selection {
    const prevNonBlank = this.searchPreviousNonBlankLineIndex();
    const lineIdx = prevNonBlank < 0 ? 0 : prevNonBlank;
    const charIdx = this._editor.document.lineAt(lineIdx).text.length;
    return this.invoke(lineIdx, charIdx);
  }
}

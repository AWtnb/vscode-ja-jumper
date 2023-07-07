import * as vscode from "vscode";

export class Cursor {
  readonly editor: vscode.TextEditor;
  readonly anchor: vscode.Position;
  readonly active: vscode.Position;
  readonly line: vscode.TextLine;
  readonly maxLineIdx: number;
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
    this.maxLineIdx = this.editor.document.lineCount - 1;
    this.isBOL = this.active.character == 0;
    this.isBOF = this.isBOL && this.active.line == 0;
    this.isBeforeContent = this.isBOL || this.active.character <= this.line.firstNonWhitespaceCharacterIndex;
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
    for (let i = this.line.lineNumber + 1; i <= this.maxLineIdx; i++) {
      const line = this.editor.document.lineAt(i).text;
      if (line.trim().length > 0) {
        return i;
      }
    }
    return -1;
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
    return -1;
  }

  searchNextBlankLine(): number {
    for (let i = this.line.lineNumber + 1; i <= this.maxLineIdx; i++) {
      const line = this.editor.document.lineAt(i).text;
      if (line.trim().length < 1) {
        return i;
      }
    }
    return -1;
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
    return -1;
  }

  reveal(pos: vscode.Position) {
    const range = new vscode.Range(pos, pos);
    this.editor.revealRange(range);
  }

  unselect() {
    const dest = new vscode.Position(this.active.line, this.active.character);
    this.editor.selection = new vscode.Selection(dest, dest);
    this.reveal(dest);
  }

  snapTo(lineIdx: number, charIdx: number, selecting: boolean) {
    const dest = new vscode.Position(lineIdx, charIdx);
    const anchor = selecting ? this.anchor : dest;
    this.editor.selection = new vscode.Selection(anchor, dest);
    this.reveal(dest);
  }

  toEndOfBlock(selecting: boolean) {
    const nextBlank = this.searchNextBlankLine();
    const lineIdx = nextBlank < 0 ? this.maxLineIdx : nextBlank - 1;
    const charIdx = this.editor.document.lineAt(lineIdx).text.length;
    this.snapTo(lineIdx, charIdx, selecting);
  }

  toBeginningOfNextBlock(selecting: boolean) {
    const nextNonBlank = this.searchNextNonBlankLine();
    const lineIdx = nextNonBlank < 0 ? this.maxLineIdx : nextNonBlank;
    const charIdx = this.editor.document.lineAt(lineIdx).firstNonWhitespaceCharacterIndex;
    this.snapTo(lineIdx, charIdx, selecting);
    this.snapTo(lineIdx, charIdx, selecting);
  }

  toBeginningOfBlock(selecting: boolean) {
    const prevBlank = this.searchPreviousBlankLine();
    const lineIdx = prevBlank < 0 ? 0 : prevBlank + 1;
    const charIdx = this.editor.document.lineAt(lineIdx).firstNonWhitespaceCharacterIndex;
    this.snapTo(lineIdx, charIdx, selecting);
  }

  toEndOfPreviousBlock(selecting: boolean) {
    const prevNonBlank = this.searchPreviousNonBlankLine();
    const lineIdx = prevNonBlank < 0 ? 0 : prevNonBlank;
    const charIdx = this.editor.document.lineAt(lineIdx).text.length;
    this.snapTo(lineIdx, charIdx, selecting);
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

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

  constructor(editor: vscode.TextEditor, idx: number) {
    this.editor = editor;
    const sel = this.editor.selections[idx];
    this.anchor = sel.anchor;
    this.active = sel.active;
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

  collapseSelection(): vscode.Selection {
    const dest = new vscode.Position(this.active.line, this.active.character);
    const sel = new vscode.Selection(dest, dest);
    return sel;
  }

  updateSelection(lineIdx: number, charIdx: number, selecting: boolean): vscode.Selection {
    const dest = new vscode.Position(lineIdx, charIdx);
    const anchor = selecting ? this.anchor : dest;
    const sel = new vscode.Selection(anchor, dest);
    return sel;
  }

  toEndOfBlock(selecting: boolean): vscode.Selection {
    const nextBlank = this.searchNextBlankLine();
    const lineIdx = nextBlank < 0 ? this.maxLineIdx : nextBlank - 1;
    const charIdx = this.editor.document.lineAt(lineIdx).text.length;
    return this.updateSelection(lineIdx, charIdx, selecting);
  }

  toBeginningOfNextBlock(selecting: boolean): vscode.Selection {
    const nextNonBlank = this.searchNextNonBlankLine();
    const lineIdx = nextNonBlank < 0 ? this.maxLineIdx : nextNonBlank;
    const charIdx = this.editor.document.lineAt(lineIdx).firstNonWhitespaceCharacterIndex;
    return this.updateSelection(lineIdx, charIdx, selecting);
  }

  toBeginningOfBlock(selecting: boolean): vscode.Selection {
    const prevBlank = this.searchPreviousBlankLine();
    const lineIdx = prevBlank < 0 ? 0 : prevBlank + 1;
    const charIdx = this.editor.document.lineAt(lineIdx).firstNonWhitespaceCharacterIndex;
    return this.updateSelection(lineIdx, charIdx, selecting);
  }

  toEndOfPreviousBlock(selecting: boolean): vscode.Selection {
    const prevNonBlank = this.searchPreviousNonBlankLine();
    const lineIdx = prevNonBlank < 0 ? 0 : prevNonBlank;
    const charIdx = this.editor.document.lineAt(lineIdx).text.length;
    return this.updateSelection(lineIdx, charIdx, selecting);
  }
}

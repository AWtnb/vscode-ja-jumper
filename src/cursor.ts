import * as vscode from "vscode";

export class Cursor {
  readonly editor: vscode.TextEditor;
  readonly anchor: vscode.Position;
  readonly active: vscode.Position;

  constructor(editor: vscode.TextEditor) {
    this.editor = editor;
    this.anchor = this.editor.selection.anchor;
    this.active = this.editor.selection.active;
  }

  getLine(): vscode.TextLine {
    return this.editor.document.lineAt(this.active.line);
  }

  isBOL(): boolean {
    // BOL: beginning of line
    return this.active.character == 0;
  }

  isBOF(): boolean {
    // BOF: beginning of file
    return this.isBOL() && this.active.line == 0;
  }

  isEOL(): boolean {
    // EOL: end of line
    return this.active.character == this.getLine().text.length;
  }

  isEOF(): boolean {
    // EOF: end of file
    return this.isEOL() && this.active.line == this.editor.document.lineCount - 1;
  }

  searchNextNonBlankLine(): number {
    const max = this.editor.document.lineCount;
    for (let i = this.getLine().lineNumber + 1; i < max; i++) {
      const line = this.editor.document.lineAt(i).text;
      if (line.trim().length > 0) {
        return i;
      }
    }
    return max - 1;
  }

  searchPreviousNonBlankLine(): number {
    const curLine = this.getLine()
    for (let i = 1; i <= curLine.lineNumber; i++) {
      const delta = curLine.lineNumber - i;
      const line = this.editor.document.lineAt(delta).text;
      if (line.trim().length > 0) {
        return delta;
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

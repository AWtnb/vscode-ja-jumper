import * as vscode from "vscode";

import { Cursor } from "./cursor";

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
      cursor.update(cursor.active, cursor.active);
      return;
    }
    if (cursor.isEOF()) {
      return;
    }
    if (cursor.isEOL()) {
      const lineIndex = cursor.searchNextNonBlankLine();
      const jumpTo = new vscode.Position(lineIndex, editor.document.lineAt(lineIndex).firstNonWhitespaceCharacterIndex);
      const anchor = selecting ? cursor.anchor : jumpTo;
      cursor.update(anchor, jumpTo);
      return;
    }
    const curLine = cursor.getLine();
    const afterCursor = curLine.text.substring(cursor.active.character);
    const delta = this.searchFore(afterCursor);
    const toChar = delta < 0 ? curLine.text.length : cursor.active.character + delta + 1;
    const jumpTo = new vscode.Position(curLine.lineNumber, toChar);
    const anchor = selecting ? cursor.anchor : jumpTo;
    cursor.update(anchor, jumpTo);
  }

  jumpBack(editor: vscode.TextEditor, selecting: boolean = false) {
    const cursor = new Cursor(editor);
    if (!selecting && !editor.selection.isEmpty) {
      cursor.update(cursor.active, cursor.active);
      return;
    }
    if (cursor.isBOF()) {
      return;
    }
    if (cursor.isBOL()) {
      const lineIndex = cursor.searchPreviousNonBlankLine();
      const jumpTo = new vscode.Position(lineIndex, editor.document.lineAt(lineIndex).text.length);
      const anchor = selecting ? cursor.anchor : jumpTo;
      cursor.update(anchor, jumpTo);
      return;
    }
    const curLine = cursor.getLine();
    const beforeCursor = curLine.text.substring(0, cursor.active.character);
    const delta = this.searchBack(beforeCursor);
    const toChar = delta < 0 ? 0 : cursor.active.character - delta - 1;
    const jumpTo = new vscode.Position(curLine.lineNumber, toChar);
    const anchor = selecting ? cursor.anchor : jumpTo;
    cursor.update(anchor, jumpTo);
  }
}

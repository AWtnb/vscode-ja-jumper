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
    if (cursor.isEOF) {
      return;
    }
    if (cursor.isEOL) {
      const lineIndex = cursor.searchNextNonBlankLine();
      const jumpTo = new vscode.Position(lineIndex, editor.document.lineAt(lineIndex).firstNonWhitespaceCharacterIndex);
      const anchor = selecting ? cursor.anchor : jumpTo;
      cursor.update(anchor, jumpTo);
      return;
    }
    const curLine = cursor.line;
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
    if (cursor.isBOF) {
      return;
    }
    if (cursor.isBOL) {
      const lineIndex = cursor.searchPreviousNonBlankLine();
      const jumpTo = new vscode.Position(lineIndex, editor.document.lineAt(lineIndex).text.length);
      const anchor = selecting ? cursor.anchor : jumpTo;
      cursor.update(anchor, jumpTo);
      return;
    }
    const curLine = cursor.line;
    const beforeCursor = curLine.text.substring(0, cursor.active.character);
    const delta = this.searchBack(beforeCursor);
    const toChar = delta < 0 ? 0 : cursor.active.character - delta - 1;
    const jumpTo = new vscode.Position(curLine.lineNumber, toChar);
    const anchor = selecting ? cursor.anchor : jumpTo;
    cursor.update(anchor, jumpTo);
  }

  jumpDown(editor: vscode.TextEditor, selecting: boolean = false) {
    const cursor = new Cursor(editor);
    if (!selecting && !editor.selection.isEmpty) {
      cursor.update(cursor.active, cursor.active);
      return;
    }
    if (cursor.isEOF) {
      return;
    }
    const nextLine = cursor.getNextLine();
    if (!nextLine) {
      return;
    }
    const curLine = cursor.line;
    let lineIdx: number;
    let charIdx: number;
    if (curLine.text.trim().length) {
      // if current line is not blank
      if (nextLine.text.trim().length) {
        // if next line is not blank
        lineIdx = cursor.searchNextBlankLine() - 1;
        charIdx = editor.document.lineAt(lineIdx).text.length;
      } else {
        // if next line is blank
        if (cursor.isEOL) {
          lineIdx = cursor.searchNextNonBlankLine();
          charIdx = editor.document.lineAt(lineIdx).firstNonWhitespaceCharacterIndex;
        } else {
          lineIdx = curLine.lineNumber;
          charIdx = curLine.text.length;
        }
      }
    } else {
      // if current line is blank
      if (nextLine.text.trim().length) {
        // if next line is not blank
        lineIdx = nextLine.lineNumber;
        charIdx = nextLine.firstNonWhitespaceCharacterIndex;
      } else {
        // if next line is blank
        lineIdx = cursor.searchNextNonBlankLine();
        charIdx = editor.document.lineAt(lineIdx).firstNonWhitespaceCharacterIndex;
      }
    }
    const jumpTo = new vscode.Position(lineIdx, charIdx);
    const anchor = selecting ? cursor.anchor : jumpTo;
    cursor.update(anchor, jumpTo);
  }

  jumpUp(editor: vscode.TextEditor, selecting: boolean = false) {
    const cursor = new Cursor(editor);
    if (!selecting && !editor.selection.isEmpty) {
      cursor.update(cursor.active, cursor.active);
      return;
    }
    if (cursor.isBOF) {
      return;
    }
    const prevLine = cursor.getPreviousLine();
    if (!prevLine) {
      return;
    }
    const curLine = cursor.line;
    let lineIdx: number;
    let charIdx: number;
    if (curLine.text.trim().length) {
      // if current line is not blank
      if (prevLine.text.trim().length) {
        // if previous line is not blank
        lineIdx = cursor.searchPreviousBlankLine() + 1;
        charIdx = editor.document.lineAt(lineIdx).firstNonWhitespaceCharacterIndex;
      } else {
        // if previous line is blank
        if (cursor.isBOL) {
          lineIdx = cursor.searchPreviousNonBlankLine();
          charIdx = editor.document.lineAt(lineIdx).text.length;
        } else if (cursor.isBeforeContent) {
          lineIdx = curLine.lineNumber;
          charIdx = 0;
        } else {
          lineIdx = curLine.lineNumber;
          charIdx = curLine.firstNonWhitespaceCharacterIndex;
        }
      }
    } else {
      // if current line is blank
      if (prevLine.text.trim().length) {
        // if previous line is not blank
        lineIdx = prevLine.lineNumber;
        charIdx = prevLine.text.length;
      } else {
        // if previous line is blank
        lineIdx = cursor.searchPreviousNonBlankLine();
        charIdx = editor.document.lineAt(lineIdx).text.length;
      }
    }
    const jumpTo = new vscode.Position(lineIdx, charIdx);
    const anchor = selecting ? cursor.anchor : jumpTo;
    cursor.update(anchor, jumpTo);
  }
}

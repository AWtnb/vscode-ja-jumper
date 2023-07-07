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
      cursor.unselect();
      return;
    }
    if (cursor.isEOF) {
      return;
    }
    if (cursor.isEOL) {
      cursor.toBeginningOfNextBlock(selecting);
      return;
    }
    const curLine = cursor.line;
    const afterCursor = curLine.text.substring(cursor.active.character);
    const delta = this.searchFore(afterCursor);
    const toChar = delta < 0 ? curLine.text.length : cursor.active.character + delta + 1;
    cursor.snapTo(curLine.lineNumber, toChar, selecting);
  }

  jumpBack(editor: vscode.TextEditor, selecting: boolean = false) {
    const cursor = new Cursor(editor);
    if (!selecting && !editor.selection.isEmpty) {
      cursor.unselect();
      return;
    }
    if (cursor.isBOF) {
      return;
    }
    if (cursor.isBOL) {
      cursor.toEndOfPreviousBlock(selecting);
      return;
    }
    const curLine = cursor.line;
    const beforeCursor = curLine.text.substring(0, cursor.active.character);
    const delta = this.searchBack(beforeCursor);
    const toChar = delta < 0 ? 0 : cursor.active.character - delta - 1;
    cursor.snapTo(curLine.lineNumber, toChar, selecting);
  }

  jumpDown(editor: vscode.TextEditor, selecting: boolean = false) {
    const cursor = new Cursor(editor);
    if (!selecting && !editor.selection.isEmpty) {
      cursor.unselect();
      return;
    }
    if (cursor.isEOF) {
      return;
    }
    const nextLine = cursor.getNextLine();
    if (!nextLine) {
      cursor.toEndOfBlock(selecting);
      return;
    }
    const curLine = cursor.line;
    if (curLine.text.trim().length) {
      if (nextLine.text.trim().length < 1 && cursor.isEOL) {
        cursor.toBeginningOfNextBlock(selecting);
        return;
      }
      cursor.toEndOfBlock(selecting);
      return;
    }
    cursor.toBeginningOfNextBlock(selecting);
  }

  jumpUp(editor: vscode.TextEditor, selecting: boolean = false) {
    const cursor = new Cursor(editor);
    if (!selecting && !editor.selection.isEmpty) {
      cursor.unselect();
      return;
    }
    if (cursor.isBOF) {
      return;
    }
    const prevLine = cursor.getPreviousLine();
    if (!prevLine) {
      cursor.toBeginningOfBlock(selecting);
      return;
    }
    const curLine = cursor.line;
    if (curLine.text.trim().length) {
      if (prevLine.text.trim().length < 1 && cursor.isBeforeContent) {
        cursor.toEndOfPreviousBlock(selecting);
        return;
      }
      cursor.toBeginningOfBlock(selecting);
      return;
    }
    cursor.toEndOfPreviousBlock(selecting);
  }
}

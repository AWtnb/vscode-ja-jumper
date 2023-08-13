import * as vscode from "vscode";

import { Cursor } from "./cursor";
import { SelectionHandler } from "./selection-handler";

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
    const sels: vscode.Selection[] = editor.selections.map((sel, idx) => {
      const cursor = new Cursor(editor, idx);
      if (!selecting && !sel.isEmpty) {
        return cursor.collapseSelection();
      }
      if (cursor.isEOF) {
        return sel;
      }
      if (cursor.isEOL) {
        return cursor.toBeginningOfNextBlock(selecting);
      }
      const curLine = cursor.line;
      const afterCursor = curLine.text.substring(cursor.active.character);
      const delta = this.searchFore(afterCursor);
      const toChar = delta < 0 ? curLine.text.length : cursor.active.character + delta + 1;
      return cursor.updateSelection(curLine.lineNumber, toChar, selecting);
    });
    const handler = new SelectionHandler(sels);
    editor.selections = handler.getReduced();
    editor.revealRange(sels[sels.length - 1]);
  }

  jumpBack(editor: vscode.TextEditor, selecting: boolean = false) {
    const sels: vscode.Selection[] = editor.selections.map((sel, idx) => {
      const cursor = new Cursor(editor, idx);
      if (!selecting && !sel.isEmpty) {
        return cursor.collapseSelection();
      }
      if (cursor.isBOF) {
        return sel;
      }
      if (cursor.isBOL) {
        return cursor.toEndOfPreviousBlock(selecting);
      }
      const curLine = cursor.line;
      const beforeCursor = curLine.text.substring(0, cursor.active.character);
      const delta = this.searchBack(beforeCursor);
      const toChar = delta < 0 ? 0 : cursor.active.character - delta - 1;
      return cursor.updateSelection(curLine.lineNumber, toChar, selecting);
    });
    const handler = new SelectionHandler(sels);
    editor.selections = handler.getReduced();
    editor.revealRange(sels[0]);
  }

  jumpDown(editor: vscode.TextEditor, selecting: boolean = false) {
    const sels: vscode.Selection[] = editor.selections.map((sel, idx) => {
      const cursor = new Cursor(editor, idx);
      if (!selecting && !sel.isEmpty) {
        return cursor.collapseSelection();
      }
      if (cursor.isEOF) {
        return sel;
      }
      const nextLine = cursor.getNextLine();
      if (!nextLine) {
        return cursor.toEndOfBlock(selecting);
      }
      const curLine = cursor.line;
      if (curLine.text.trim().length) {
        if (nextLine.text.trim().length < 1 && cursor.isEOL) {
          return cursor.toBeginningOfNextBlock(selecting);
        }
        return cursor.toEndOfBlock(selecting);
      }
      return cursor.toBeginningOfNextBlock(selecting);
    });
    const handler = new SelectionHandler(sels);
    editor.selections = handler.getReduced();
    editor.revealRange(sels[sels.length - 1]);
  }

  jumpUp(editor: vscode.TextEditor, selecting: boolean = false) {
    const sels: vscode.Selection[] = editor.selections.map((sel, idx) => {
      const cursor = new Cursor(editor, idx);
      if (!selecting && !sel.isEmpty) {
        return cursor.collapseSelection();
      }
      if (cursor.isBOF) {
        return sel;
      }
      const prevLine = cursor.getPreviousLine();
      if (!prevLine) {
        return cursor.toBeginningOfBlock(selecting);
      }
      const curLine = cursor.line;
      if (curLine.text.trim().length) {
        if (prevLine.text.trim().length < 1 && cursor.isBeforeContent) {
          return cursor.toEndOfPreviousBlock(selecting);
        }
        return cursor.toBeginningOfBlock(selecting);
      }
      return cursor.toEndOfPreviousBlock(selecting);
    });
    const handler = new SelectionHandler(sels);
    editor.selections = handler.getReduced();
    editor.revealRange(sels[0]);
  }
}

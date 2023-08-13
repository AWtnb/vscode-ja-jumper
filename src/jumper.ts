import * as vscode from "vscode";

import { Searcher } from "./searcher";
import { Cursor } from "./cursor";
import { SelectionHandler } from "./selection-handler";

export class Jumper {
  private readonly _editor: vscode.TextEditor;
  private readonly _searcher: Searcher;
  private readonly _selecting: boolean;
  constructor(editor: vscode.TextEditor, searcher: Searcher, selecting: boolean = false) {
    this._editor = editor;
    this._searcher = searcher;
    this._selecting = selecting;
  }

  jumpFore() {
    const sels: vscode.Selection[] = this._editor.selections.map((sel) => {
      const cursor = new Cursor(this._editor, sel, this._selecting);
      if (!this._selecting && !sel.isEmpty) {
        return cursor.collapse();
      }
      if (cursor.isEOF) {
        return sel;
      }
      if (cursor.isEOL) {
        return cursor.beginningOfNextBlock();
      }
      const curLine = cursor.line;
      const afterCursor = curLine.text.substring(cursor.active.character);
      const delta = this._searcher.forward(afterCursor);
      const toChar = delta < 0 ? curLine.text.length : cursor.active.character + delta + 1;
      return cursor.invoke(curLine.lineNumber, toChar);
    });
    const handler = new SelectionHandler(sels);
    this._editor.selections = handler.getReduced();
    this._editor.revealRange(this._editor.selections[this._editor.selections.length - 1]);
  }

  jumpBack() {
    const sels: vscode.Selection[] = this._editor.selections.map((sel) => {
      const cursor = new Cursor(this._editor, sel, this._selecting);
      if (!this._selecting && !sel.isEmpty) {
        return cursor.collapse();
      }
      if (cursor.isBOF) {
        return sel;
      }
      if (cursor.isBOL) {
        return cursor.endOfPreviousBlock();
      }
      const curLine = cursor.line;
      const beforeCursor = curLine.text.substring(0, cursor.active.character);
      const delta = this._searcher.backward(beforeCursor);
      const toChar = delta < 0 ? 0 : cursor.active.character - delta - 1;
      return cursor.invoke(curLine.lineNumber, toChar);
    });
    const handler = new SelectionHandler(sels);
    this._editor.selections = handler.getReduced();
    this._editor.revealRange(this._editor.selections[0]);
  }

  jumpDown() {
    const sels: vscode.Selection[] = this._editor.selections.map((sel) => {
      const cursor = new Cursor(this._editor, sel, this._selecting);
      if (!this._selecting && !sel.isEmpty) {
        return cursor.collapse();
      }
      if (cursor.isEOF) {
        return sel;
      }
      const nextLine = cursor.getNextLine();
      if (!nextLine) {
        return cursor.endOfBlock();
      }
      const curLine = cursor.line;
      if (curLine.text.trim().length) {
        if (nextLine.text.trim().length < 1 && cursor.isEOL) {
          return cursor.beginningOfNextBlock();
        }
        return cursor.endOfBlock();
      }
      return cursor.beginningOfNextBlock();
    });
    const handler = new SelectionHandler(sels);
    this._editor.selections = handler.getReduced();
    this._editor.revealRange(this._editor.selections[this._editor.selections.length - 1]);
  }

  jumpUp() {
    const sels: vscode.Selection[] = this._editor.selections.map((sel) => {
      const cursor = new Cursor(this._editor, sel, this._selecting);
      if (!this._selecting && !sel.isEmpty) {
        return cursor.collapse();
      }
      if (cursor.isBOF) {
        return sel;
      }
      const prevLine = cursor.getPreviousLine();
      if (!prevLine) {
        return cursor.beginningOfBlock();
      }
      const curLine = cursor.line;
      if (curLine.text.trim().length) {
        if (prevLine.text.trim().length < 1 && cursor.isBeforeContent) {
          return cursor.endOfPreviousBlock();
        }
        return cursor.beginningOfBlock();
      }
      return cursor.endOfPreviousBlock();
    });
    const handler = new SelectionHandler(sels);
    this._editor.selections = handler.getReduced();
    this._editor.revealRange(this._editor.selections[0]);
  }
}

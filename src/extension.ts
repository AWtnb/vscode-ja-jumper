import * as vscode from "vscode";

import { Jumper } from "./jumper";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand("ja-jumper.jumpFore", (editor: vscode.TextEditor, _edit, selecting: boolean = false) => {
      const jumper = new Jumper(editor, selecting);
      jumper.jumpFore();
    })
  );
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand("ja-jumper.jumpBack", (editor: vscode.TextEditor, _edit, selecting: boolean = false) => {
      const jumper = new Jumper(editor, selecting);
      jumper.jumpBack();
    })
  );
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand("ja-jumper.jumpDown", (editor: vscode.TextEditor, _edit, selecting: boolean = false) => {
      const jumper = new Jumper(editor, selecting);
      jumper.jumpDown();
    })
  );
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand("ja-jumper.jumpUp", (editor: vscode.TextEditor, _edit, selecting: boolean = false) => {
      const jumper = new Jumper(editor, selecting);
      jumper.jumpUp();
    })
  );
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand("ja-jumper.swapAnchor", (editor: vscode.TextEditor) => {
      editor.selections = editor.selections.map((sel) => {
        return new vscode.Selection(sel.active, sel.anchor);
      });
      const sel = editor.selections[0];
      const range = new vscode.Range(sel.active, sel.active);
      editor.revealRange(range);
    })
  );
}

export function deactivate() {}

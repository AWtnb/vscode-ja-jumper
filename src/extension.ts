import * as vscode from "vscode";

import { Jumper } from "./jumper";
import { Cursor } from "./cursor";

export function activate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration("ja-jumper");
  const delimiters: string = config.get("delimiters") || "";
  const isGreedy: boolean = config.get("isGreedy") || false;
  const JUMPER = new Jumper(delimiters, isGreedy);

  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand("ja-jumper.jumpFore", (editor: vscode.TextEditor, _edit, selecting: boolean = false) => {
      JUMPER.jumpFore(editor, selecting);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand("ja-jumper.jumpBack", (editor: vscode.TextEditor, _edit, selecting: boolean = false) => {
      JUMPER.jumpBack(editor, selecting);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand("ja-jumper.jumpDown", (editor: vscode.TextEditor, _edit, selecting: boolean = false) => {
      JUMPER.jumpDown(editor, selecting);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand("ja-jumper.jumpUp", (editor: vscode.TextEditor, _edit, selecting: boolean = false) => {
      JUMPER.jumpUp(editor, selecting);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand("ja-jumper.swapAnchor", (editor: vscode.TextEditor) => {
      editor.selections = editor.selections.map((sel) => {
        return new vscode.Selection(sel.active, sel.anchor);
      });
    })
  );
}

export function deactivate() {}

import * as vscode from "vscode";

import { Jumper } from "./jumper";
import { Cursor } from "./cursor";

export function activate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration("ja-jumper");
  const delimiters: string = config.get("delimiters") || "";
  const isGreedy: boolean = config.get("isGreedy") || false;
  const JUMPER = new Jumper(delimiters, isGreedy);

  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand("ja-jumper.jumpFore", (editor: vscode.TextEditor) => {
      JUMPER.jumpFore(editor, false);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand("ja-jumper.jumpBack", (editor: vscode.TextEditor) => {
      JUMPER.jumpBack(editor, false);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand("ja-jumper.jumpForeSelect", (editor: vscode.TextEditor) => {
      JUMPER.jumpFore(editor, true);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand("ja-jumper.jumpBackSelect", (editor: vscode.TextEditor) => {
      JUMPER.jumpBack(editor, true);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand("ja-jumper.swapAnchor", (editor: vscode.TextEditor) => {
      new Cursor(editor).swapAnchor();
    })
  );
}

export function deactivate() {}

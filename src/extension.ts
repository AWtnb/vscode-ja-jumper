import * as vscode from "vscode";

import { Jumper } from "./jumper";

const config = vscode.workspace.getConfiguration("ja-jumper");
const delimiters: string = config.get("delimiters") || "";
const scrollPosition: string = config.get("scrollPosition") || "";
const JUMPER = new Jumper(delimiters, scrollPosition);

export function activate(context: vscode.ExtensionContext) {
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
      Jumper.swapAnchor(editor);
    })
  );
}

export function deactivate() {}

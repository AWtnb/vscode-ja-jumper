import * as vscode from "vscode";

import { Searcher } from "./searcher";
import { Jumper } from "./jumper";

export function activate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration("ja-jumper");
  const delimiters: string = config.get("delimiters") || "";
  const isGreedy: boolean = config.get("isGreedy") || false;
  const SEARCHER = new Searcher(delimiters, isGreedy);

  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand("ja-jumper.jumpFore", (editor: vscode.TextEditor, _edit, selecting: boolean = false) => {
      const jumper = new Jumper(editor, SEARCHER, selecting);
      jumper.jumpFore();
    })
  );
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand("ja-jumper.jumpBack", (editor: vscode.TextEditor, _edit, selecting: boolean = false) => {
      const jumper = new Jumper(editor, SEARCHER, selecting);
      jumper.jumpBack();
    })
  );
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand("ja-jumper.jumpDown", (editor: vscode.TextEditor, _edit, selecting: boolean = false) => {
      const jumper = new Jumper(editor, SEARCHER, selecting);
      jumper.jumpDown();
    })
  );
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand("ja-jumper.jumpUp", (editor: vscode.TextEditor, _edit, selecting: boolean = false) => {
      const jumper = new Jumper(editor, SEARCHER, selecting);
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

import * as vscode from "vscode";

import { Jumper } from "./jumper";

const config = vscode.workspace.getConfiguration("ja-jumper");
const JUMPER = new Jumper(config.get("extras"));

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand("ja-jumper.helloJumper", () => console.log("Ja-Jumper was enabled!")));
  context.subscriptions.push(vscode.commands.registerCommand("ja-jumper.jumpFore", (isSelecting: boolean) => JUMPER.jumpFore(isSelecting)));
  context.subscriptions.push(vscode.commands.registerCommand("ja-jumper.jumpBack", (isSelecting: boolean) => JUMPER.jumpBack(isSelecting)));
}

export function deactivate() {}

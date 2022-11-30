import * as vscode from "vscode";

import { Jumper } from "./jumper";

const config = vscode.workspace.getConfiguration("ja-jumper");
const JUMPER = new Jumper(config.get("extras"), config.get("exclude"));

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand("ja-jumper.helloJumper", () => console.log("Ja-Jumper was enabled!")));
  context.subscriptions.push(vscode.commands.registerCommand("ja-jumper.jumpFore", () => JUMPER.jumpFore(false)));
  context.subscriptions.push(vscode.commands.registerCommand("ja-jumper.jumpBack", () => JUMPER.jumpBack(false)));
  context.subscriptions.push(vscode.commands.registerCommand("ja-jumper.jumpForeSelect", () => JUMPER.jumpFore(true)));
  context.subscriptions.push(vscode.commands.registerCommand("ja-jumper.jumpBackSelect", () => JUMPER.jumpBack(true)));
  context.subscriptions.push(vscode.commands.registerCommand("ja-jumper.swapAnchor", Jumper.swapAnchor));
}

export function deactivate() {}

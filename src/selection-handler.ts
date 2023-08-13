import * as vscode from "vscode";

const unifySelections = (base: vscode.Selection, another: vscode.Selection): vscode.Selection => {
  const start = base.start.isBeforeOrEqual(another.start) ? base.start : another.start;
  const end = base.end.isAfterOrEqual(another.end) ? base.end : another.end;
  if (base.isReversed) {
    return new vscode.Selection(end, start);
  }
  return new vscode.Selection(start, end);
};

export class SelectionHandler {
  private readonly _sels: vscode.Selection[];
  constructor(sels: vscode.Selection[]) {
    this._sels = sels;
  }

  private getOrdered(): vscode.Selection[] {
    return this._sels
      .sort((a: vscode.Selection, b: vscode.Selection): number => {
        if (a.end.isBefore(b.end)) {
          return -1;
        }
        if (b.end.isBefore(a.end)) {
          return 1;
        }
        return 0;
      })
      .sort((a: vscode.Selection, b: vscode.Selection): number => {
        if (a.start.isBefore(b.start)) {
          return -1;
        }
        if (b.start.isBefore(a.start)) {
          return 1;
        }
        return 0;
      });
  }

  getReduced(backward: boolean = false): vscode.Selection[] {
    const ordered = this.getOrdered();
    const sels: vscode.Selection[] = [];
    for (let i = 0; i < ordered.length; i++) {
      const cur = ordered[i];
      if (i < 1) {
        sels.push(cur);
        continue;
      }
      const last = sels[sels.length - 1];
      if (cur.isEqual(last)) {
        continue;
      }
      if (last.intersection(cur)) {
        sels.pop();
        if (backward) {
          sels.push(unifySelections(cur, last));
        } else {
          sels.push(unifySelections(last, cur));
        }
      } else {
        sels.push(cur);
      }
    }
    return sels;
  }
}

import * as vscode from "vscode";

class SelectionUnifier {
  private readonly _base: vscode.Selection;
  constructor(sel: vscode.Selection) {
    this._base = sel;
  }
  with(another: vscode.Selection): vscode.Selection {
    const start = this._base.start.isBeforeOrEqual(another.start) ? this._base.start : another.start;
    const end = this._base.end.isAfterOrEqual(another.end) ? this._base.end : another.end;
    if (this._base.isReversed) {
      return new vscode.Selection(end, start);
    }
    return new vscode.Selection(start, end);
  }
}

export class SelectionHandler {
  private readonly _sels: vscode.Selection[];
  constructor(sels: vscode.Selection[]) {
    this._sels = sels;
  }

  private getOrdered(): vscode.Selection[] {
    return this._sels.sort((a: vscode.Selection, b: vscode.Selection): number => {
      if (a.end.isBefore(b.start)) {
        return -1;
      }
      if (b.end.isBefore(a.start)) {
        return 1;
      }
      return 0;
    });
  }

  getReduced(): vscode.Selection[] {
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
        const uni = new SelectionUnifier(last);
        sels.push(uni.with(cur));
      } else {
        sels.push(cur);
      }
    }
    return sels;
  }
}

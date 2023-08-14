import * as vscode from "vscode";

class SelectionMerger {
  private readonly _base: vscode.Selection;
  private readonly _reversed: boolean;

  /**
   * @param base {vscode.Selection} A selection to be base of merge.
   * @param reversed {boolean} If merge selections from lower to upper, set this `true`.
   */
  constructor(base: vscode.Selection, reversed: boolean) {
    this._base = base;
    this._reversed = reversed;
  }

  /**
   * merge with another selection.
   * @param another {vscode.Selection} Another selection. This should be after `base` selection.
   * @returns {vscode.Selection} New selection with smaller start position and larger end position.
   * Anchor and active position is determined by original selection orientation and `reversed` patameter.
   */
  with(another: vscode.Selection): vscode.Selection {
    const uni = this._base.union(another);
    const orientationBase = this._reversed ? another : this._base;
    if (orientationBase.isReversed) {
      return new vscode.Selection(uni.end, uni.start);
    }
    return new vscode.Selection(uni.start, uni.end);
  }
}

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
        const merger = new SelectionMerger(last, backward);
        sels.push(merger.with(cur));
      } else {
        sels.push(cur);
      }
    }
    return sels;
  }
}

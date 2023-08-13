export class Searcher {
  private readonly _delimiters: string;
  private readonly _greedy: boolean;
  constructor(delimiters: string = "", greedy: boolean = true) {
    this._delimiters = delimiters;
    this._greedy = greedy;
  }

  forward(s: string): number {
    for (let i = 0; i < s.length; i++) {
      const c = s.charAt(i);
      if (this._delimiters.includes(c)) {
        if (this._greedy && i < s.length - 1) {
          const next = s.charAt(i + 1);
          if (this._delimiters.includes(next)) {
            continue;
          }
        }
        return i;
      }
    }
    return -1;
  }

  backward(s: string): number {
    for (let i = 0; i < s.length; i++) {
      const c = s.charAt(s.length - i - 1);
      if (this._delimiters.includes(c)) {
        if (this._greedy && i < s.length - 1) {
          const previous = s.charAt(s.length - i - 2);
          if (this._delimiters.includes(previous)) {
            continue;
          }
        }
        return i;
      }
    }
    return -1;
  }
}

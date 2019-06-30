export function* range(a?: number, b?: number): IterableIterator<number> {
  let i = b === undefined ? 0 : a === undefined ? Infinity : a;
  let n = b === undefined ? (a === undefined ? 0 : a) : b;
  while (i < n) { yield i; i += 1; }
}

export function* range(a: number = null, b: number = null): IterableIterator<number> {
  let i = b === null ? 0 : a === null ? Infinity : a;
  let n = b === null ? a : b;
  while (i < n) { yield i; i += 1; }
}

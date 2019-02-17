import { DOM } from "./dom"
// 自分が変更すると自分に関わったものを全て変更させる
type Primitive = string | number | boolean
type RootRegistClass<T extends Primitive> =
  ((root: T) => any) | HasValueWidgetInterface<T>
export type MayRoot<T extends Primitive> = Root<T> | T
export function assign<T extends Primitive>(may: MayRoot<T>, func: ((t: T) => any)) {
  if (may instanceof Root) may.regist(func)
  else func(may)
}
export class Root<T extends Primitive> {
  private data: T;
  private registed: ((root: T) => any)[] = []
  constructor(initialValue: T) {
    this.data = initialValue;
  }
  set(val: T | ((now: T) => T)) {
    let v = typeof val === "function" ? val(this.data) : val;
    if (this.data === v) return;
    this.data = v;
    for (let r of this.registed) r(v)
  }
  regist(a: RootRegistClass<T>) {
    if (typeof a === "function") {
      this.registed.push(a)
      a(this.data)
    } else this.regist(r => { a.value = r; })
  }
  registClass(a: HasValueWidgetInterface<T> & DOM) {
    this.regist(a)
    return a;
  }

  assign(dst: Root<T>) {
    for (let r of this.registed) dst.regist(r)
    this.registed = [];
    this.regist((now: T) => { dst.set(now) })
  }
  to<S extends Primitive>(func: (t: T) => S): Root<S> {
    let currentComputed = func(this.data);
    let result = new Root<S>(currentComputed);
    this.regist(t => { result.set(func(t)) })
    return result
  }
}
export interface HasValueWidgetInterface<T extends Primitive> { value: T }
export interface HasRootValueWidgetInterface<T extends Primitive> {
  assign: (dst: Root<T>) => void
}
export function* range(a: number = null, b: number = null): IterableIterator<number> {
  let i = b === null ? 0 : a === null ? Infinity : a;
  let n = b === null ? a : b;
  while (i < n) { yield i; i += 1; }
}

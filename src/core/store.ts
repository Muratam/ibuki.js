import { DOM } from "./dom"
// 自分が変更すると自分に関わったものを全て変更させる
export type Primitive = string | number | boolean
type StoreRegistClass<T extends Primitive> =
  ((root: T) => any) | HasValueWidgetInterface<T>
export type MayStore<T extends Primitive> = Store<T> | T
export function assign<T extends Primitive>(may: MayStore<T>, func: ((t: T) => any)) {
  if (may instanceof Store) may.regist(func)
  else func(may)
}
export type DataStore = { [key: string]: Store<any> }
export function toStore(s: string): Store<string>;
export function toStore(s: number): Store<number>;
export function toStore(s: boolean): Store<boolean>;
export function toStore(s: Primitive): any {
  if (typeof s === "string") return new Store<string>(s)
  if (typeof s === "number") return new Store<number>(s)
  if (typeof s === "boolean") return new Store<boolean>(s)
}

export class Store<T extends Primitive> {
  private data: T;
  public get notLinkCreatedRawValue(): T { return this.data; }
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
  regist(a: StoreRegistClass<T>) {
    if (typeof a === "function") {
      this.registed.push(a)
      a(this.data)
    } else this.regist(r => { a.value = r; })
  }
  registClass(a: HasValueWidgetInterface<T> & DOM) {
    this.regist(a)
    return a;
  }

  assign(dst: Store<T>) {
    for (let r of this.registed) dst.regist(r)
    this.registed = [];
    this.regist((now: T) => { dst.set(now) })
  }
  to<S extends Primitive>(func: (t: T) => S): Store<S> {
    let currentComputed = func(this.data);
    let result = new Store<S>(currentComputed);
    this.regist(t => { result.set(func(t)) })
    return result
  }
}
export interface HasValueWidgetInterface<T extends Primitive> { value: T }
export interface HasStoreValueWidgetInterface<T extends Primitive> {
  assign: (dst: Store<T>) => void
  value: Store<T>
}
export function* range(a: number = null, b: number = null): IterableIterator<number> {
  let i = b === null ? 0 : a === null ? Infinity : a;
  let n = b === null ? a : b;
  while (i < n) { yield i; i += 1; }
}

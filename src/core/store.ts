// 自分が変更すると自分に関わったものを全て変更させる
export type Primitive = string | number | boolean
export type DataStore = { [key: string]: Store<any> }
export function toStore(s: string): Store<string>;
export function toStore(s: number): Store<number>;
export function toStore(s: boolean): Store<boolean>;
export function toStore(s: Primitive): any {
  if (typeof s === "string") return new Store<string>(s)
  if (typeof s === "number") return new Store<number>(s)
  if (typeof s === "boolean") return new Store<boolean>(s)
}

export type MayStore<T extends Primitive> = Store<T> | T
export class Store<T extends Primitive> {
  private data: T;
  static regist<S extends Primitive>(may: MayStore<S>, func: ((t: S) => any)) {
    if (may instanceof Store) may.regist(func)
    else func(may)
  }
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
  regist(a: ((store: T) => any) | HasValue<T>) {
    if (typeof a === "function") {
      this.registed.push(a)
      a(this.data)
    } else this.regist(r => { a.value = r; })
    return a
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
export interface HasValue<T extends Primitive> { value: T }
export interface HasStoreValue<T extends Primitive> {
  assign: (dst: Store<T>) => void
  value: Store<T>
}

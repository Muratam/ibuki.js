import { DOM } from "./dom"
// 自分が変更すると自分に関わったものを全て変更させる
type RootRegistClass<T> =
  ((root: T) => any) | HasValueWidgetInterface<T>
export type MayRoot<T> = Root<T> | T
export function assign<T>(may: MayRoot<T>, func: ((t: T) => any)) {
  if (may instanceof Root) may.regist(func)
  else func(may)
}
export class Root<T> {
  private data: T;
  private registed: ((root: T) => any)[] = []
  constructor(initialValue: T) {
    this.data = initialValue;
  }
  set(val: T) {
    if (this.data === val) return;
    this.data = val;
    for (let r of this.registed) r(val)
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
  compute<S>(func: (t: T) => S): Root<S> {
    let currentComputed = func(this.data);
    let result = new Root<S>(currentComputed);
    this.regist(t => { result.set(func(t)) })
    return result
  }
}
export interface DataStore { [key: string]: Root<any> }
export interface HasValueWidgetInterface<T> {
  value: T
}
export interface HasRootValueWidgetInterface<T> {
  readonly value: Root<T>
}

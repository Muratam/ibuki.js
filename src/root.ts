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
  compute<S extends Primitive>(func: (t: T) => S): Root<S> {
    let currentComputed = func(this.data);
    let result = new Root<S>(currentComputed);
    this.regist(t => { result.set(func(t)) })
    return result
  }
  // 正確な時間を測るのには不向き
  static perFrame(step: number = 1, n: number = Infinity): Root<number> {
    let result = new Root<number>(0)
    Updator.regist(
      function* () {
        let i = 0
        for (let i = 0, j = 0; i < n; i++) {
          if (i % step === 0) result.set(j++)
          yield true;
        }
        yield false;
      }
    )
    return result;
  }
}
export interface DataStore {
  [key: string]: Root<any>
}
export interface HasValueWidgetInterface<T extends Primitive> {
  value: T
}
export interface HasRootValueWidgetInterface<T extends Primitive> {
  readonly value: Root<T>
}
export function* range(a: number = null, b: number = null): IterableIterator<number> {
  let i = b === null ? 0 : a === null ? Infinity : a;
  let n = b === null ? a : b;
  while (i < n) { yield i; i += 1; }
}
// 毎フレーム読んでくれる
export class Updator {
  private maxIndex: number = -1;
  private updateList: IterableIterator<boolean>[] = [];
  static $instance = new Updator();
  registImpl(fun: () => IterableIterator<boolean>) {
    this.maxIndex++;
    if (this.maxIndex === this.updateList.length) this.updateList.push(fun());
    else this.updateList[this.maxIndex] = fun();
  }
  static regist(fun: () => IterableIterator<boolean>) {
    Updator.$instance.registImpl(fun);
  }
  private applyUpdateList() {
    for (let i = 0; i < Math.min(this.maxIndex + 1, this.updateList.length); i++) {
      if (this.updateList[i].next().value !== false) continue;
      this.updateList[i] = this.updateList[this.maxIndex];
      this.maxIndex--;
      i--;
    }
    requestAnimationFrame(this.applyUpdateList.bind(this));
  }
  constructor() { requestAnimationFrame(this.applyUpdateList.bind(this)); }
}

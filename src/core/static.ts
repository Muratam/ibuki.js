import * as CSS from "./style"
import { Store } from "./store"
// static っぽい機能を使う時はまとめて destroy できるように scene にわけたい

export class GlobalCSS {
  private doms: HTMLStyleElement[] = []
  constructor() { }
  regist(styles: { [key: string]: CSS.AnyStyle } | string) {
    let dom = document.createElement("style")
    dom.type = "text/css"
    let styleStr = typeof styles === "string" ? styles : "";
    if (typeof styles !== "string") {
      for (let key in styles) styleStr += `${key}{${CSS.flatten(CSS.parse(styles[key]))}}`
    }
    dom.innerHTML = styleStr
    this.doms.push(dom)
    document.head.appendChild(dom)
  }
  destroy() {
    for (let dom of this.doms) dom.remove();
  }
}
const keyIDs = {
  'U+0008': 'BackSpace',
  'U+0009': 'Tab',
  'U+0018': 'Cancel',
  'U+001B': 'Esc',
  'U+0020': 'Space',
  'U+0021': '!',
  'U+0022': '"',
  'U+0023': '#',
  'U+0024': '$',
  'U+0026': '&',
  'U+0027': '\'',
  'U+0028': '(',
  'U+0029': ')',
  'U+002A': '*',
  'U+002B': '+',
  'U+002C': ',',
  'U+002D': '-',
  'U+002E': '.',
  'U+002F': '/',
  'U+0030': '0',
  'U+0031': '1',
  'U+0032': '2',
  'U+0033': '3',
  'U+0034': '4',
  'U+0035': '5',
  'U+0036': '6',
  'U+0037': '7',
  'U+0038': '8',
  'U+0039': '9',
  'U+003A': ':',
  'U+003B': ';',
  'U+003C': '<',
  'U+003D': '=',
  'U+003E': '>',
  'U+003F': '?',
  'U+0040': '@',
  'U+0041': 'a',
  'U+0042': 'b',
  'U+0043': 'c',
  'U+0044': 'd',
  'U+0045': 'e',
  'U+0046': 'f',
  'U+0047': 'g',
  'U+0048': 'h',
  'U+0049': 'i',
  'U+004A': 'j',
  'U+004B': 'k',
  'U+004C': 'l',
  'U+004D': 'm',
  'U+004E': 'n',
  'U+004F': 'o',
  'U+0050': 'p',
  'U+0051': 'q',
  'U+0052': 'r',
  'U+0053': 's',
  'U+0054': 't',
  'U+0055': 'u',
  'U+0056': 'v',
  'U+0057': 'w',
  'U+0058': 'x',
  'U+0059': 'y',
  'U+005A': 'z',
  'U+005B': '[',
  'U+005C': '\\',
  'U+005D': ']',
  'U+005E': '^',
  'U+005F': '_',
  'U+0060': '`',
  'U+007B': '{',
  'U+007C': '|',
  'U+007D': '}',
  'U+007F': 'Delete',
  'U+00A1': '¡',
  'U+0300': 'CombGrave',
  'U+0302': 'CombCircum',
  'U+0303': 'CombTilde',
  'U+0304': 'CombMacron',
  'U+0306': 'CombBreve',
  'U+0307': 'CombDot',
  'U+0308': 'CombDiaer',
  'U+030A': 'CombRing',
  'U+030B': 'CombDblAcute',
  'U+030C': 'CombCaron',
  'U+0327': 'CombCedilla',
  'U+0328': 'CombOgonek',
  'U+0345': 'CombYpogeg',
  'U+20AC': '€',
  'U+3099': 'CombVoice',
  'U+309A': 'CombSVoice',
};
export type KeysType = { [key: string]: boolean }
export type KeyBoardCallBack = (key: KeysType) => any
export class KeyBoard {
  private keyDownCallBacks: KeyBoardCallBack[] = [];
  private keyPressCallBacks: KeyBoardCallBack[] = [];
  private keyUpCallBacks: KeyBoardCallBack[] = [];
  private keyPress: (e: KeyboardEvent) => any
  private keyDown: (e: KeyboardEvent) => any
  private keyUp: (e: KeyboardEvent) => any
  onKeyDown(fun: KeyBoardCallBack) { this.keyDownCallBacks.push(fun) }
  onKeyPress(fun: KeyBoardCallBack) { this.keyPressCallBacks.push(fun) }
  onKeyUp(fun: KeyBoardCallBack) { this.keyUpCallBacks.push(fun) }
  private keyDowns: KeysType = {}
  private keyPresses: KeysType = {}
  private keyUps: KeysType = {}
  constructor(updater: Updater) {
    updater.regist(() => {
      for (let k of this.keyDownCallBacks) k(this.keyDowns)
      for (let k of this.keyPressCallBacks) k(this.keyPresses)
      for (let k of this.keyUpCallBacks) k(this.keyUps)
      this.keyUps = {}
      this.keyDowns = {}
      this.keyPresses = {}
      return true;
    })
    this.keyPress = e => { this.keyPresses[e.key] = true }
    this.keyDown = e => { this.keyDowns[e.key] = true }
    this.keyUp = e => { this.keyUps[e.key] = true }
    document.addEventListener('keypress', this.keyPress)
    document.addEventListener('keydown', this.keyDown)
    document.addEventListener('keyup', this.keyUp)
  }
  destroy() {
    document.removeEventListener("keypress", this.keyPress)
    document.removeEventListener("keydown", this.keyDown)
    document.removeEventListener("keyup", this.keyUp)
    this.keyDownCallBacks = []
    this.keyPressCallBacks = []
    this.keyUpCallBacks = []
    this.keyUps = {}
    this.keyDowns = {}
    this.keyPresses = {}
  }
}

// 毎フレーム呼んでくれる
export class Updater {
  private maxIndex: number = -1;
  private updateList: (() => boolean)[] = [];
  private mRequestAnimationFrame: number;
  get registedNum(): number { return this.maxIndex }
  toGenerator(fun: () => boolean): () => IterableIterator<boolean> {
    return function* () { while (true) yield fun() }
  }
  regist(fun: () => boolean) {
    this.maxIndex++;
    if (this.maxIndex === this.updateList.length) this.updateList.push(fun);
    else this.updateList[this.maxIndex] = fun;
  }
  private applyUpdateList() {
    for (let i = 0; i < Math.min(this.maxIndex + 1, this.updateList.length); i++) {
      if (this.updateList[i]() === true) continue;
      this.updateList[i] = this.updateList[this.maxIndex];
      this.maxIndex--;
      i--;
    }
    requestAnimationFrame(this.applyUpdateList.bind(this));
  }
  // 正確な時間を測るのには不向き
  perFrame(step: number = 1, n: number = Infinity): Store<number> {
    let result = new Store<number>(0)
    let i = 0
    let j = 0
    this.regist(() => {
      if (i >= n) return false;
      if (i % step === 0) result.set(j)
      i++; j++;
      return true
    })
    return result;
  }
  destroy() {
    this.updateList = []
    cancelAnimationFrame(this.mRequestAnimationFrame)
  }
  constructor() {
    this.mRequestAnimationFrame = requestAnimationFrame(this.applyUpdateList.bind(this));
  }
}

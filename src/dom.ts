import { Color, LinearGradient } from "./color";
import * as CSS from "./style";

export interface Vec2 {
  x: number
  y: number
}
export interface Rect {
  top?: number
  bottom?: number
  left?: number
  right?: number
}
export interface BorderContentType {
  color?: Color,
  width?: number,
  radius?: number,
  style: "none" | "hidden" | "solid" | "double" | "groove" | "ridge" | "inset" | "outset" | "dashed" | "dotted"
}
export interface Border {
  top?: BorderContentType
  bottom?: BorderContentType
  left?: BorderContentType
  right?: BorderContentType
}
export type Event =
  "focus" | "blur" | "select" | "change" |
  "load" | "dragdrop" |
  "click" | "dblclick" |
  "keyup" | "keydown" | "keypress" |
  "mouseout" | "mouseover" | "mouseup" |
  "mousemove" | "mousedown" | "mouseup"
// 固定のサイズのBoxで全てを表現
export interface BoxOption {
  // そのコンテナ内部でfloatするときの位置(後続のDOMに影響を与えたい場合はnull)
  pos?: Vec2
  fit?: { x: "left" | "center" | "right", y: "top" | "center" | "bottom" }
  background?: Color | LinearGradient
  tag?: string    // 指定するとそれで要素を作成する
  width?: number  // null なら親と同じ
  height?: number // null なら親と同じ
  margin?: Rect | number
  padding?: Rect | number
  border?: Border | BorderContentType
  isButton?: boolean
  isScrollable?: boolean
}
export function iota(a: number, b: number = null, step: number = 1): number[] {
  if (b === null) {
    let result = new Array<number>(a);
    for (let i = 0; i < a; i++) result[i] = i
    return result
  }
  if (b <= a) return [];
  let n = (b - a) / step
  let result = new Array<number>(n)
  for (let i = a, j = 0; j < n; i += step, j++) result[j] = i
  return result
}
export class DOM {
  public readonly $dom: HTMLElement = null;
  public readonly $DOMId: number;
  public readonly $world: World;
  public readonly $parent: DOM; // 移ることがある？
  private static DOMMaxId: number = 0;
  public get id(): string { return this.$dom.id }
  constructor(parent: DOM | HTMLElement, tag: string = "div") {
    this.$dom = document.createElement(tag || "div");
    this.$DOMId = DOM.DOMMaxId++
    this.$dom.id = `ibuki-box-${this.$DOMId}`
    if (parent instanceof DOM) {
      parent.$dom.appendChild(this.$dom);
      this.$world = parent.$world;
      this.$parent = parent;
    } else if (this instanceof World) {
      parent.appendChild(this.$dom);
      this.$world = this;
      this.$parent = this;
    } else console.assert(false, "now root Box need to be World class")
  }
  on(name: Event, callback: () => void, bind = false): DOM {
    if (bind) this.$dom.addEventListener(name, callback.bind(this.$dom))
    else this.$dom.addEventListener(name, callback)
    return this
  }
  destroy() { this.$dom.remove(); }
  applyStyle(style: { [key: string]: any }): DOM {
    let normalized = CSS.parse(style);
    for (let key in normalized) {
      let val = normalized[key]
      this.$dom.style[key] = val;
    }
    return this;
  }
  setAttributes(attrs: { [key: string]: any }): DOM {
    for (let key in attrs) {
      let val = attrs[key]
      if (typeof val === "boolean") {
        if (val) this.$dom.setAttribute(key, "")
        else this.$dom.removeAttribute(key)
      } else if (val instanceof Array)
        this.$dom.setAttribute(key, val.join(" , "))
      else this.$dom.setAttribute(key, `${val}`)
    }
    return this
  }
  tree(func: (parent: DOM) => any) { func(this); }
}
export class Box extends DOM {
  public width: number = 0;
  public height: number = 0;
  protected $boxOption: BoxOption;
  constructor(parent: Box | HTMLElement, option: BoxOption = {}, attrs: { [key: string]: any } = {}) {
    super(parent, option.tag)
    if (parent instanceof Box) {
      option.width = option.width || parent.width;
      option.height = option.height || parent.height;
    }
    this.applyBoxOption(option);
    this.setAttributes(attrs);
  }
  applyBoxOption(option: BoxOption): Box {
    this.$boxOption = option;
    if (this.$parent instanceof Box) {
      this.width = option.width || this.width || this.$parent.width;
      this.height = option.height || this.height || this.$parent.height;
    } else {
      this.width = option.width || this.width;
      this.height = option.height || this.height;
    }
    let style: CSS.AnyStyle = { ...option };
    if (option.pos) {
      style.top = option.pos.y;
      style.left = option.pos.x;
      style.position = "relative";
      delete style.pos
    }
    if (option.fit) {
      style.position = "absolute"
      if (option.fit.x === "right") style.right = 0
      else if (option.fit.x === "center") {
        style["margin-left"] = style["margin-right"] = "auto";
        style.left = style.right = 0;
      }
      if (option.fit.y === "bottom") style["bottom"] = 0
      else if (option.fit.y === "center") {
        style["margin-bottom"] = style["margin-top"] = "auto";
        style.bottom = style.top = 0
      }
      delete style.fit
    }
    if (option.isButton) {
      this.on("mouseover", () => { this.$dom.style.cursor = "pointer" })
      this.on("mouseout", () => { this.$dom.style.cursor = "default" })
      delete style.isButton
    }
    if (style.isScrollable) {
      style.overflow = "scroll"
      delete style.isScrollable
    } else {
      style.overflow = "hidden"
    }
    if (style.height < 0) delete style.height
    if (style.width < 0) delete style.width
    this.applyStyle(style);
    return this;
  }
}
// 画面に自動でフィットするDOMの祖
export class World extends Box {
  alwaysFullScreen: boolean = false
  constructor(width: number = 1280, height: number = 720, alwaysFullScreen: boolean = false) {
    super(document.body, { width: width, height: height })
    this.alwaysFullScreen = alwaysFullScreen;
    this.initializeWorld()
    this.adjustWindow()
  }
  private initializeWorld() {
    CSS.Global.regist({
      body: { margin: 0, padding: 0, overflow: "hidden", background: "#000" },
      "*": { "box-sizing": "border-box" }
    });
    window.addEventListener("resize", () => this.adjustWindow())
  }
  private adjustWindow() {
    let pWidth = window.innerWidth;
    let wRatio = pWidth / this.width;
    let pHeight = window.innerHeight;
    let hRatio = pHeight / this.height;
    let ratio = Math.min(wRatio, hRatio);
    this.applyStyle({
      overflow: "hidden",
      position: "relative",
      background: "#ffffff",
      ... this.alwaysFullScreen ? {
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh"
      } : {
          top: Math.max(0, (pHeight - this.height * ratio) / 2),
          left: Math.max(0, (pWidth - this.width * ratio) / 2),
          width: this.width,
          height: this.height,
          ...CSS.transform({ scale: ratio, origin: "0px 0px" })
        },
    });
  }
}
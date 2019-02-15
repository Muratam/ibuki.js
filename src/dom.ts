import { Color } from "./color";
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

// 固定のサイズもしくはparent(%)に合わせたサイズになるべき
export interface DOMOption {
  // そのコンテナ内部でfloatするときの位置(後続のDOMに影響を与えたい場合はnull)
  pos?: Vec2
  tag?: string    // 指定するとそれで要素を作成する
  width?: number  // null なら親と同じ
  height?: number // null なら親と同じ
  margin?: Rect | number
  padding?: Rect | number
  border?: Border | BorderContentType
}
export class DOM {
  public readonly width: number = 0;
  public readonly height: number = 0;
  public readonly $dom: HTMLElement = null;
  protected $parent: DOM = null;
  protected $world: World = null;
  constructor(parent: DOM | HTMLElement, option: DOMOption = {}) {
    this.$dom = document.createElement(option.tag || "div");
    this.width = option.width
    this.height = option.height
    if (parent instanceof DOM) {
      parent.$dom.appendChild(this.$dom);
      this.$world = parent.$world;
      this.$parent = parent;
      this.width = this.width || parent.width;
      option.width = option.width || parent.width;
      this.height = this.height || parent.height;
      option.height = option.height || parent.height;
    } else parent.appendChild(this.$dom);
    this.applyDOMOption(option);
  }
  applyStyle(style: { [key: string]: any }): DOM {
    let normalized = CSS.parse(style);
    for (let key in normalized) {
      let val = normalized[key]
      this.$dom.style[key] = val;
    }
    return this;
  }
  private applyDOMOption(option: DOMOption): DOM {
    let style: CSS.AnyStyle = {
      width: option.width,
      height: option.height,
      margin: option.margin,
      padding: option.padding,
      border: option.border
    };
    if (option.pos) {
      style.top = option.pos.y;
      style.left = option.pos.x;
      style.position = "relative";
    }
    return this.applyStyle(style);
  }
}
// 画面に自動でフィットするDOMの祖
export class World extends DOM {
  constructor(width: number = 1280, height: number = 720) {
    super(document.body, { width: width, height: height })
    this.initializeWorld()
    this.adjustWindow()
  }
  private initializeWorld() {
    this.$world = this;
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
      top: Math.max(0, (pHeight - this.height * ratio) / 2),
      left: Math.max(0, (pWidth - this.width * ratio) / 2),
      width: this.width,
      height: this.height,
      ...CSS.transform({ scale: ratio, origin: "0px 0px" })
    });
  }
}

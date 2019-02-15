import { Color, LinearGradient } from "./color";
import * as CSS from "./style";

// export class SourceURL {
//   readonly url: string
//   constructor(url: string) { this.url = url; }
//   toCSS(): string { return `url("${this.url}")` }
// }
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

// 固定のサイズのBoxで全て表現
export interface BoxOption {
  // そのコンテナ内部でfloatするときの位置(後続のDOMに影響を与えたい場合はnull)
  pos?: Vec2
  background?: Color | LinearGradient | SourceURL
  tag?: string    // 指定するとそれで要素を作成する
  width?: number  // null なら親と同じ
  height?: number // null なら親と同じ
  margin?: Rect | number
  padding?: Rect | number
  border?: Border | BorderContentType
  overflow?: "hidden" | "scroll"
}
export class Box {
  public readonly width: number = 0;
  public readonly height: number = 0;
  public readonly $dom: HTMLElement = null;
  protected $parent: Box = null;
  protected $world: World = null;
  constructor(parent: Box | HTMLElement, option: BoxOption = {}) {
    this.$dom = document.createElement(option.tag || "div");
    this.width = option.width
    this.height = option.height
    if (parent instanceof Box) {
      parent.$dom.appendChild(this.$dom);
      this.$world = parent.$world;
      this.$parent = parent;
      this.width = this.width || parent.width;
      option.width = option.width || parent.width;
      this.height = this.height || parent.height;
      option.height = option.height || parent.height;
    } else parent.appendChild(this.$dom);
    this.applyBoxOption(option);
  }
  applyStyle(style: { [key: string]: any }): Box {
    let normalized = CSS.parse(style);
    console.log(normalized);
    for (let key in normalized) {
      let val = normalized[key]
      this.$dom.style[key] = val;
    }
    return this;
  }
  private applyBoxOption(option: BoxOption): Box {
    let style: CSS.AnyStyle = { ...option };
    if (option.pos) {
      style.top = option.pos.y;
      style.left = option.pos.x;
      style.position = "relative";
    }
    // if (!style.oveflow) style.overflow = "hidden"
    return this.applyStyle(style);
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

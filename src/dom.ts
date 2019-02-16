import { Color, LinearGradient } from "./color";
import * as CSS from "./style";
import { MayRoot } from "./root";

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
export type TextAlignType = "left" | "right" | "center" | "justify" | "justify-all" | "match-parent"
export type TagSeed = string | ((p: DOM) => DOM) // そのタグで作成するか関数適用
// 固定のサイズのBoxで全てを表現
export interface DOMOption {
  // そのコンテナ内部でfloatするときの位置(後続のDOMに影響を与えたい場合はnull)
  tag?: string
  fontSize?: number
  background?: Color | LinearGradient
  margin?: Rect | number
  padding?: Rect | number
  border?: Border | BorderContentType
  textAlign?: TextAlignType
  isButton?: boolean
}
export interface BoxOption extends DOMOption {
  pos?: Vec2
  fit?: { x: "left" | "center" | "right", y: "top" | "center" | "bottom" }
  draggable?: boolean // ドラッグできるか？
  width?: number  // null なら親と同じ
  height?: number // null なら親と同じ
  scale?: number  // | Vec2
  isScrollable?: boolean
}
export interface ContainerOption extends BoxOption { }
export class DOM {
  public readonly $dom: HTMLElement = null;
  public readonly $DOMId: number;
  public readonly $world: World;
  public readonly $parent: DOM; // 移ることがある？
  private $children: DOM[] = [];
  private $destroyed: boolean = false;
  public get destroyed(): boolean { return this.$destroyed; }
  public get children() { return this.$children; }
  private static DOMMaxId: number = 0;
  public get id(): string { return this.$dom.id }
  constructor(parent: DOM | HTMLElement, option: string | DOMOption = "") {
    this.$dom = document.createElement(
      (typeof option === "string" ? option : option.tag) || "div");
    this.$DOMId = DOM.DOMMaxId++
    this.$dom.id = `ibuki-box-${this.$DOMId}`
    if (parent instanceof DOM) {
      parent.$dom.appendChild(this.$dom);
      this.$world = parent.$world;
      this.$parent = parent;
      parent.$children.push(this)
    } else if (this instanceof World) {
      parent.appendChild(this.$dom);
      this.$world = this;
      this.$parent = this;
    } else console.assert(false, "now root Box need to be WorldBox class")
    if (typeof option !== "string") this.applyStyle(this.parseDOMOption(option))
  }
  bloom(seed: TagSeed): DOM {
    if (typeof seed === "string") return new DOM(this, seed)
    return seed(this)
  }
  on(name: Event, callback: () => void, bind = false): DOM {
    if (bind) this.$dom.addEventListener(name, callback.bind(this.$dom))
    else this.$dom.addEventListener(name, callback)
    return this
  }
  destroy() {
    this.$dom.remove();
    this.$destroyed = true;
  }
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
  parseDOMOption(option: DOMOption): CSS.AnyStyle {
    let style: CSS.AnyStyle = { ...option };
    if (option.isButton) {
      this.on("mouseover", () => { this.$dom.style.cursor = "pointer" })
      this.on("mouseout", () => { this.$dom.style.cursor = "default" })
      delete style.isButton
    }
    delete style.tag
    return style
  }
  parseBoxOption(parent: Container | HTMLElement, option: BoxOption): CSS.AnyStyle {
    let result: CSS.AnyStyle = { ...option }
    let parentWidth = parent instanceof Container ? parent.width : parent.scrollWidth
    let parentHeight = parent instanceof Container ? parent.height : parent.scrollHeight
    let parentScale = parent instanceof Container ? parent.scale : 1.0
    result.width = result.width || parentWidth
    result.height = result.height || parentHeight
    let scale = (result.scale || 1.0) * parentScale
    result.position = "absolute";
    result.top = 0
    result.left = 0
    if (option.pos) {
      result.top = option.pos.y;
      result.left = option.pos.x;
      delete result.pos
    }
    if (option.fit) {
      if (option.fit.x === "right") {
        result.left = parentWidth - result.width * scale
      } else if (option.fit.x === "center") {
        result.left = parentWidth / 2 - result.width * scale / 2
      }
      if (option.fit.y === "bottom") {
        result.top = parentHeight - result.height * scale
      } else if (option.fit.y === "center") {
        result.top = parentHeight / 2 - result.height * scale / 2
      }
      delete result.fit
    }
    if (result.isScrollable) {
      result.overflow = "scroll"
      delete result.isScrollable
    } else result.overflow = "hidden"
    if (result.scale) {
      result = {
        ...result,
        ...CSS.transform({ scale: scale, origin: "0px 0px" })
      }
    } else { result.scale = scale }
    return result;
  }
}
// 固定のwidth / height を持つもの
// 指定しなければ親と同じになる
export class Box extends DOM {
  private $width: number = 0;
  private $height: number = 0;
  private $left: number = 0;
  private $top: number = 0;
  private $scale: number = 1;
  constructor(parent: Container | HTMLElement, option: BoxOption = {}) {
    super(parent, option)
    let style = this.parseBoxOption(parent, option)
    this.applyStyle(style)
    this.$width = style.width
    this.$height = style.height
    this.$left = style.left
    this.$top = style.top
    this.$scale = style.scale
    if (option.draggable) {
      // WARN: いっぱい登録すると重そう / タッチ未対応
      let x = 0;
      let y = 0;
      let dragState = 0
      function dragStart(e: MouseEvent) {
        // x = e.pageX - this.offsetLeft;
        // y = e.pageY - this.offsetTop;

        dragState++
      }
      let dragging = (e: MouseEvent) => {
        if (dragState === 0) return;
        console.log([e.pageX, e.pageY])
        this.left = e.pageX - x;
        this.top = e.pageY - y;
      }
      function dragEnd(e: MouseEvent) {
        dragState = 0;
      }
      this.$dom.addEventListener("mousedown", dragStart)
      // this.$dom.addEventListener("touchstart", dragStart)
      document.body.addEventListener("mousemove", dragging)
      // document.body.addEventListener("touchmove", dragging)
      this.$dom.addEventListener("mouseup", dragEnd)
      // this.$dom.addEventListener("touchend", dragEnd)
      document.body.addEventListener("mouseleave", dragEnd)
      // document.body.addEventListener("touchleave", dragEnd)
    }
  }
  get top(): number { return this.$top }
  set top(val: number) {
    this.$top = val;
    this.applyStyle({ top: val })
  }
  get left(): number { return this.$left }
  set left(val: number) {
    this.$left = val;
    this.applyStyle({ left: val })
  }
  get width(): number { return this.$width }
  set width(val: number) {
    this.$width = val;
    this.applyStyle({ width: val })
  }
  get height(): number { return this.$height }
  set height(val: number) {
    this.$height = val;
    this.applyStyle({ height: val })
  }
  get scale(): number { return this.$scale }
  set scale(val: number) {
    this.$scale = val;
    this.applyStyle(CSS.transform({ scale: val, origin: "0px 0px" }))
  }
  // tree(func: (parent: Box) => any): Box { func(this); return this; }
}
// HTMLElement
// DOMを子として持てる
export class Container extends Box {
  constructor(parent: Container | HTMLElement, option: ContainerOption = {}) {
    super(parent, option)
  }
  tree(func: (parent: Container) => any): Container { func(this); return this; }
}
// 画面に自動でフィットするDOMの祖
export class World extends Container {
  alwaysFullScreen: boolean = false
  constructor(width: number = 1280, height: number = 720, alwaysFullScreen: boolean = false) {
    super(document.body, { width: width, height: height })
    this.alwaysFullScreen = alwaysFullScreen;
    this.initializeWorld()
    this.adjustWindow()
  }
  private initializeWorld() {
    let inheritFontSize = { fontFamily: "inherit", fontSize: "100%" }
    CSS.Global.regist({
      body: { margin: 0, padding: 0, overflow: "hidden", background: "#000" },
      "*": { "box-sizing": "border-box" },
      textarea: inheritFontSize,
      input: inheritFontSize,
      select: inheritFontSize,
      button: inheritFontSize,
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
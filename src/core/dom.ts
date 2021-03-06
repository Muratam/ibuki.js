import { Color, Colors, ColorScheme } from "./color";
import * as CSS from "./style";
import { Store, MayStore, HasValue, toStore } from "./store";
import { Updater, KeyBoard, GlobalCSS, KeysType } from "./static"
// types and interfaces
export type BorderStyle = "none" | "hidden" | "solid" | "double" | "groove" | "ridge" | "inset" | "outset" | "dashed" | "dotted"
export interface BorderContentType {
  color?: Color,
  width?: number,
  radius?: number,
  style: BorderStyle
}
export interface Border {
  top?: BorderContentType
  bottom?: BorderContentType
  left?: BorderContentType
  right?: BorderContentType
}
export type Event =
  "focus" | "blur" | "select" | "change" | "load" | "dragdrop" | "click" | "dblclick" |
  "keyup" | "keydown" | "keypress" | "keyupall" | "keydownall" | "keypressall" |
  "mouseout" | "mouseover" | "mouseup" | "mousemove" | "mousedown" | "mouseup"
export interface Vec2 { x: number, y: number }
export interface Rect {
  top?: number,
  bottom?: number
  left?: number
  right?: number
}
export type TextAlignType = "left" | "right" | "center" | "justify" | "justify-all" | "match-parent"
export type FitType = { x?: "left" | "center" | "right", y?: "top" | "center" | "bottom" }
export type TextSeed = MayStore<string> | ((p: DOM) => DOM) // そのtextで作成するか関数適応
export type TimingFunction = "ease" | "linear" | "ease-in" | "ease-out" | "ease-in-out"
export interface DOMOption {
  // そのコンテナ内部でfloatするときの位置(後続のDOMに影響を与えたい場合はnull)
  tag?: string
  class?: string[] | string// WARN: classによるアニメーションは意図したものではないので,construct時のみしか適用されない
  colorScheme?: Colors
  margin?: Rect | number
  padding?: Rect | number
  border?: Border | BorderContentType
  fontSize?: number
  fontFamily?: string
  borderRadius?: number
  textAlign?: TextAlignType
  filter?: CSS.Filter
  zIndex?: number | "auto"
  isScrollable?: boolean
}
export interface TextOption extends DOMOption {
  color?: Color | string
  isBold?: boolean
  href?: MayStore<string>,
  tag?: "span" | "code" | "pre" | "marquee" | "div"
  edge?: { color: Color, width: number }
}
export interface FitWidthDOMOption extends DOMOption { dontFitWidth?: boolean }
export interface BoxOption extends DOMOption {
  x?: number
  y?: number
  fit?: FitType
  isXYLeftTop?: boolean
  width?: number  // null なら親と同じ
  height?: number // null なら親と同じ
  rotate?: number
  scale?: number  // | Vec2
  state?: string
}
// implements
// 一番の基本要素,各々がちょうど一つのdomに対応する.
export class IBukiMinElement {
  $$scene: Scene | undefined;
  public get $scene(): Scene {
    let a: any = {};
    return this.$$scene ? this.$$scene : a;
  }
  protected $createdFrame = 0
  public get createdFrame(): number { return this.$createdFrame }
  public get frame(): number { return this.$scene ? this.$scene.$createdFrame - this.$createdFrame : 0; }
  constructor() { }
  public update(fun: (this: this, milliSec: number) => boolean | void | number): this {
    let f = fun.bind(this);
    let start = Date.now();
    if (!this.$scene) return this;
    if (!this.$scene.$updater) return this;
    this.$scene.$updater.regist(() => {
      let now = Date.now()
      let result = f(now - start);
      if (typeof result === "boolean") return result;
      return true
    })
    return this
  }
  public perFrame(step: number = 1, n: number = Infinity): Store<number> {
    return this.$scene.$updater.perFrame(step, n)
  }
}
export class DOM extends IBukiMinElement {
  public readonly $dom: HTMLElement;
  public readonly $DOMId: number;
  private $$parent: DOM | undefined = undefined; // 移ることは無いと仮定
  public get $parent(): DOM {
    return this.$$parent ? this.$$parent : this;
  }
  public set $parent(value: DOM) {
    this.$$parent = value;
  }
  private $children: DOM[] = [];
  public get children() { return this.$children; }
  private static DOMMaxId: number = 0;
  public get id(): string { return this.$dom.id }
  constructor(parent?: DOM, option: string | DOMOption = "") {
    super()
    this.$dom = document.createElement(
      (typeof option === "string" ? option : option.tag) || "div");
    this.$DOMId = DOM.DOMMaxId++
    this.$dom.id = `ibuki-box-${this.$DOMId}`
    if (parent !== undefined) {
      parent.$dom.appendChild(this.$dom);
      this.$$parent = parent;
      parent.$children.push(this)
      if (parent.$scene) {
        this.$$scene = parent.$scene;
        this.$createdFrame = this.$scene.$createdFrame;
      }
    }
    if (typeof option !== "string") {
      if (option.class) {
        if (typeof option.class === "string") this.$dom.classList.add(option.class)
        else for (let c of option.class) if (c) this.$dom.classList.add(c)
      }
      this.applyStyle(this.parseDOMOption(option))
    }
  }
  bloom(seed: TextSeed): DOM {
    if (typeof seed === "string") return new Text(this, seed)
    if (seed instanceof Store) return new Text(this, seed)
    return seed(this)
  }
  on(name: Event, callback: (this: this, key?: KeysType) => void): this {
    let c = callback.bind(this)
    if (name === "keydownall") this.$scene.$keyboard.onKeyDown(c)
    else if (name === "keyupall") this.$scene.$keyboard.onKeyUp(c)
    else if (name === "keypressall") this.$scene.$keyboard.onKeyPress(c)
    // WARN: ↑と違って毎フレームに一回呼ばれるわけではない(し、メインスレッドでもない)！同時に押されてもダメかも.
    else if (name === "keydown" || name === "keypress" || name === "keyup") this.$dom.addEventListener(name, e => {
      let key: KeysType = {}
      key[e.key] = true
      c(key)
    })
    else this.$dom.addEventListener(name, e => { c() })
    return this;
  }
  applyStyle(style: { [key: string]: any }): this {
    let normalized = CSS.parse(style);
    for (let key in normalized) {
      let key2: any = key
      this.$dom.style[key2] = normalized[key];
    }
    return this;
  }
  tree(func: (parent: this) => any): this { func(this); return this; }
  setAttributes(attrs: { [key: string]: any }): this {
    for (let key in attrs) {
      let val = attrs[key]
      if (typeof val === "boolean") {
        if (val) this.$dom.setAttribute(key, "")
        else this.$dom.removeAttribute(key)
      } else if (val instanceof Array) {
        this.$dom.setAttribute(key, val.join(" , "))
      } else if (typeof val === "string") {
        this.$dom.setAttribute(key, `${val}`)
        if (val === "color") console.warn("↑↑↑↑this is input[type=color] warning...fuck!!!")
      }
    }
    return this
  }
  parseDOMOption(option: DOMOption): CSS.Style<any> {
    let style: CSS.Style<any> = { ...option };
    if (style.colorScheme) {
      let colorScheme = new ColorScheme(option.colorScheme)
      style.backgroundColor = colorScheme.baseColor
      style.color = colorScheme.mainColor
      style.borderColor = colorScheme.accentColor
      delete style.colorScheme
    }
    if (style.isScrollable) {
      style.overflow = "scroll"
      delete style.isScrollable
    } else if (style.isScrollable === false) {
      style.overflow = "hidden"
      delete style.isScrollable
    }
    delete style.class
    delete style.tag
    return style
  }
}
export class Text extends DOM implements HasValue<string> {
  private $text: string = "";
  get value(): string { return this.$text; }
  set value(val: string) {
    this.$text = val.replace(" ", '\u00a0');
    this.$dom.innerText = this.$text;
  }
  // text には改行をいれたStoreを含めないこと(DOMGCが増えてパフォーマンスがかなり落ちる)
  constructor(parent: DOM, text: MayStore<string>, option: TextOption = {}) {
    super(parent, (() => {
      let a: any = { ...option, tag: option.href ? "a" : "span" }
      return a;
    })())
    Store.regist(text, t => this.value = t)
    if (option.href) Store.regist(option.href, t => this.$dom.setAttribute("href", t))
    this.applyStyle({
      color: typeof option.color === "string" ? Color.parse(option.color) : option.color,
      font: { weight: option.isBold && "bold" },
      ...(!option.edge ? {} : { "-webkit-text-stroke": option.edge })
    })
  }
  static assign(parent: DOM, may: TextSeed, func: ((t: string) => any)) {
    if (typeof may === "function") may(parent)
    else Store.regist(may, func)
  }
}
// 文字が右向きに流れるせいでWidthにのみFitするDOMという概念ができる.
export class FitWidthDOM<T extends HTMLElement = HTMLElement> extends DOM {
  public get $$dom(): T {
    let a: any = this.$dom;
    let b: T = a;
    return b;
  }
  fitWidth() { if (this.$parent instanceof Box) this.$dom.style.width = this.$parent.contentWidth + "px" }
  constructor(parent: DOM, option: FitWidthDOMOption = {}) {
    super(parent, option)
    if (!option.dontFitWidth) this.fitWidth()
  }
}
// 固定のwidth / height を持つもの
// 指定しなければ親と同じになる
// PIXI.js と座標系を同じにしたい.
export interface Transform {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  scale?: number;
  rotate?: number;
}
export interface Transition {
  duration?: number,
  timingFunction?: TimingFunction,
  delay?: number
}

function fillTransition(base?: Transition): Required<Transition> {
  return {
    ...{
      duration: 0.5,
      timingFunction: "ease",
      delay: 0
    }, ...(base === undefined ? {} : base),
  }
}
export class Box<T extends HTMLElement = HTMLElement> extends DOM implements Transform {
  private needUpdate = false
  private $width: number = 0;
  public get width(): number { return this.$width }
  public set width(val: number) { this.$width = val; this.needUpdate = true; }
  private $height: number = 0;
  public get height(): number { return this.$height }
  public set height(val: number) { this.$height = val; this.needUpdate = true; }
  private $x: number = 0;
  public get x(): number { return this.$x }
  public set x(val: number) { this.$x = val; this.needUpdate = true; }
  private $y: number = 0;
  public get y(): number { return this.$y }
  public set y(val: number) { this.$y = val; this.needUpdate = true; }
  private $scale: number = 1;
  public get scale(): number { return this.$scale }
  public set scale(val: number) { this.$scale = val; this.needUpdate = true; }
  private $rotate: number = 0;
  public get rotate(): number { return this.$rotate }
  public set rotate(val: number) { this.$rotate = val; this.needUpdate = true; }
  private $colorScheme?: ColorScheme;
  public get colorScheme(): ColorScheme {
    let a: any = this.$colorScheme;
    return a;
    // if (this.$colorScheme !== undefined) return this.$colorScheme
    // if (!this.$parent) return new ColorScheme()
    // return this.$parentBox.colorScheme
  }
  public set colorScheme(val: ColorScheme) { this.$colorScheme = val; this.needUpdate = true; }
  private $filter?: CSS.Filter;
  public get filter(): CSS.Filter {
    let a: any = this.$filter;
    return a;
    // if (this.$filter !== undefined) return this.$filter
    // if (!this.$parent) return new CSS.Filter({})
    // return this.$parentBox.filter
  }
  public set filter(val: CSS.Filter) { this.$filter = val; this.needUpdate = true; }
  private $zIndex?: number
  public get zIndex(): number {
    let a: any = this.$zIndex;
    return a;
    // if (this.$zIndex !== undefined) return this.$zIndex
    // if (!this.$parent) return 0
    // return this.$parentBox.zIndex
  }
  public set zIndex(val: number) { this.$zIndex = val; this.needUpdate = true; }

  private keys = ["x", "y", "scale", "width", "height", "rotate", "colorScheme", "filter", "zIndex"]

  public get contentWidth(): number {
    let a = this.$dom.style.borderRightWidth || "0";
    let b = this.$dom.style.paddingRight || "0";
    return this.width - Box.pickNum(a) * 2 - Box.pickNum(b) * 2
  }
  public get contentHeight(): number {
    let a = this.$dom.style.borderBottomWidth || "0";
    let b = this.$dom.style.paddingBottom || "0";
    return this.height - Box.pickNum(a) * 2 - Box.pickNum(b) * 2
  }
  public get $$dom(): T {
    let a: any = this.$dom;
    let b: T = a;
    return b;
  }

  private readonly $$parentBox: Box;
  public get $parentBox(): Box { return this.$$parentBox ? this.$$parentBox : this; }
  constructor(parent?: Box, option: BoxOption = {}) {
    super(parent, Box.deleteTransformKeys({ ...option }))
    // 全ての transform 値を number に保証
    if (parent !== undefined) {
      this.width = parent.contentWidth
      this.height = parent.contentHeight
      this.$$parentBox = parent;
    } else {
      this.width = option.width || 0
      this.height = option.height || 0
      this.$$parentBox = this;
    }
    this.applyOption(option)
    if (this.$scene) this.update(() => {
      if (!this.needUpdate) return
      this.applyOption({})
      this.needUpdate = false;
    })
  }
  // option を読み込み,自身に(上書きができれば)適応
  // transition もするが,複数のtransitionを行うと不整合になる可能性がある.
  public applyOption(option: BoxOption, transition?: Transition): this {
    let style = this.parseBoxOption(option)
    this.setValues(style)
    style = { ...style, ...this.parseBoxOption(this.getValues()) } // percent適応値で上書き
    Box.deleteTransformKeys(style) // transform にて変換したので(二重になるし)削除
    this.applyStyle(style)
    if (transition) {
      let { duration, timingFunction, delay } = fillTransition(transition)
      let transitions: string[] = []
      for (let key in style)
        transitions.push(`${key} ${duration}s ${timingFunction} ${delay}s `)
      this.$dom.style.transition = transitions.join(",")
    }
    return this
  }

  private parseBoxOption(option: BoxOption): CSS.Style<any> {
    let result: CSS.Style<any> = { ...option }
    result.position = "absolute"
    result["transform-origin"] = `center center`
    if (result.x === undefined) result.x = this.x
    if (result.y === undefined) result.y = this.y
    if (result.width === undefined) result.width = typeof this.width !== undefined ? this.width : this.$parentBox.contentWidth
    if (result.height === undefined) result.height = typeof this.height !== undefined ? this.height : this.$parentBox.contentHeight
    if (result.scale === undefined) result.scale = this.scale
    if (result.rotate === undefined) result.rotate = this.rotate
    console.assert(result.width !== undefined && result.width !== null, "illegal width")
    console.assert(result.height !== undefined && result.height !== null, "illegal height")
    if (option.fit) {
      // console.assert(this.$parent, "fit option but no parent")
      // ひとまずtransform-originは `center center` . ただし,位置はleft top が 0 0
      // 倍率が1倍のときにジャストフィットするような位置
      if (option.fit.x === "right") {
        result.x = this.$parentBox.contentWidth - result.width / 2
      } else if (option.fit.x === "center") {
        result.x = this.$parentBox.contentWidth / 2
      } else {
        result.x = result.width / 2;
      }
      if (option.fit.y === "bottom") {
        result.y = this.$parentBox.contentHeight - result.height / 2
      } else if (option.fit.y === "center") {
        result.y = this.$parentBox.contentHeight / 2;
      } else {
        result.y = result.height / 2
      }
      delete result.fit
    } else if (option.isXYLeftTop) {
      result.x += result.width / 2
      result.y += result.height / 2
      delete result.isXYLeftTop
    }
    result.transform = new CSS.TransformCSS(result.x - result.width / 2, result.y - result.height / 2, result.scale, result.rotate)
    return this.parseDOMOption(result);
  }
  private static pickNum(s: string): number {
    let result = 0
    for (let c of s) {
      if ("0" <= c && c <= "9") result = result * 10 + (+c)
    }
    return result
  }

  private percentages: CSS.Style<any> = {}
  private setPercentages(style: BoxOption) {
    this.percentages = {}
    let apply = (key: string) => {
      let style2: any = style;
      let that = style2[key];
      if (that !== undefined || that !== null || typeof that !== "string") {
        this.percentages[key] = that
      }
    }
    for (let key of this.keys) apply(key)
  }
  private setValues(style: CSS.Style<any>) {
    let apply = (key: "width" | "height" | "scale" | "x" | "y" | "rotate", init: number) => {
      if (typeof style[key] === "number") {
        this[key] = style[key];
      } else {
        this[key] = this[key] || init
      }
    }
    if (this.$parent !== null) {
      apply("width", this.$parentBox.width)
      apply("height", this.$parentBox.height)
    }
    apply("scale", 1.0)
    apply("rotate", 0.0)
    apply("y", 0)
    apply("x", 0)
    if (style.colorScheme) this.colorScheme = new ColorScheme(style.colorScheme)
    if (style.filter) this.filter = style.filter
    if (style.zIndex) this.zIndex = style.zIndex
    if (style.state) this.state = style.state
  }
  private getValues(): BoxOption {
    let result: BoxOption = {}
    let set = (key: "width" | "height" | "scale" | "x" | "y" | "rotate" | "colorScheme" | "filter") => {
      if (this[key] === undefined) return
      if (key === "x" || key === "y" || key === "rotate") {
        result[key] = this[key] +
          (this.percentages[key] === undefined ? 0 : this.percentages[key])
      } else if (key === "colorScheme") {
        result[key] = this[key]// TODO:
      } else if (key === "filter") {
        result[key] = this[key] // TODO:
      } else result[key] = this[key] *
        (this.percentages[key] === undefined ? 1 : this.percentages[key])
    }
    for (let key of this.keys) {
      if (key === "width" || key === "height" || key === "scale" || key === "x" || key === "y" || key === "rotate" || key === "colorScheme" || key === "filter") set(key)
    }
    return result
  }

  private static deleteTransformKeys(style: CSS.Style<any>): CSS.Style<any> {
    // width と height は適応してもらう
    delete style.x
    delete style.y
    delete style.scale
    delete style.rotate
    return style
  }
  onDrag(fun: (this: this, x: number, y: number) => any): this {
    let dragStartMyX = 0
    let dragStartMyY = 0
    let dragStartMouseX = 0;
    let dragStartMouseY = 0;
    let dragState = 0
    let dragStart = () => {
      dragStartMyX = this.x
      dragStartMyY = this.y
      dragStartMouseX = this.$scene.mouseX
      dragStartMouseY = this.$scene.mouseY
      dragState++
      this.applyStyle({ userSelect: "none" })
    }
    let dragging = () => {
      if (dragState === 0) return;
      fun.bind(this)(dragStartMyX + this.$scene.mouseX - dragStartMouseX, dragStartMyY + this.$scene.mouseY - dragStartMouseY)
    }
    let dragEnd = () => {
      dragState = 0;
      this.applyStyle({ userSelect: "auto" })
    }
    this.on("mouseover", () => { this.$dom.style.cursor = "pointer" })
    this.on("mouseout", () => { this.$dom.style.cursor = "default" })
    this.$dom.addEventListener("mousedown", dragStart)
    this.$dom.addEventListener("touchstart", dragStart)
    document.body.addEventListener("mousemove", dragging)
    document.body.addEventListener("touchmove", dragging)
    this.$dom.addEventListener("mouseup", dragEnd)
    this.$dom.addEventListener("touchend", dragEnd)
    document.body.addEventListener("mouseleave", dragEnd)
    document.body.addEventListener("touchleave", dragEnd)
    return this
  }

  public state = ""
  private callBacks: { [key: number]: () => any } = {}
  private transitionMaxId = 0
  // すぐに値を変更する(with transition)
  // transform : translate scale rotate を独立に変更することはできない.
  // すなわち,今のtransitionを破壊的に変更するか,終了を待ってtransitionするか,しかない
  to(option: BoxOption, transition?: Transition, startId?: number): this {
    // 構築された最初のフレームでも大丈夫なのと, next()を呼べる
    if (this.frame === 0) {
      this.$scene.reserveExecuteNextFrame(() => { this.to(option, transition) })
      return this
    }
    this.applyOption(option, transition)
    let id: number;
    if (startId === undefined) {
      this.transitionMaxId++;
      id = this.transitionMaxId;
    } else
      id = startId;
    let { duration } = fillTransition(transition)
    this.update(milliSec => {
      if (milliSec / 1000.0 < duration) return true
      if (!this.callBacks[id]) return false
      this.callBacks[id]()
      delete this.callBacks[id]
    })
    return this
  }
  // 最後に登録した to / next が 終わってから発火する
  next(option: BoxOption, transitionOrFunc?: Transition | ((this: this) => any)): this {
    // 構築された最初のフレームでは無効なので
    if (this.frame === 0) {
      this.$scene.reserveExecuteNextFrame(() => { this.next(option, transitionOrFunc) })
      return this
    }
    this.transitionMaxId++;
    let id = this.transitionMaxId
    console.assert(!this.callBacks[id - 1], "illegal transition maxid")
    this.callBacks[id - 1] = () => {
      if (typeof transitionOrFunc === "function") {
        this.to(option, { duration: 0.001 }, id)
        transitionOrFunc.bind(this)()
      } else {
        this.to(option, transitionOrFunc, id)
      }
    }
    return this
  }
  // 複数の toRelativeを適応すると既存設定値も消される.
  toRelative(option: BoxOption, transition?: Transition): this {
    this.setPercentages(option)
    this.to({}, transition)
    return this;
  }
  private stopped: { [key: number]: boolean } = {}
  endRepeat(id: number): this { this.stopped[id] = true; return this; }
  restartRepeat(id: number): this {
    console.assert(this.stopped[id] !== undefined, "illegal resume animation")
    this.stopped[id] = false
    return this;
  }
  private playMaxId = 0
  repeatRelative(destination: BoxOption | BoxOption[], insertBaseState = true, transition?: Transition, iterationCount = Infinity, allowEndDstState = false, state: string = ""): number {
    // percentage
    let dst: BoxOption[] = destination instanceof Array ? destination : [destination];
    let { duration } = fillTransition(transition)
    let per = Math.floor(duration * 60) || 1
    let lv = 1
    let itcnt = 0;
    let id = this.playMaxId
    this.playMaxId++
    let i = 0
    this.update(() => {
      if (this.stopped[id]) {
        if (allowEndDstState || lv === 0) {
          i = 0;
          return;
        }
      }
      if (i === 0 && state && state === this.state) return
      if (i % per !== 0) {
        i++;
        return;
      }
      i++;
      lv = (lv + 1) % (1 + dst.length)
      if (lv === 0 && !insertBaseState) lv = 1;
      this.toRelative(lv === 0 ? {} : dst[lv - 1], transition)
      itcnt++;
      if (itcnt === iterationCount) {
        itcnt = 0
        i = 0
        this.endRepeat(id)
        return
      }
    })
    return id
  }
  // ある状態のときだけとかできるように
  repeatRelativeOnHover(destination: BoxOption | BoxOption[], insertBaseState = true, transition?: Transition, iterationCount = Infinity, state: string = ""): this {
    let id: number | null = null;
    this.on("mouseover", () => {
      if (state && this.state !== state) return
      this.$dom.style.cursor = "pointer"
      if (id !== null) this.restartRepeat(id)
      else id = this.repeatRelative(destination, insertBaseState, transition, iterationCount)
    })
    this.on("mouseout", () => {
      this.$dom.style.cursor = "default"
      this.endRepeat(id || 0)
    })
    return this
  }
  toRelativeOnHover(option: BoxOption, transition?: Transition, state: string = ""): this {
    this.on("mouseover", () => {
      if (state && this.state !== state) return
      this.$dom.style.cursor = "pointer"
      this.toRelative(option, transition)
    })
    this.on("mouseout", () => {
      this.$dom.style.cursor = "default"
      this.toRelative({}, transition)
    })
    return this
  }
  hidden(): this {
    this.to({ filter: new CSS.Filter({ opacity: 0 }) })
    return this
  }
  appear(transition?: Transition): this {
    transition = fillTransition(transition)
    this.to({ filter: new CSS.Filter({ opacity: 1 }) }, transition)
    return this
  }
  disappear(transition?: Transition): this {
    transition = fillTransition(transition)
    this.to({ filter: new CSS.Filter({ opacity: 0 }) }, transition)
    return this
  }
  appearMouseHover(box: Box, transition?: Transition): this {
    transition = fillTransition(transition)
    this.on("mouseover", () => { box.appear() })
    this.on("mouseout", () => { box.disappear() })
    return this
  }
}
// 0,0 を本当に 0,0 にすると使いにくいことが多いので
export class FitBox<T extends HTMLElement = HTMLElement> extends Box<T> {
  constructor(parent: Box, option: BoxOption = {}) {
    super(parent, { fit: { x: "left", y: "top" }, ...option })
  }
}

export class Scene extends FitBox {
  public readonly $updater: Updater;
  public readonly $keyboard: KeyBoard;
  public readonly $css: GlobalCSS;
  public readonly $parent: World
  private $mouseX: number = 0
  public get mouseX(): number { return this.$mouseX }
  private $mouseY: number = 0
  public get mouseY(): number { return this.$mouseY }
  private reservedExecuteNextFrames: (() => any)[] = []
  reserveExecuteNextFrame(fun: () => any) {
    this.reservedExecuteNextFrames.push(fun)
  }
  trackMouse(e: MouseEvent) {
    let ratio = Math.min(
      window.innerWidth / this.width,
      window.innerHeight / this.height);
    this.$mouseX = e.pageX / ratio
    this.$mouseY = e.pageY / ratio
  }
  constructor(parent: World) {
    super(parent)
    this.$parent = parent
    this.$updater = new Updater();
    this.$keyboard = new KeyBoard(this.$updater)
    this.$css = new GlobalCSS();
    this.$$scene = this
    this.$mouseX = 0
    this.$createdFrame = 0;
    this.$updater.regist(() => {
      this.$createdFrame++;
      for (let r of this.reservedExecuteNextFrames) r()
      this.reservedExecuteNextFrames = []
      return true;
    })
    document.body.addEventListener("mousemove", this.trackMouse.bind(this))
    //document.body.addEventListener("touchmove", this.trackMouse.bind(this))
  }
  destroy() {
    this.$dom.remove();
    this.$updater.destroy();
    this.$css.destroy();
    this.$keyboard.destroy();
    document.body.removeEventListener("mousemove", this.trackMouse, false)
    //document.body.removeEventListener("touchmove", this.trackMouse, false)
  }
  gotoNextScene(seed: (scene: Scene) => any) {
    this.destroy()
    this.$parent.play(seed)
  }
}

// 画面に自動でフィットするDOM/Sceneの全ての祖
export class World extends Box {
  constructor(width: number = 1280, height: number = 720) {
    // null　なので 必要最低限が全て有るように設定
    super(undefined, {
      x: 0, y: 0, scale: 1, width: width, height: height,
      isScrollable: false,
    })
    document.body.appendChild(this.$dom)
    this.initializeWorld()
    this.adjustWindow()
  }
  private initializeWorld() {
    let inheritFontSize = { fontFamily: "inherit", fontSize: "100%" }
    new GlobalCSS().regist({
      body: {
        margin: 0, padding: 0, overflow: "hidden", background: "#000",
        "overflow-wrap": "break-word"
      },
      "*": {
        "box-sizing": "border-box",
        // contain: "content",
      },
      textarea: inheritFontSize,
      input: inheritFontSize,
      select: inheritFontSize,
      button: inheritFontSize,
    });
    window.addEventListener("resize", () => this.adjustWindow())
  }
  private adjustWindow() {
    let wRatio = window.innerWidth / this.width;
    let hRatio = window.innerHeight / this.height;
    let ratio = Math.min(wRatio, hRatio);
    this.applyStyle({
      position: "relative",
      background: "#000",
      top: Math.max(0, (window.innerHeight - this.height * ratio) / 2),
      left: Math.max(0, (window.innerWidth - this.width * ratio) / 2),
      width: this.width,
      height: this.height,
      transformOrigin: "0px 0px",
      transform: `scale(${ratio})`
    });
  }
  play(seed: (scene: Scene) => any) {
    let scene = new Scene(this)
    seed(scene)
  }
}

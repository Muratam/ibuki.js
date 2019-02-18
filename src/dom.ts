import { Color, Colors, ColorScheme } from "./color";
import * as CSS from "./style";
import { Store } from "./store";
import { Updater, KeyBoard, GlobalCSS, KeysType } from "./static"
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
type BorderStyle = "none" | "hidden" | "solid" | "double" |
  "groove" | "ridge" | "inset" | "outset" | "dashed" | "dotted"
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
  "focus" | "blur" | "select" | "change" |
  "load" | "dragdrop" |
  "click" | "dblclick" |
  "keyup" | "keydown" | "keypress" |
  "keyupall" | "keydownall" | "keypressall" |
  "mouseout" | "mouseover" | "mouseup" |
  "mousemove" | "mousedown" | "mouseup"
export type TextAlignType = "left" | "right" | "center" | "justify" | "justify-all" | "match-parent"
export type Seed<T> = ((p: T) => T)
export type SeedWithOption<T, O> = ((parent: T, option: O) => T)
export type TagSeed = string | Seed<DOM> // そのタグで作成するか関数適用
// 固定のサイズのBoxで全てを表現
export interface DOMOption {
  // そのコンテナ内部でfloatするときの位置(後続のDOMに影響を与えたい場合はnull)
  tag?: string
  fontSize?: number
  colorScheme?: Colors
  margin?: Rect | number
  padding?: Rect | number
  opacity?: number
  border?: Border | BorderContentType
  textAlign?: TextAlignType
  zIndex?: number | "auto"
  isScrollable?: boolean
}
export type FitType = { x: "left" | "center" | "right", y: "top" | "center" | "bottom" }
export interface BoxOption extends DOMOption {
  left?: number
  top?: number
  fit?: FitType
  draggable?: boolean // ドラッグできるか？
  width?: number  // null なら親と同じ
  height?: number // null なら親と同じ
  scale?: number  // | Vec2
  display?: "none" | "block"
  isButton?: boolean
  applyWidthHeightOnlyForAttributes?: boolean
}
export interface ContainerOption extends BoxOption { }
// 一番の基本要素,各々がちょうど一つのdomに対応する.
export class DOM {
  public readonly $dom: HTMLElement = null;
  public readonly $DOMId: number;
  $scene: Scene;
  protected $createdFrame: number
  public get frame(): number { return this.$scene.$createdFrame - this.$createdFrame; }
  public readonly $parent: DOM = null; // 移ることがある？
  public update(fun: (this: this, i: number) => boolean | void) {
    let f = fun.bind(this);
    let i = 0;
    this.$scene.$updater.regist(() => {
      let result = f(i);
      i++;
      if (typeof result === "boolean") return result;
      return true
    })
    return this
  }
  public perFrame(step: number = 1, n: number = Infinity): Store<number> {
    return this.$scene.$updater.perFrame(step, n)
  }
  private $children: DOM[] = [];
  public get children() { return this.$children; }
  private static DOMMaxId: number = 0;
  public get id(): string { return this.$dom.id }
  constructor(parent: DOM, option: string | DOMOption = "") {
    this.$dom = document.createElement(
      (typeof option === "string" ? option : option.tag) || "div");
    this.$DOMId = DOM.DOMMaxId++
    this.$dom.id = `World-box-${this.$DOMId}`
    if (parent !== null) {
      parent.$dom.appendChild(this.$dom);
      this.$parent = parent;
      parent.$children.push(this)
      if (parent.$scene) {
        this.$scene = parent.$scene;
        this.$createdFrame = this.$scene.$createdFrame;
      }
    }
    if (typeof option !== "string") this.applyStyle(this.parseDOMOption(option))
  }
  bloom(seed: TagSeed): DOM {
    if (typeof seed === "string") return new DOM(this, seed)
    return seed(this)
  }
  on(name: Event, callback: (this: this, key?: KeysType) => void, bind = true) {
    let c = bind ? callback.bind(this) : callback
    if (name === "keydownall") this.$scene.$keyboard.onKeyDown(c)
    else if (name === "keyupall") this.$scene.$keyboard.onKeyUp(c)
    else if (name === "keypressall") this.$scene.$keyboard.onKeyPress(c)
    else this.$dom.addEventListener(name, e => {
      // WARN: ↑と違って毎フレームに一回呼ばれるわけではない(し、メインスレッドでもない)！同時に押されてもダメかも.
      if (!e.key) return c()
      let key = {}
      key[e.key] = true
      c(key)
    })
    return this;
  }
  applyStyle(style: { [key: string]: any }) {
    let normalized = CSS.parse(style);
    for (let key in normalized) this.$dom.style[key] = normalized[key];
    return this;
  }
  tree(func: (parent: this) => any) { func(this); return this; }
  setAttributes(attrs: { [key: string]: any }) {
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
    if (style.colorScheme) {
      let colorScheme = ColorScheme.parseToColorScheme(option.colorScheme)
      style.backgroundColor = colorScheme.baseColor
      style.color = colorScheme.mainColor
      style.borderColor = colorScheme.accentColor
      delete style.colorScheme
    }
    if (style.isScrollable) {
      style.overflow = "scroll"
      delete style.isScrollable
    } else style.overflow = "hidden"
    delete style.tag
    return style
  }
}
type TimingFunction = "ease" | "linear" | "ease-in" | "ease-out" | "ease-in-out"
interface TransitionQueueElement {
  option: BoxOption
  duration: number
  timingFunction: TimingFunction
  delay: number
}
type NumberStyle = { [key: string]: number }
// 固定のwidth / height を持つもの
// 指定しなければ親と同じになる
class TransfromCSS implements CSS.CanTranslateCSS {
  left: number
  top: number
  scale: number
  rotate: number
  constructor(left: number, top: number, scale: number, rotate: number = 0) {
    this.left = left
    this.top = top
    this.scale = scale
    this.rotate = rotate
  }
  toCSS(): string {
    return `translate(${Math.floor(this.left)}px,${Math.floor(this.top)}px) rotate(${Math.floor(this.rotate)}deg) scale(${this.scale})`
  }
}
class Callback {
  private callback: () => any = () => { }
  used = false
  constructor() { }
  regist(callback: () => any) { this.callback = callback; }
  call() { this.callback(); this.used = true }
}
export class Box extends DOM {
  // 全てローカル値. transform:
  width: number = undefined;
  height: number = undefined;
  left: number = 0;
  top: number = 0;
  scale: number = 1;
  public readonly $parent: Box;
  constructor(parent: Box, option: BoxOption = {}) {
    super(parent, Box.copyDeletedTransformValues(option))
    // 全ての transform 値を number に保証
    if (parent !== null) {
      this.width = parent.width
      this.height = parent.height
    } else {
      this.width = option.width
      this.height = option.height
      console.assert(typeof this.width === "number" && typeof this.height === "number", "illegal initial World")
    }
    this.applyOptionOnCurrentState(option)
  }
  get currentTransform(): BoxOption {
    return {
      width: this.width,
      height: this.height,
      scale: this.scale,
      left: this.left,
      top: this.top,
    }
  }
  private percentages: NumberStyle = {}
  private realStyles: NumberStyle = {} // width / height / scale / top / left の他
  applyOptionOnCurrentState(option: BoxOption): CSS.AnyStyle {
    // option を読み込み,自身に(上書きができれば)適応
    let style = this.parseBoxOptionOnCurrentTransform(option)
    this.applyTransformValues(style)
    // this.percentages を style にだけ適応する
    for (let k in { ...style }) {
      if (typeof style[k] !== "number") continue
      // WARN: color の乗算 階層オブジェクト(border:{})には未対応
      // transform 系は既にapplyTransfromValuesで適応されている
      if (k == "left") {
        style.transform.left = (this.percentages[k] || 0) * this.width + this[k]
      } else if (k === "top") {
        style.transform.top = (this.percentages[k] || 0) * this.height + this[k]
      } else if (k === "scale") {
        style.transform.scale = (this.percentages[k] || 1) * this[k]
      } else if (k === "width" || k == "height") {
        style[k] = (this.percentages[k] || 1) * this[k]
      } else {
        this.realStyles[k] = style[k]
        style[k] = (this.percentages[k] || 1) * style[k]
      }
    }
    Box.deleteTransformValues(style) // transform にて変換したので(二重になるし)削除
    this.applyStyle(style)
    if (option.isButton) this.applyIsButton()
    if (option.draggable) this.applyDraggable()
    return style
  }
  static pickNum(s: string): number {
    let result: number = null
    for (let c of s) {
      if ("0" <= c && c <= "9") result = (result || 0) * 10 + (+c)
    }
    return result
  }
  parseBoxOptionOnCurrentTransform(option: BoxOption): CSS.AnyStyle {
    let transform = this.currentTransform;
    let result: CSS.AnyStyle = { ...transform, ...option }
    if (option.fit) {
      if (option.fit.x === "right") {
        result.left = this.$parent.width - result.width * result.scale
      } else if (option.fit.x === "center") {
        result.left = this.$parent.width / 2 - result.width * result.scale / 2
      } else {
        result.left = 0
      }
      if (option.fit.y === "bottom") {
        result.top = this.$parent.height - result.height * result.scale
      } else if (option.fit.y === "center") {
        result.top = this.$parent.height / 2 - result.height * result.scale / 2
      } else {
        result.top = 0
      }
      delete result.fit
    }
    result.position = "absolute" // 無いと後続の要素の位置がバグる
    result["transform-origin"] = "0px 0px"
    result.transform = new TransfromCSS(result.left, result.top, result.scale)
    return this.parseDOMOption(result);
  }
  applyTransformValues(style: CSS.AnyStyle) {
    let parse = (key: string, init: number): number =>
      typeof style[key] === "number" ? style[key] : this[key] || init
    let apply = (key: string, init: number) => this[key] = parse(key, init)
    if (this.$parent !== null) {
      apply("width", this.$parent.width)
      apply("height", this.$parent.height)
    }
    apply("scale", 1.0)
    apply("left", 0)
    apply("top", 0)
  }
  static copyDeletedTransformValues(option: BoxOption): BoxOption {
    let result = { ...option }
    Box.deleteTransformValues(result)
    return result
  }
  static deleteTransformValues(style: CSS.AnyStyle) {
    delete style.top
    delete style.left
    delete style.scale
  }

  applyIsButton() {
    // WARN: もうちょっとやりたい
    this.on("mouseover", () => { this.$dom.style.cursor = "pointer" })
    this.on("mouseout", () => { this.$dom.style.cursor = "default" })
  }
  applyDraggable() {
    // WARN: いっぱい登録すると重そう / タッチ未対応 / regist <-> remove できるようにしたい
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
      // this.left = e.pageX - x;
      // this.top = e.pageY - y;
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

  // すぐに値を変更する(with transition)
  // TODO: delete callbacks
  private callBacks: { [key: number]: () => any } = {}
  private transitionMaxId = 0
  to(option: BoxOption, duration = 1, timingFunction: TimingFunction = "ease", delay = 0, id: number = null) {
    if (this.frame === 0) {
      // 構築された最初のフレームでは無効なので
      this.$scene.reserveExecuteNextFrame(() => {
        this.to(option, duration, timingFunction, delay)
      })
      return
    }
    let style = this.applyOptionOnCurrentState(option)
    let transition = CSS.parse(style);
    let results: string[] = []
    for (let key in transition) {
      this.$dom.style[key] = transition[key]
      // if (style[key] === this[key]) continue // WARN: すでに適応されてしまっているので効かないとはいえ,減らしたほうがよい？
      if (typeof style[key] === "string" && key !== "transform") continue
      results.push(`${key} ${duration}s ${timingFunction} ${delay}s `)
    }
    this.$dom.style.transition = results.join(",")
    if (id === null) {
      this.transitionMaxId++;
      id = this.transitionMaxId;
    }
    let i = 0;
    this.$scene.$updater.regist(() => {
      if (i === Math.max(0, Math.floor(duration * 60))) {
        if (this.callBacks[id]) {
          this.callBacks[id]()
          delete this.callBacks[id]
        }
        return false;
      }
      i++;
      return true;
    })
    return this
  }
  // 最後に登録した to / next が 終わってから発火する
  next(option: BoxOption, duration = 1, timingFunction: TimingFunction = "ease", delay = 0) {
    if (this.frame === 0) {
      // 構築された最初のフレームでは無効なので
      this.$scene.reserveExecuteNextFrame(() => {
        this.next(option, duration, timingFunction, delay)
      })
      return this
    }
    this.transitionMaxId++;
    let id = this.transitionMaxId
    if (!this.callBacks[id - 1]) {
      this.callBacks[id - 1] = () => {
        this.to(option, duration, timingFunction, delay, id)
      }
    } else console.assert("illegal transition maxid")
    return this
  }
  private repeatStopped = false
  endRepeat() { this.repeatStopped = true }
  restartRepeat() { this.repeatStopped = false }
  static filterPercentageBoxOption(base: BoxOption): NumberStyle {
    let result: NumberStyle = {}
    for (let k in base) {
      if (typeof base[k] !== "number") continue
      result[k] = base[k]
    }
    return result
  }
  repeat(dst: BoxOption, base: BoxOption = {}, duration = 1, timingFunction: TimingFunction = "ease", delay = 0, iterationCount = Infinity) {
    // percentage
    let per = Math.floor(duration * 60) || 1 // WARN: 60FPS ?
    let isBase = false
    let itcnt = 0;
    this.update(i => {
      if (this.repeatStopped) return;
      if (i % per !== 0) return;
      this.percentages = Box.filterPercentageBoxOption(isBase ? base : dst)
      this.to({}, duration, timingFunction, delay)
      itcnt++;
      if (itcnt === iterationCount) return false;
      isBase = !isBase;
    })
    return this
  }
}

export class Scene extends Box {
  public readonly $updater: Updater;
  public readonly $keyboard: KeyBoard;
  public readonly $css: GlobalCSS;
  public readonly $parent: World
  private reservedExecuteNextFrames: (() => any)[] = []
  reserveExecuteNextFrame(fun: () => any) {
    this.reservedExecuteNextFrames.push(fun)
  }
  constructor(parent: World) {
    super(parent)
    this.$updater = new Updater();
    this.$keyboard = new KeyBoard(this.$updater)
    this.$css = new GlobalCSS();
    this.$scene = this
    this.$createdFrame = 0;
    this.$updater.regist(() => {
      this.$createdFrame++;
      for (let r of this.reservedExecuteNextFrames) r()
      this.reservedExecuteNextFrames = []
      return true;
    })
  }
  destroy() {
    this.$dom.remove();
    this.$updater.destroy();
    this.$css.destroy();
    this.$keyboard.destroy();
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
    super(null, {
      top: 0, left: 0, scale: 1, width: width, height: height,
      isScrollable: false,
    })
    document.body.appendChild(this.$dom)
    this.initializeWorld()
    this.adjustWindow()
  }
  private initializeWorld() {
    let inheritFontSize = { fontFamily: "inherit", fontSize: "100%" }
    new GlobalCSS().regist({
      body: { margin: 0, padding: 0, overflow: "hidden", background: "#000" },
      "*": {
        "box-sizing": "border-box",
        contain: "content",
      },
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
      position: "relative",
      background: "#ffffff",
      top: Math.max(0, (pHeight - this.height * ratio) / 2),
      left: Math.max(0, (pWidth - this.width * ratio) / 2),
      width: this.width,
      height: this.height,
      transformOrigin: "0px 0px",
      transform: `scale(${ratio})`
    });
  }
  public play(seed: (scene: Scene) => any) {
    let scene = new Scene(this)
    seed(scene)
    return this
  }
}

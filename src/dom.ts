import { Color, Colors, ColorScheme } from "./color";
import * as CSS from "./style";
import * as hash from "object-hash";
import { MayStore, Store, Primitive } from "./store";
import { Updater, KeyBoard, GlobalCSS } from "./static"
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
  isButton?: boolean
  zIndex?: number | "auto"
}
export type FitType = { x: "left" | "center" | "right", y: "top" | "center" | "bottom" }
export interface BoxOption extends DOMOption {
  pos?: { left: number, top: number }
  fit?: FitType
  draggable?: boolean // ドラッグできるか？
  width?: number  // null なら親と同じ
  height?: number // null なら親と同じ
  scale?: number  // | Vec2
  isScrollable?: boolean
}
export interface ContainerOption extends BoxOption { }
// 一番の基本要素,各々がちょうど一つのdomに対応する.
export class DOM {
  public readonly $dom: HTMLElement = null;
  public readonly $DOMId: number;
  $scene: Scene;
  public readonly $parent: DOM = null; // 移ることがある？
  public update(fun: (this: this) => boolean | void) {
    let f = fun.bind(this);
    this.$scene.$updater.regist(this.$scene.$updater.toGenerator(
      () => {
        let result = f();
        if (typeof result === "boolean") return result;
        return true
      }))
    return this
  }
  public perFrame(step: number = 1, n: number = Infinity): Store<number> {
    return this.$scene.$updater.perFrame(step, n)
  }
  private $children: DOM[] = [];
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
      this.$scene = parent.$scene;
      this.$parent = parent;
      parent.$children.push(this)
    } else if (this instanceof Ibuki) {
      parent.appendChild(this.$dom)
    } else console.assert(false, "now root Box need to be scene class")
    if (this instanceof Scene) this.$scene = this;
    if (typeof option !== "string") this.applyStyle(this.parseDOMOption(option))
  }
  bloom(seed: TagSeed): DOM {
    if (typeof seed === "string") return new DOM(this, seed)
    return seed(this)
  }
  on(name: Event, callback: (this: this, key?: string) => void, bind = true) {
    let c = bind ? callback.bind(this) : callback
    if (name === "keydownall") this.$scene.$keyboard.onKeyDown(c)
    else if (name === "keyupall") this.$scene.$keyboard.onKeyUp(c)
    else if (name === "keypressall") this.$scene.$keyboard.onKeyPress(c)
    else this.$dom.addEventListener(name, c)
    return this;
  }
  applyStyle(style: { [key: string]: any }) {
    if (style.isButton) {
      this.on("mouseover", () => { this.$dom.style.cursor = "pointer" })
      this.on("mouseout", () => { this.$dom.style.cursor = "default" })
    }
    let normalized = CSS.parse(style);
    for (let key in normalized) {
      let val = normalized[key]
      this.$dom.style[key] = val;
    }
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
    if (option.colorScheme) {
      let colorScheme = ColorScheme.parseToColorScheme(option.colorScheme)
      style.backgroundColor = colorScheme.baseColor
      style.color = colorScheme.mainColor
      style.borderColor = colorScheme.accentColor
      delete style.colorScheme
    }
    delete style.tag
    return style
  }
  parseBoxOption(parent: Box | HTMLElement, option: BoxOption): CSS.AnyStyle {
    let result: CSS.AnyStyle = { ...option }
    let parentWidth = parent instanceof Box ? parent.width : result.width;
    let parentHeight = parent instanceof Box ? parent.height : result.height;
    result.width = typeof result.width === "number" ? result.width : parentWidth
    result.height = typeof result.height === "number" ? result.height : parentHeight
    result.scale = result.scale || 1.0

    result.position = "absolute";
    // pos と fit が設定されていれば,fit が優先される.
    if (option.pos) {
      result.top = option.pos.top;
      result.left = option.pos.left;
      delete result.pos
    }
    if (option.fit) {
      if (option.fit.x === "right") {
        result.left = parentWidth - result.width * result.scale
      } else if (option.fit.x === "center") {
        result.left = parentWidth / 2 - result.width * result.scale / 2
      } else {
        result.left = 0
      }
      if (option.fit.y === "bottom") {
        result.top = parentHeight - result.height * result.scale
      } else if (option.fit.y === "center") {
        result.top = parentHeight / 2 - result.height * result.scale / 2
      } else {
        result.top = 0
      }
      delete result.fit
    }
    if (result.isScrollable) {
      result.overflow = "scroll"
      delete result.isScrollable
    } else result.overflow = "hidden"
    result = {
      ...result,
      ...CSS.transform({ scale: result.scale, origin: "0px 0px" })
    }
    return this.parseDOMOption(result);
  }
}
type TimingFunction = "ease" | "linear" | "ease-in" | "ease-out" | "ease-in-out"
interface TransitionQueueElement {
  option: BoxOption
  duration: number
  timingFunction: TimingFunction
  delay: number
}
export interface RepeatAnimationOption {
  duration?: number // s
  timingFunction?: TimingFunction // cubic-bezier?
  delay?: number // s
  iterationCount?: number | "infinite"
  direction?: "normal" | "alternate"
  fillMode?: "none" | "formards" | "backwards" | "both"
}
interface AnimationFrameOption extends BoxOption { percent?: number }

// 固定のwidth / height を持つもの
// 指定しなければ親と同じになる
export class Box extends DOM {
  // 全てローカル値
  width: number = null;
  height: number = null;
  left: number = 0;
  top: number = 0;
  scale: number = 1; // WARN: transform-scale は scale のはず？
  isScrollable: boolean = false;
  public readonly $parent: Box;
  private alreadyRegistedAnimationIteration = false
  constructor(parent: Box | HTMLElement, option: BoxOption = {}) {
    super(parent, option)
    this.applyOption(option)
    if (option.draggable) this.registDrag()
  }
  registDrag() {
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
  applyOption(option: BoxOption) {
    // option を読み込み,自身に(上書きができれば)適応
    let style = this.parseBoxOptionOnCurrentState(option)
    let apply = (key: string, init: number) => {
      this[key] = typeof style[key] === "number" ? style[key] : this[key] || 0
    }
    this.isScrollable = style.isScrollable || style.overflow === "scroll" || false
    apply("width", this.$parent === null ? 72 : this.$parent.width)
    apply("height", this.$parent === null ? 72 : this.$parent.height)
    apply("scale", 1.0)
    apply("left", 0)
    apply("top", 0)
    this.applyStyle(style)
  }
  get currentTransform(): BoxOption {
    return {
      width: this.width,
      height: this.height,
      scale: this.scale,
      isScrollable: this.isScrollable,
      pos: { left: this.left, top: this.top },
    }
  }
  private alreadyTransitionEventListenerRegisted = false
  private transitionFinished = true
  private transitionQueue: TransitionQueueElement[] = []
  parseBoxOptionOnCurrentState(option: BoxOption): CSS.AnyStyle {
    return this.parseBoxOption(this.$parent, { ...this.currentTransform, ...option })
  }
  // すぐに値を変更する(with transition)
  // force をはずすと過去の登録したアニメーションは残る.
  // WARN: 全く同じ状態を経由すると transitionend は発火しない！
  to(option: BoxOption, duration = 1, timingFunction: TimingFunction = "ease", delay = 0, force = true) {
    if (force) this.transitionQueue = []
    this.applyOption(option);
    let style = this.parseBoxOptionOnCurrentState(option)
    let transition = CSS.parse(style);
    let results: string[] = []
    for (let key in transition) {
      results.push(`${key} ${duration}s ${timingFunction} ${delay}s `)
      this.$dom.style[key] = transition[key]
    }
    this.$dom.style.transition = results.join(",")
    this.transitionFinished = false
    if (!this.alreadyTransitionEventListenerRegisted) {
      this.$dom.addEventListener("transitionend", e => {
        this.transitionFinished = true
        if (this.transitionQueue.length === 0) return;
        let q = this.transitionQueue.shift()
        this.to(q.option, q.duration, q.timingFunction, q.delay, false)
      })
    }
    this.alreadyTransitionEventListenerRegisted = true
    return this
  }
  // 現在の transition が 終わってから値を変更する
  next(option: BoxOption, duration = 1, timingFunction: TimingFunction = "ease", delay = 0) {
    if (this.transitionFinished) {
      this.to(option, duration, timingFunction, delay, false)
      return
    }
    let newElem = { option, duration, timingFunction, delay, }
    if (this.transitionQueue.length > 0) {
      let h1 = hash(this.transitionQueue[this.transitionQueue.length - 1]);
      console.assert(h1 !== hash(newElem), "same transition is illegal")
    }
    this.transitionQueue.push(newElem)
    return this
  }
}
/* // アニメーションなんかバグってる
static __animationMaxId: number = 0
static __hashes: { [key: string]: string } = {}
repeat(option: RepeatAnimationOption, a: AnimationFrameOption, b: AnimationFrameOption = null) {
  // WARN: もっとkeyframeを増やしたければ VA_ARGS的な感じでできそう
  let src = b !== null ? a : {};
  let srcPercent = b !== null ? a.percent || "0%" : "0%"
  let dst = b !== null ? b : a;
  let dstPercent = dst.percent || "100%"
  let h = hash(src) + hash(dst)
  if (!Box.__hashes[h]) {
    let srcCSS = CSS.flatten(CSS.parse(this.parseBoxOptionOnCurrentState(src)));
    let dstCSS = CSS.flatten(CSS.parse(this.parseBoxOptionOnCurrentState(dst)));
    var name = `ibuki-animation-${Box.__animationMaxId++}`;
    CSS.Global.regist(`@keyframes ${name} {
      ${srcPercent} {${srcCSS}}
      ${dstPercent} {${dstCSS}}
    }`)
    Box.__hashes[h] = name
  } else name = Box.__hashes[h]
  let animation: CSS.Style = {
    name: name,
    iterationCount: "infinite",
    direction: "alternate",
    fillMode: "both"
  }
  for (let key in option) {
    let val = option[key];
    if (typeof val === "number") animation[key] = Math.floor(val * 1000) + "ms"
    else animation[key] = val
  }
  if (!this.alreadyRegistedAnimationIteration) {
    this.$dom.addEventListener("animationiteration", e => { })
    this.alreadyRegistedAnimationIteration = true
  }
  this.applyStyle({ animation: animation })
  return this
}
*/

export class Scene extends Box {
  public readonly $updater = new Updater()
  public readonly $keyboard = new KeyBoard()
  public readonly $css = new GlobalCSS()
  public readonly $parent: Ibuki
  constructor(parent: Ibuki) {
    super(parent)
    this.$scene = this
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
export class Ibuki extends Box {
  alwaysFullScreen: boolean = false
  constructor(width: number = 1280, height: number = 720, alwaysFullScreen: boolean = false) {
    super(document.body, { width: width, height: height })
    this.alwaysFullScreen = alwaysFullScreen;
    this.initializeWorld()
    this.adjustWindow()
  }
  private initializeWorld() {
    let inheritFontSize = { fontFamily: "inherit", fontSize: "100%" }
    new GlobalCSS().regist({
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
  public play(seed: (scene: Scene) => any) {
    let scene = new Scene(this)
    seed(scene)
    return this
  }
}

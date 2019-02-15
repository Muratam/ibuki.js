import { parse } from "path";

/*
Ibuki.ts は設計が悪い気がする
東方弾幕画報をゲーム化したい
必要なもの : (対戦するなら)ネットワーク機能
Proxy を使ってリアルタイムで反映されるようにしたい
Component は付け足しが基本な設計
- 画面はスクロールされない => 基本サイズを設定できる(+ fit-width/fit-height)
- 例えば,会話画面が欲しいとき,必要な情報は
  - カラー(アクセント/サブ/etc...),ライフサイクル
  - 文字 / 表示方法
  - 表示領域
let talkTmpl = new TalkScene(StringOption?,ColorOption,OperationOption?);
talkTmpl.print("いい感じに表示");
tweenがほしい?
*/
// js の 多種多様なライブラリを統一して集めていい感じにしたい
// 動的なゲームはあまり対象とは考えていない.(?)
// DOM で全てなんとかしたい？
// アクションゲームを作るのは難しいような構造に挑戦したい.
// - table / markdown / SVG ...
// particle / effect / 3D は無理なのは仕方がない(?)
// sum とか shlottle とか Katex とか グラフとか色々生やしたい
// 色々なDOM(jq..とか)も用意に使えるようにしたい？

// display:none するよりは 毎度毎度Elementは生成/破棄したほうがよい。
// CSSは,小回りが効くように各ノードごとにやっておいてパフォーマンスが困ってきたら変更。
namespace Ibuki { // Functions
  export function clamp(val: number, min: number, max: number) {
    return Math.min(max, Math.max(min, Math.floor(val)));
  }

}
namespace Ibuki.CSS {
  export function parse(style: Style): { [key: string]: string } {
    let result: { [key: string]: string } = {}
    for (let key in style) {
      let val = style[key]
      if (typeof val === "number") result[key] = `${Math.floor(val)}px`
      else if (typeof val === "string") result[key] = val
      else result[key] = `${parse(val)}`
    }
    return result
  }
  export function flatten(style: { [key: string]: string }): string {
    let result = "";
    for (let key in style) result += `${key}:${style[key]};`
    return result;
  }
  export function transform(tr: { [key: string]: string | number }): Style {
    let result = { transform: "" }
    for (let key in tr) {
      if (key === "origin") result["transform-origin"] = tr[key]
      else result.transform += `${key}(${tr[key]})`
    }
    return result
  }
  export class Global {
    static doms: HTMLStyleElement[] = []
    public static regist(styles: string | { [key: string]: Style }) {
      let dom = document.createElement("style")
      dom.type = "text/css"
      if (typeof styles === "string") dom.innerHTML = styles
      else {
        let styleStr = ""
        for (let key in styles) styleStr += `${key}{${flatten(parse(styles[key]))}}`
        dom.innerHTML = styleStr
      }
      this.doms.push(dom)
      document.head.appendChild(dom)
    }
  }
}
namespace Ibuki { // StyleSheet
  export interface Style {
    [key: string]: string | number | Style
  }
}
namespace Ibuki { // Color
  export class Color {
    public r: number = 1.0
    public g: number = 1.0
    public b: number = 1.0
    public a: number = 1.0
  }
  export interface ColorScheme {
    baseColor?: Color // 70%
    mainColor?: Color // 25%
    accentColor?: Color // 5%
    palette?: Color[] // others
  }

}
namespace Ibuki { // Widget
  export interface Text {
    text: string
    size?: number
    fontName?: string
    color?: Color
    isBold?: boolean
    edgeColor?: Color
  }
  export interface TalkWidget {
    text: Text
    colorScheme?: ColorScheme
  }

}
namespace Ibuki { // animation
  export interface Tween {

  }
}
namespace Ibuki { // DOM
  export interface Vec2 {
    x: number
    y: number
  }
  export interface Rect {
    top: number
    bottom: number
    left: number
    right: number
  }
  // どこを基準にしてサイズを設定すべき？
  // 固定のサイズがあるべき
  export class DOM {
    // そのコンテナ内部でfloatするときの位置(後続のDOMに影響を与えたい場合はnull)
    // floatPos?: Vec2 // (animationに全ていっそ任せる？)
    protected isFloating: boolean = false
    // width / height :: nullの時はサイズは親に合わせる
    protected size?: Vec2 = null
    protected margin: Rect
    protected padding: Rect
    protected border: Rect
    protected $style: Style = {}
    protected $dom: HTMLElement;
    constructor(parent?: DOM | HTMLElement) {
      this.$dom = document.createElement("div");
      if (parent instanceof DOM) parent.$dom.appendChild(this.$dom);
      else parent.appendChild(this.$dom);
    }
    get style(): Style { return this.$style; }
    set style(style: Style) {
      let normalized = CSS.parse(style);
      for (let key in normalized) {
        let val = normalized[key]
        this.$dom.style[key] = val;
      }
      this.$style = style;
    }
  }

  // 画面全体に自動でフィットする根本のDOM
  export class World extends DOM {
    constructor(width: number = 1280, height: number = 720) {
      super(document.body)
      this.size = { x: width, y: height }
      CSS.Global.regist({
        body: { margin: 0, padding: 0, overflow: "hidden" },
        "*": { "box-sizing": "border-box" }
      });
      this.adjustWindow()
      window.addEventListener("resize", () => this.adjustWindow())
      this.$dom.innerText = "aaaaaa";
      this.style = { "background-color": "#faaaaa" }
    }
    private adjustWindow() {
      let pWidth = window.innerWidth;
      let wRatio = pWidth / this.size.x;
      let pHeight = window.innerHeight;
      let hRatio = pHeight / this.size.y;
      let ratio = Math.min(wRatio, hRatio);
      this.style = {
        overflow: "hidden",
        position: "relative",
        top: Math.max(0, (pHeight - this.size.y * ratio) / 2),
        left: Math.max(0, (pWidth - this.size.x * ratio) / 2),
        width: this.size.x,
        height: this.size.y,
        ...CSS.transform({ scale: ratio, origin: "0px 0px" })
      }
    }
  }
}

namespace Ibuki { // other
  export interface OperationOption { }
}

let world = new Ibuki.World()
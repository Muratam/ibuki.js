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
// sum とか shlottle とか MathJax とか グラフとか色々生やしたい
// 色々なDOM(jq..とか)も用意に使えるようにしたい？

// オブジェクトを100000個くらいおいて,

namespace Ibuki {
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

  export interface Tween {

  }
  export interface OperationOption { }
  // export interface Style {
  //   [key: string]: string
  //   // boxSizing -> box-sizing
  //   // margin?: "auto" | number
  //   // boxSizing?: "content-box" | "border-box"
  //   // overflow?: "visible" | "hidden" | "scroll" | "auto"
  //   // position?: "static" | "relative" | "absolute" | "fixed" | "inherit"
  // }
  // parse(style: Style): string {
  //   let result = ""
  //   for (let key in style) result += `${style[key]}`
  //   return result
  // }

  export class GlobalCSS {
    public static $instance = new GlobalCSS();
    private $dom: HTMLStyleElement;
    constructor() {
      this.$dom = document.createElement("style")
      this.$dom.type = "text/css"
      this.$dom.innerHTML = ""
      document.head.appendChild(this.$dom)
    }
    regist(style: string) {
      this.$dom.innerHTML += style;
    }
  }
  export class DOM {
    protected style: string = ""
    public constructor() {

    }
  }
  // 画面全体に自動でフィットする根本のDOM
  export class World extends DOM {
    protected style = `
      overflow: "hidden",
      position: "relative",
    `
    public constructor() {
      super()
      GlobalCSS.$instance.regist(`
    body { margin:0px; padding 0px; }
     *   { box-sizing: border-box; }
    `)
    }
  }
}

let world = new Ibuki.World()



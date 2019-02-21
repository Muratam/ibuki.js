
import { Color, ColorScheme } from "../core/color";
import { Box, FitBox, DOM, Scene, Text } from "../core/dom";
import { Input, InputOption, InputType } from "../html/input"
import { FlexBox, Table } from "../html/container"
import { toStore, DataStore } from "../core/store"
import { ProgressBar, IFrame } from "../html/media";
import { Alert, Badge, Spinner, HR } from "../html/notice"
import { FAIcon } from "../widget/external/faicon"
import { MarkDown } from "../widget/external/markdown"
import { Katex } from "../widget/external/katex"
import { ThreeLoopView } from "../widget/loopview"
import * as CSS from "../core/style"

function helloBox(p: Box, store: DataStore): Box {
  let text = ` hello ibuki.ts !!
  ibuki.ts は DOM をメインに迎えた新しいゲームエンジンです!!
  ギャルゲーやボドゲなど、あまりキャラクターは動き回らないけど
  テキストや UI のアニメーションがたくさん欲しいようなゲームなどにターゲットを当てています.
  ibuki.ts は vue.js / jquery / ゲームエンジン構成法 のハイブリッドです.
  通常のゲームエンジンがターゲットとする canvas / webgl ではなく
  あえて vue.js / jquery のように DOM を対象にすることで,
  豊富な DOM 資源を活用することができます！
  例えばこのBox一つとっても,
  ブラウザの標準スクロールやcanvasのtextでは描画できないキレイな
  文字が見えるでしょう？？
  これはただのテキストですが後で見ていくように様々なwidgetを活用することができます！
  `.replace(/\n/g, "")
  return new FitBox(p, { textAlign: "left", padding: 30 }).tree(p => {
    new Text(p, text)
  })
}

function informationBox(p: Box, store: DataStore): Box {
  return new FitBox(p, {
    textAlign: "center",
    fontSize: 30,
    padding: 30
  }).tree(p => {
    new Text(p, "information box\n")
    new Text(p, store.sec.to(x => "Frame : " + x + "\n"), { color: "#afb" })
    new Text(p, store.pressedKey.to(x => "Key : " + x + "\n"), { color: "#afb" })
    new Text(p, store.event.to(x => "Mouse : " + x + "\n"), { color: "#afb" })
    new FAIcon(p, "faIgloo", { color: Color.parse("#fab") })
    new Spinner(p)
    new Spinner(p, { type: "grow" })
    new Text(p, "\n")
    new Text(p, store.pressedKey, { href: store.pressedKey })
  }).on("mouseover", () => { store.event.set("mouseover") })
    .on("mouseout", () => { store.event.set("mouseout") })
    .on("mousemove", () => { store.event.set("mousemove") })
}
function flexBoxInputTest(p: Box, store: DataStore, colorScheme: ColorScheme): Box {
  return new FlexBox(p, {
    flexDirection: "column",
    alignItems: "flex-start",
    padding: 20,
  }).tree(p => {
    new Text(p, "Input with flexBox\n", {})
    function create(type: InputType, option: InputOption) {
      let input = toStore("")
      return new Input(p, {
        type: type,
        ...option,
        label: input.to(x => type + " -> " + x)
      }, { colorScheme: colorScheme }).assign(input)
    }
    create("text", { placeholder: "reactive input here" }).assign(store.inputted)
    let preLabel = toStore("")
    create("text", { prependLabel: preLabel }).assign(preLabel)
    let valid = toStore(true)
    create("text", { prependLabel: "size < 4", valid: valid }).value.regist(x => valid.set(x.length < 4))
    create("select", { options: ["ro", "ro", "to", "ro"] })
    create("select", { options: ["ro", "ro", "to", "ro"], multiple: true })
    create("text", { placeholder: "readonly", readonly: true }).assign(store.inputted)
    let inputTypes: InputType[] = [
      "password", "color", "range",
      "checkbox", "file", "time",
      "date", "email",
      "search", "tel", "time",
      "url", "radio", "number",
    ]
    for (let s of inputTypes) create(s, {})
    new Input(p, { placeholder: "normal text" }, { colorScheme: colorScheme })
    new Input(p, { placeholder: "dontFit" }, { colorScheme: colorScheme, dontFitWidth: true })
    new Input(p, { placeholder: "dontFit", label: "dontFit" }, { colorScheme: colorScheme, dontFitWidth: true })
  });
}
function flexBoxMediaTest(p: Box, store: DataStore, colorScheme: ColorScheme): Box {
  return new FlexBox(p, {
    flexDirection: "column",
    alignItems: "flex-start",
    padding: 20,
  }).tree(p => {
    new Text(p, store.sec.to(x => `Media With FlexBox  : ${x % 100}%`), {})
    new ProgressBar(p, store.sec.to(x => Math.floor(x / 50) * 10 % 100), { height: 1, withLabel: false }, 100)
    new Text(p, "striped", {})
    new ProgressBar(p, store.sec.to(x => Math.floor(x / 50) * 10 % 100), { height: 10, withLabel: false, striped: true }, 100)
    new Text(p, "display percentage", {})
    new ProgressBar(p, store.sec.to(x => Math.floor(x / 50) * 10 % 100), { height: 20, withLabel: true }, 100)
    new Text(p, "custom color", {})
    new ProgressBar(p, store.sec.to(x => Math.floor(x / 50) * 10 % 100), { height: 30, withLabel: true, colorScheme, striped: true }, 100)
    new HR(p)
    new DOM(p).tree(p => {
      new Badge(p, "Badge:", { label: store.pressedKey, href: store.pressedKey, modifier: "primary" })
      new Badge(p, "Badge:", { pill: true, label: store.pressedKey, href: store.pressedKey, modifier: "warning" })
        .tooltip("tooltip", "right")
    })
    new Alert(p).tree(p => {
      new Text(p, "current link is ")
      new Text(p, store.pressedKey, { href: store.pressedKey })
      new Text(p, "!!!")
      new HR(p)
      new Text(p, "current link is ")
      new Text(p, store.pressedKey, { href: store.pressedKey })
      new Text(p, "!!!")
    })
  })
}

function tableTest(p: Box, store: DataStore): Box {
  return new FlexBox(p, {
    flexDirection: "column",
    alignItems: "flex-start",
    padding: 20,
  }).tree(p => {
    new Table(p, {}, (x, y) => {
      if (y % 2 === 0) return { colorScheme: new ColorScheme("#cdf", "#222222bb", "#abd") }
      return {}
    }).addContents([
      ["Table", "Test", "Box"],
      ["please", "mouse", "hover"],
      [store.event, store.event, store.event],
      [store.event, store.event, store.event],
      [store.event, store.event, store.event],
      [store.event, store.event, store.event],
      [store.event, store.event, store.event],
      [store.event, store.event, store.event],
      [store.event, store.event, store.event],
      [store.event, store.event, store.event],
      [store.event, store.event, store.event],
      [store.event, store.event, store.event],
      [store.event, store.event, store.event],
      [store.event, store.event, store.event],
    ]).on("mouseover", () => { store.event.set("mouseover") })
      .on("mouseout", () => { store.event.set("mouseout") })
      .on("mousemove", () => { store.event.set("mousemove") })
  });
}
function iframeTest(p: Box, store: DataStore): Box {
  return new FitBox(p, {
    padding: 20,
  }).tree(p => {
    new Text(p, "iframe Test Box\n", {})
    new IFrame(p, { src: "https://www.openstreetmap.org/export/embed.html", height: p.height * 0.7 })
  });
}
function markdownTest(p: Box, colorScheme: ColorScheme): Box {
  return new FitBox(p, {
    padding: 20,
  }).tree(p => {
    let text = new Input(p, { type: "textarea", label: "realtime markdown" }, { colorScheme: colorScheme }).value
    new MarkDown(p, text)
  });
}
function katexTest(p: Box, colorScheme: ColorScheme): Box {
  return new FitBox(p, {
    padding: 20,
  }).tree(p => {
    new Text(p, "realtime katex")
    let text = new Input(p, { type: "textarea" }, { colorScheme: colorScheme }).value
    new Katex(p, text)
  });
}
function movableBottomTest(p: Box, store: DataStore, colorScheme: ColorScheme): Box {
  // TODO: show FPS
  return new Box(p, {
    fit: { x: "right", y: "bottom" },
    height: p.height * 0.3,
    width: p.width * 0.45,
    colorScheme: colorScheme,
    padding: 20,
    fontSize: 40,
    border: { width: 5, style: "solid", radius: 15 },
  }).tree(p => {
    new Text(p, "クリックすると動き出すやで")
  }).on("click", function () {
    // this
    //   .to({ fit: { x: "right", y: "center" }, }, 0.5)
    //   .next({ fit: { x: "right", y: "top" } }, 0.5)
    //   .next({ fit: { x: "center", y: "top" } }, 0.5)
    //   .next({ fit: { x: "left", y: "top" } }, 0.5)
    //   .next({ fit: { x: "left", y: "center" }, }, 0.5)
    //   .next({ fit: { x: "left", y: "bottom" }, }, 0.5)
    //   .next({ fit: { x: "center", y: "bottom" } }, 0.5)
    //   .next({ fit: { x: "right", y: "bottom" } }, 0.5)
  })//.toRelativeOnHover({ scale: 0.8 }, 0.5)
}
function bottomTest(p: Box, store: DataStore, colorScheme: ColorScheme): Box {
  // TODO: show FPS
  return new Box(p, {
    fit: { x: "left", y: "bottom" },
    height: p.height * 0.3,
    width: p.width * 0.45,
    colorScheme: colorScheme,
    padding: 20,
    fontSize: 40,
    isDraggable: true,
    border: { width: 5, style: "solid", radius: 15 },
  }).tree(p => {
    new Text(p, "ドラッグアンドドロップできるやで")
  }).on("click", function () {
  }).update(function () { }).popover("iikanji ", "これが Pop over ってやつやで", "top")
}

export function threeBoxSampleScene(scene: Scene) {
  let store = {
    inputted: toStore(""),
    sec: scene.perFrame(1),
    pressedKey: toStore(""),
    event: toStore(""),
    posX: toStore(0)
  }
  let colorScheme = new ColorScheme("#222222bb", "#cdf", "#abd")
  let loopView = new ThreeLoopView(scene,
    {
      height: scene.height * 0.7,
      fit: { x: "center", y: "top" },
    }, {
      colorScheme: colorScheme,
      border: { width: 5, style: "solid", radius: 15 },
      fontFamily: "Menlo",
    }).add([
      p => helloBox(p, store),
      p => informationBox(p, store),
      p => flexBoxInputTest(p, store, colorScheme),
      p => flexBoxMediaTest(p, store, new ColorScheme("#222222bb", "#abd", "#238")),
      p => markdownTest(p, colorScheme),
      p => katexTest(p, colorScheme),
      p => tableTest(p, store),
      p => iframeTest(p, store),
    ])
  movableBottomTest(scene, store, colorScheme)
  bottomTest(scene, store, colorScheme)
  let wait = 0
  scene.update(() => { wait--; })
  scene.on("keydownall", key => {
    let last = ""
    for (let k in key) last = k
    if (last !== "") store.pressedKey.set(last)
    if (key.Escape) {
      scene.destroy();
      scene.gotoNextScene(threeBoxSampleScene)
      return;
    }
    if (wait > 0) return;
    if (key.ArrowLeft) {
      store.posX.set((x: number) => x + 1)
      loopView.turn(1)
      wait = 20
    } else if (key.ArrowRight) {
      store.posX.set((x: number) => x - 1)
      loopView.turn(-1)
      wait = 20
    }
  })
}

// try
// new World().play(scene => threeBoxSampleScene(scene, threeLoopViewStore))


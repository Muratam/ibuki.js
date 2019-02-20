import { Color, ColorScheme } from "../core/color";
import { Box, DOM, Scene } from "../core/dom";
import { Text, TextSequence, Badge } from "../html/text";
import { Input, InputOption, InputType } from "../html/input"
import { FlexBox, Table, BSGridBox } from "../html/container"
import { toStore, DataStore } from "../core/store"
import { ProgressBar, MeterBar, IFrame, Image } from "../html/media";
import { FAIcon } from "../widget/external/faicon"
import { MarkDown } from "../widget/external/markdown"
import { Katex } from "../widget/external/katex"
import { ThreeLoopView } from "../widget/loopview"
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
  return new Box(p, { textAlign: "left", padding: 30 }).tree(p => {
    new Text(p, text)
  })
}

function informationBox(p: Box, store: DataStore): Box {
  return new Box(p, {
    textAlign: "center",
    fontSize: 30,
    padding: 30
  }).tree(p =>
    new TextSequence(p, [
      ["information box\n", {}],
      [store.sec.to(x => "Frame : " + x + "\n"), "#afb"],
      [store.pressedKey.to(x => "Key : " + x + "\n"), "#fab"],
      [store.event.to(x => "Mouse : " + x + "\n"), {}],
      p => new FAIcon(p, "faIgloo", { color: Color.parse("#fab") }),
      ["\n", {}],
      p => new Badge(p, "Badge:", { label: store.pressedKey, href: store.pressedKey, modifier: "primary" }),
      p => new Text(p, store.pressedKey, { href: store.pressedKey }),
      p => new Badge(p, "Badge:", { pill: true, label: store.pressedKey, href: store.pressedKey, modifier: "warning" }),
    ])
  ).on("mouseover", () => { store.event.set("mouseover") })
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
  });
}
// function BSGridBoxInputTest(p: Box, store: DataStore, colorScheme: ColorScheme): Box {
//   function create(p: DOM, type: InputType, option: InputOption) {
//     let input = toStore("")
//     return new Input(p, {
//       type: type,
//       ...option,
//       label: input.to(x => type + " -> " + x)
//     }, { colorScheme: colorScheme }).assign(input)
//   }
//   return new BSGridBox(p, { padding: 20, }).add(
//     p => new Text(p, "Input with flexBox\n", {}),
//     p => {
//       create(p, "text", { placeholder: "reactive input here" }).assign(store.inputted)
//     }, p => {
//       let preLabel = toStore("")
//       create("text", { prependLabel: preLabel }).assign(preLabel)
//       let valid = toStore(true)
//       create("text", { prependLabel: "size < 4", valid: valid }).value.regist(x => valid.set(x.length < 4))
//       create("select", { options: ["ro", "ro", "to", "ro"] })
//       create("select", { options: ["ro", "ro", "to", "ro"], multiple: true })
//       create("text", { placeholder: "readonly", readonly: true }).assign(store.inputted)
//       let inputTypes: InputType[] = [
//         "password", "color", "range",
//         "checkbox", "file", "time",
//         "date", "email",
//         "search", "tel", "time",
//         "url", "radio", "number",
//       ]
//       for (let s of inputTypes) create(s, {})
//     })
//   .add([p => new Text(p, "Input with BootStrap Grid System\n")])
//   .addForm(p => create(p, "text", { placeholder: "reactive input here" }).assign(store.inputted))
//   .addForm(p => create(p, "text", { prependLabel: preLabel }).assign(preLabel))
//   // .addForm(p => create(p, "text", { prependLabel: "size < 4", valid: valid }).value.regist(x => valid.set(x.length < 4)))
//   .addForm(p => create(p, "select", { options: ["ro", "ro", "to", "ro"] }))
//   .addForm(p => create(p, "select", { options: ["ro", "ro", "to", "ro"], multiple: true }))
//   .addForm(p => create(p, "text", { placeholder: "readonly", readonly: true }).assign(store.inputted))
// let inputTypes: InputType[] = [
//   "password", "color", "range",
//   "checkbox", "file", "time",
//   "date", "email",
//   "search", "tel", "time",
//   "url", "radio", "number",
// ]
// for (let s of inputTypes) create(grid, s, {})
// return grid
// }
function flexBoxMediaTest(p: Box, store: DataStore): Box {
  return new FlexBox(p, {
    flexDirection: "column",
    alignItems: "flex-start",
    padding: 20,
  }).tree(p => {
    new Text(p, store.sec.to(x => `Media With FlexBox  : ${x % 100}%`), {})
    new ProgressBar(p, store.sec.to(x => x % 100), {}, 100)
    new MeterBar(p, store.sec.to(x => x % 100), { min: 0, max: 100, low: 22, high: 66, optimum: 80 })
  });
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
  return new Box(p, {
    padding: 20,
  }).tree(p => {
    new Text(p, "iframe Test Box\n", {})
    new IFrame(p, { src: "https://www.openstreetmap.org/export/embed.html", height: p.height * 0.7 })
  });
}
function markdownTest(p: Box, colorScheme: ColorScheme): Box {
  return new Box(p, {
    padding: 20,
  }).tree(p => {
    let text = new Input(p, { type: "textarea", label: "realtime markdown" }, { colorScheme: colorScheme }).value
    new MarkDown(p, text)
  });
}
function katexTest(p: Box, colorScheme: ColorScheme): Box {
  return new Box(p, {
    padding: 20,
  }).tree(p => {
    new Text(p, "realtime katex")
    let text = new Input(p, { type: "textarea" }, { colorScheme: colorScheme }).value
    new Katex(p, text)
  });
}


function bottomTest(p: Box, store: DataStore, colorScheme: ColorScheme): Box {
  // TODO: show FPS
  return new Box(p, {
    fit: { x: "center", y: "bottom" },
    height: p.height * 0.3,
    colorScheme: colorScheme,
    border: { width: 5, style: "solid", radius: 15 },
  }).tree(p => {
    new Text(p, store.posX.to(x => x + "%"))
  }).on("click", function () {
    this
      .to({ fit: { x: "center", y: "center" }, }, 0.5)
      .next({ fit: { x: "center", y: "top" } }, 0.5)
      .next({ fit: { x: "center", y: "bottom" } }, 0.5)
  }).update(function () { })
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
  let backGround = new Box(scene, {
    colorScheme: new ColorScheme("#181818")
  })
  let loopView = new ThreeLoopView(backGround,
    {
      height: scene.height * 0.7,
      fit: { x: "center", y: "top" }
    }, {
      colorScheme: colorScheme,
      border: { width: 5, style: "solid", radius: 15 },
      fontFamily: "Menlo"
    }).add([
      p => new Image(new Box(p, { padding: 20 }), { src: "https://sagisawa.0am.jp/me.jpg" }),
      p => helloBox(p, store),
      p => informationBox(p, store),
      p => flexBoxInputTest(p, store, colorScheme),
      // p => BSGridBoxInputTest(p, store, colorScheme),
      p => flexBoxMediaTest(p, store),
      p => markdownTest(p, colorScheme),
      p => katexTest(p, colorScheme),
      p => tableTest(p, store),
      p => iframeTest(p, store),
    ])
  let bottom = bottomTest(scene, store, colorScheme)
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

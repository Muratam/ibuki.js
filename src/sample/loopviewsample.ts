import { Color, ColorScheme } from "../core/color";
import { Box, Scene } from "../core/dom";
import { Text, TextSequence, FixedSizeText } from "../html/text";
import { Input, InputOption, InputType } from "../html/input"
import { FlexBox, Table } from "../html/container"
import { toStore, DataStore } from "../core/store"
import { ProgressBar, MeterBar, IFrame, Image } from "../html/media";
import { FAIcon } from "../widget/external/faicon"
import { MarkDown } from "../widget/external/markdown"
import { Katex } from "../widget/external/katex"
import { ThreeLoopView } from "../widget/loopview"
import "bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
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
  return new Box(p, { textAlign: "left", fontSize: 64, padding: 30 }).tree(p => {
    new Text(p, text)
  })
}

function informationBox(p: Box, store: DataStore): Box {
  return new Box(p, {
    textAlign: "center",
    padding: 30
  }).tree(p =>
    new TextSequence(p, [
      ["information box\n", {}],
      [store.sec.to(x => "Frame : " + x + "\n"), "#afb"],
      [store.pressedKey.to(x => "Key : " + x + "\n"), "#fab"],
      [store.event.to(x => "Mouse : " + x + "\n"), {}],
      p => new FAIcon(p, "faIgloo", { size: 100, color: Color.parse("#fab") }),
    ])
  ).on("mouseover", () => { store.event.set("mouseover") })
    .on("mouseout", () => { store.event.set("mouseout") })
    .on("mousemove", () => { store.event.set("mousemove") })
}
function flexBoxInputTest(p: Box, store: DataStore): Box {
  return new FlexBox(p, {
    flexDirection: "column",
    alignItems: "flex-start",
    padding: 80,
    fontSize: 70
  }).tree(p => {
    new Text(p, "Input with flexBox\n", {})
    function create(type: InputType, option: InputOption) {
      let result = new Input(p, {
        type: type,
        ...option,
        label: p2 => new FixedSizeText(p2, type + "", p.width * 0.4, 20)
      })
      let input = result.value
      new Text(p, input.to(x => "-> " + x), { color: "#fab" })
      return result
    }
    create("text", { size: 10 }).assign(store.inputted)
    create("select", { options: ["e1", "e2", "e3"] })
    create("checkbox", {})
    create("password", { size: 10 })
    create("color", {})
    create("file", {})
    create("time", {})
    create("search", {})
    create("range", {})
  });
}
function flexBoxMediaTest(p: Box, store: DataStore): Box {
  return new FlexBox(p, {
    flexDirection: "column",
    alignItems: "flex-start",
    padding: 80,
    fontSize: 70
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
    padding: 80,
    fontSize: 60
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
    padding: 80,
  }).tree(p => {
    new Text(p, "iframe Test Box\n", {})
    new IFrame(p, { src: "https://www.openstreetmap.org/export/embed.html", height: p.height * 0.7 })
  });
}
function markdownTest(p: Box, store: DataStore): Box {
  return new Box(p, {
    padding: 80,
  }).tree(p => {
    new Text(p, "realtime markdown")
    let text = new Input(p, { type: "textarea" }).value
    new MarkDown(p, text)
  });
}
function katexTest(p: Box, store: DataStore): Box {
  return new Box(p, {
    padding: 80,
  }).tree(p => {
    new Text(p, "realtime katex")
    let text = new Input(p, { type: "textarea" }).value
    new Katex(p, text)
  });
}


function bottomTest(p: Box, store: DataStore, colorScheme: ColorScheme): Box {
  // TODO: show FPS
  return new Box(p, {
    fit: { x: "center", y: "bottom" },
    height: p.height * 0.3,
    colorScheme: colorScheme,
    border: { radius: 10, style: "solid", width: 2 }
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
  let loopView = new ThreeLoopView(backGround, { height: scene.height * 0.7, }, {
    colorScheme: colorScheme,
    border: { width: 20, style: "solid", radius: 30 },
    fontSize: 100,
    fontFamily: "Menlo"
  }).add([
    p => new Image(new Box(p, { padding: 80 }), { src: "https://sagisawa.0am.jp/me.jpg" }),
    p => helloBox(p, store),
    p => informationBox(p, store),
    p => flexBoxInputTest(p, store),
    p => flexBoxMediaTest(p, store),
    p => markdownTest(p, store),
    p => katexTest(p, store),
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

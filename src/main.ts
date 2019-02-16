import * as CSS from "./style";
import { Color, ColorScheme, LinearGradient } from "./color";
import { World, Container } from "./dom";
import { Text, FAIcon, TextSequence, FixedSizeText } from "./widget/text";
import { Input } from "./widget/input"
import { FlexBox, Table } from "./widget/container"
import { Root, range, DataStore, Updator } from "./root"
import { KeyBoard } from "./keyboard"
import { ProgressBar, MeterBar, IFrame, Image } from "./widget/media";
import * as _ from "lodash";
// TODO: animation / tween / effect / widgets / on*
//     : ColorScheme / vividjs / katex / markdown / tips
//     : operation(click/button(?)) / scene / graph(tree/chart) / solver / click(hover) help
//     : bootstrap / webgl(?) / live2d / slider
//     : a / canvas /  input.value(want Proxy)
//     : table はみだし


namespace Ibuki {
  export interface ConversationGameWidgetOption {
    heightPercent: number,
    colorScheme?: ColorScheme
  }
  export class ConversationGameWidget extends Container {
    constructor(parent: Container, option: ConversationGameWidgetOption) {
      let height = Math.floor(parent.height * option.heightPercent)
      super(parent, {
        height: height,
        pos: { y: parent.height - height, x: 0 },
        background: new LinearGradient("left", ["#8ab", "#000"])
      });
    }
  }
}
namespace WorldExample {
  function textSeqWorld() {
    let store: DataStore = {}
    store.n1 = Root.perFrame(10)
    store.k1 = new Root("")
    let world = new World()
    new Container(world, {
      background: Color.parse("#fce"),
      width: world.width * 0.5,
      height: world.height * 0.5,
      isButton: true,
      textAlign: "center",
      isScrollable: true,
      fit: { x: "center", y: "center" }
    }).on("click", () => { console.log(1); })
      .tree(p =>
        new TextSequence(p, [
          ["int main(){\n", { size: 72, fontName: "Menlo" }],
          [store.n1.compute(x => x + "\n"), "#0fb"],
          ["  return;\n", "#ff0"],
          p => new FAIcon(p, "faIgloo", { size: 100, color: Color.parse("#fab") }),
          [store.k1, "#000"],
        ])
      );
    new FlexBox(world, {
      flexDirection: "column",
      alignItems: "flex-start",
      background: Color.parse("#fce"),
      width: world.width * 0.2,
      height: world.height * 0.2,
      fit: { x: "right", y: "center" },
      isScrollable: true
    }).tree(p => {
      store.l1 = new Input(p, { type: "text", label: p2 => new FixedSizeText(p2, "name : ", p.width * 0.4, 20) }).value
      new Input(p, { type: "select", options: ["C#", "C++", "js"], label: p2 => new FixedSizeText(p2, "language : ", p.width * 0.4, 20) })
      new Input(p, { type: "checkbox", label: p2 => new FixedSizeText(p2, store.l1.compute(t => t + "yade"), p.width * 0.4, 20) })
      new Input(p, { type: "checkbox", label: p2 => new FixedSizeText(p2, "js : ", p.width * 0.4, 20) })
      new Input(p, { type: "checkbox", label: p2 => new FixedSizeText(p2, "html : ", p.width * 0.4, 20) })
      new Input(p, { type: "checkbox", label: p2 => new FixedSizeText(p2, "hot : ", p.width * 0.4, 20) })
      new Input(p, { type: "checkbox", label: p2 => new FixedSizeText(p2, "css : ", p.width * 0.4, 20) })
      new Input(p, { type: "checkbox", label: p2 => new FixedSizeText(p2, "js : ", p.width * 0.4, 20) })
      new Input(p, { type: "checkbox", label: p2 => new FixedSizeText(p2, "html : ", p.width * 0.4, 20) })
      new Input(p, { type: "checkbox", label: p2 => new FixedSizeText(p2, "hot : ", p.width * 0.4, 20) })
    });
    new Table(world, {
      background: Color.parse("#fce"),
      width: world.width * 0.2,
      height: world.height * 0.2,
      fit: { x: "left", y: "center" },
      isScrollable: true,
    }, (x, y) => {
      if (y % 2 === 0) return { background: Color.parse("#fff") }
      return { background: Color.parse("#888") }
    }).addContents([
      ["iikanji", store.l1, "year"],
      ["iikanji", p => new FAIcon(p, "faIgloo", { size: 100, color: Color.parse("#fab") }), "year"],
    ])
    store.i1 = new Root(0)
    let i1 = 0
    KeyBoard.onKeyDown(key => {
      store.k1.set(key)
      if (key === "d") store.i1.set(i1++)
      if (key === "a") store.i1.set(i1--)
      i1 = Math.max(0, Math.min(100, i1))
    })
    new Container(world, {
      fit: { y: "bottom", x: "center" },
      height: world.height * 0.2,
      background: new LinearGradient(180, ["#fab", "#afb"])
    }).tree(p => {
      new ProgressBar(p, store.i1, {}, 100)
      new Text(p, store.i1.compute(x => x + "%"))
      new MeterBar(p, store.i1, { min: 0, max: 100, low: 22, high: 66, optimum: 80 })
      // new IFrame(p, { src: "https://www.openstreetmap.org/export/embed.html" })
      new Image(p, { src: "https://sagisawa.0am.jp/me.jpg" })
    })
  }
  textSeqWorld();
  // new ConversationGameWidget(world, { heightPercent: 0.35 })//.text = "Hello World!";
  //  {
  //   let box = new Ibuki.DOM(world, {
  //     border: { color: Color.parse("#0a0"), width: 10, style: "solid", radius: 10 },
  //     // padding: 10,
  //     // margin: 20,
  //     height: 100,
  //   });
  //   box.$dom.innerText = "aaaaaa";
  // }
}

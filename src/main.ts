import * as CSS from "./style";
import { Color, ColorScheme, LinearGradient } from "./color";
import { World, Container } from "./dom";
import { Text, TextSequence, FixedSizeText } from "./widget/text";
import { Input } from "./widget/input"
import { FlexBox, Table } from "./widget/container"
import { Root, range, DataStore, Updator } from "./root"
import { KeyBoard } from "./keyboard"
import { ProgressBar, MeterBar, IFrame, Image } from "./widget/media";
import { FAIcon } from "./widget/external"
import * as _ from "lodash";

// TODO: animation / tween / scene / effect
// ext : vividjs / katex / markdown / live2d / graph(tree/chart)
//     : ColorScheme / tips / click(hover)
//     : bootstrap / webgl(?) / canvas
//     : a / table はみだし


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
    let center = new Container(world, {
      background: Color.parse("#fce"),
      isButton: true,
      scale: 0.5,
      fontSize: 100,
      textAlign: "center",
      isScrollable: true,
      fit: { x: "center", y: "center" }
    }).tree(p =>
      new TextSequence(p, [
        ["int main(){\n", { fontName: "Menlo" }],
        [store.n1.compute(x => x + "\n"), "#0fb"],
        ["  return;\n", "#ff0"],
        p => new FAIcon(p, "faIgloo", { size: 100, color: Color.parse("#fab") }),
        [store.k1, "#000"],
      ])
    );
    new FlexBox(world, {
      flexDirection: "column",
      alignItems: "flex-start",
      background: Color.parse("#fab"),
      scale: 0.2,
      fontSize: 100,
      draggable: true,
      fit: { x: "right", y: "center" },
      isScrollable: true
    }).tree(p => {
      store.l1 = new Input(p, { type: "text", size: 10, label: p2 => new FixedSizeText(p2, "name : ", p.width * 0.5, 20) }).value
      new Input(p, { type: "select", options: ["C#", "C++", "js"], label: p2 => new FixedSizeText(p2, "language : ", p.width * 0.5, 20) })
      new Input(p, { type: "checkbox", label: p2 => new FixedSizeText(p2, store.l1.compute(t => t + "yade"), p.width * 0.5, 20) })
    }).on("click", () => { console.log(1); });
    new Table(world, {
      background: Color.parse("#fce"),
      scale: 0.2,
      fontSize: 100,
      fit: { x: "left", y: "center" },
      isScrollable: true,
    }, (x, y) => {
      if (y % 2 === 0) return { background: Color.parse("#fff") }
      return { background: Color.parse("#888") }
    }).addContents([
      ["iikanji", store.l1, "year"],
      ["iikanji", p => new FAIcon(p, "faIgloo", { size: 100, color: Color.parse("#fab") }), "year"],
      ["iikanji", p => new FAIcon(p, "faIgloo", { size: 100, color: Color.parse("#fab") }), "year"],
      ["iikanji", p => new FAIcon(p, "faIgloo", { size: 100, color: Color.parse("#fab") }), "year"],
      ["iikanji", p => new FAIcon(p, "faIgloo", { size: 100, color: Color.parse("#fab") }), "year"],
      ["iikanji", p => new FAIcon(p, "faIgloo", { size: 100, color: Color.parse("#fab") }), "year"],
      ["iikanji", store.l1, "year"],
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

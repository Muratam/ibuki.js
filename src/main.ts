import * as CSS from "./style";
import { Color, ColorScheme, LinearGradient } from "./color";
import { World, Container } from "./dom";
import { Text, TextSequence, FixedSizeText } from "./widget/text";
import { Input } from "./widget/input"
import { FlexBox, Table } from "./widget/container"
import { Root, DataStore, Updator } from "./root"
import { KeyBoard } from "./keyboard"
import { ProgressBar, MeterBar, IFrame, Image } from "./widget/media";
import { FAIcon } from "./widget/external"
import * as _ from "lodash";

// TODO: scene(destroy?) / effect
// ext : vividjs / katex / markdown / live2d / graph(tree/chart) / svgjs / code
//     : ColorScheme(@DOMOption) / tips / click(hover)
//     : bootstrap / webgl(?) / canvas
//     : a-href / table はみだし
//     : コメント流れる
// colorSchemeLib は色を決めるのに使う

namespace Ibuki {
  // export interface ConversationGameWidgetOption {
  //   heightPercent: number,
  //   colorScheme?: ColorScheme
  // }
  // export class ConversationGameWidget extends Container {
  //   constructor(parent: Container, option: ConversationGameWidgetOption) {
  //     let height = Math.floor(parent.height * option.heightPercent)
  //     super(parent, {
  //       height: height,
  //       pos: { y: parent.height - height, x: 0 },
  //       background: new LinearGradient("left", ["#8ab", "#000"])
  //     });
  //   }
  // }
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
namespace WorldExample {
  function textSeqWorld() {
    let store: DataStore = {}
    store.n1 = Root.perFrame(10)
    store.k1 = new Root<string>("")
    let world = new World()
    let center = new Container(world, {
      // border: { width: 10 },
      colorScheme: new ColorScheme("#fce", "#876"),
      scale: 0.5,
      fontSize: 100,
      textAlign: "center",
      isScrollable: true,
      draggable: true,
      fit: { x: "center", y: "center" }
    }).tree(p =>
      new TextSequence(p, [
        ["int main(){\n", { fontName: "Menlo" }],
        [store.n1.to(x => x + "\n"), "#0fb"],
        ["  return;\n", "#ff0"],
        p => new FAIcon(p, "faIgloo", { size: 100, color: Color.parse("#fab") }),
        [store.k1, "#000"],
      ])
    ).startAnimation({
      duration: 1, iterationCount: "infinite", direction: "alternate"
    }, {
        width: world.width * 0.8,
        scale: 0.5,
      });
    let clickCount = 0;
    new FlexBox(world, {
      flexDirection: "column",
      alignItems: "flex-start",
      colorScheme: new ColorScheme("#fce", "#034"),
      scale: 0.2,
      isButton: true,
      fontSize: 100,
      fit: { x: "right", y: "center" },
      isScrollable: true
    }).tree(p => {
      store.l1 = new Input(p, { type: "text", size: 10, label: p2 => new FixedSizeText(p2, "name : ", p.width * 0.5, 20) }).value
      new Input(p, { type: "select", options: ["C#", "C++", "js"], label: p2 => new FixedSizeText(p2, "language : ", p.width * 0.5, 20) })
      new Input(p, { type: "checkbox", label: p2 => new FixedSizeText(p2, store.l1.to(t => t + "yade"), p.width * 0.5, 20) })
    }).on("click", function () {
      clickCount++;
      if (clickCount === 1) this.to({ fit: { x: "right", y: "center" } }, 5)
      if (clickCount === 2) this.to({ fit: { x: "left", y: "center" } }, 5)
    });
    new Table(world, {
      colorScheme: new ColorScheme("#fce", "#034"),
      scale: 0.2,
      fontSize: 100,
      fit: { x: "left", y: "center" },
      isScrollable: true,
    }, (x, y) => {
      if (y % 2 === 0) return { colorScheme: new ColorScheme("#fce", "#034") }
      return { colorScheme: new ColorScheme("#fce", "#034") }
    }).addContents([
      ["iikanji", store.l1, "year"],
      ["iikanji", p => new FAIcon(p, "faIgloo", {}), "year"],
      ["iikanji", p => new FAIcon(p, "faIgloo", {}), "year"],
      ["iikanji", p => new FAIcon(p, "faIgloo", {}), "year"],
      ["iikanji", p => new FAIcon(p, "faIgloo", {}), "year"],
      ["iikanji", p => new FAIcon(p, "faIgloo", {}), "year"],
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
      colorScheme: new ColorScheme("#fce", "#034"),
    }).tree(p => {
      new ProgressBar(p, store.i1, {}, 100)
      new Text(p, store.i1.to(x => x + "%"))
      new MeterBar(p, store.i1, { min: 0, max: 100, low: 22, high: 66, optimum: 80 })
      new IFrame(p, {
        src: "https://www.openstreetmap.org/export/embed.html",
        width: p.width * 0.7, fit: { y: "top", x: "right" },
      })
      new Image(p, { src: "https://sagisawa.0am.jp/me.jpg" })
    })
  }
  textSeqWorld();
}

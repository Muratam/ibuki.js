import * as CSS from "./style";
import { Color, ColorScheme, LinearGradient } from "./color";
import { WorldBox, Box, iota } from "./dom";
import { Text, FAIcon, TextSequence, FixedSizeText } from "./widget/text";
import { Input } from "./widget/input"
import { FlexBox, Table } from "./widget/container"
// TODO: animation / tween / effect / widgets / on* / requestAnimationFrame
//     : ColorScheme / vividjs / katex / markdown / tips
//     : operation(click/button(?)) / scene / graph(tree/chart) / solver / click(hover) help
//     : bootstrap / webgl(?) / live2d / slider
//     : a / canvas /  input.value(want Proxy)
import * as _ from "lodash";

namespace Ibuki { // animation
  export interface Tween {

  }
}

namespace Ibuki {
  export interface ConversationGameWidgetOption {
    heightPercent: number,
    colorScheme?: ColorScheme
  }
  export class ConversationGameWidget extends Box {
    constructor(parent: Box, option: ConversationGameWidgetOption) {
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
    let world = new WorldBox()
    let center = new Box(world, {
      background: Color.parse("#fce"),
      width: world.width * 0.5,
      height: world.height * 0.5,
      isButton: true,
      textAlign: "right",
      fit: { x: "center", y: "center" }
    }).on("click", () => { console.log(1); });
    new TextSequence(center, [
      ["int main(){\n", { size: 72, fontName: "Menlo" }],
      ["  printf();\n", "#0fb"],
      ["  return;\n", "#ff0"],
      p => new FAIcon(p, "faIgloo", { size: 100, color: Color.parse("#fab") }),
      ["}", "#000"],
    ])
    new FlexBox(world, {
      flexDirection: "column",
      alignItems: "flex-start",
      background: Color.parse("#fce"),
      width: world.width * 0.2,
      height: world.height * 0.2,
      fit: { x: "right", y: "center" },
      isScrollable: true
    }).tree(p => {
      new Input(p, { type: "text", label: p2 => new FixedSizeText(p2, "name : ", p.width * 0.4, 20) })
      new Input(p, { type: "select", options: ["C#", "C++", "js"], label: p2 => new FixedSizeText(p2, "language : ", p.width * 0.4, 20) })
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
    }, (x, y) => {
      if (y % 2 === 0) return { background: Color.parse("#fff") }
      return { background: Color.parse("#888") }
    }).addContents([
      ["iikanji", "yatteiki", "year"],
      ["iikanji", p => new FAIcon(p, "faIgloo", { size: 100, color: Color.parse("#fab") }), "year"],
    ])
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

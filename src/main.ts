import * as CSS from "./style";
import { Color, ColorScheme, LinearGradient } from "./color";
import { World, Box } from "./dom";
import { Text, FAIcon, TextSequence } from "./widget/text";

// TODO: animation / tween / effect / widgets / on* / requestAnimationFrame
//     : ColorScheme / image tag  / vividjs / katex / markdown / table
//     : operation(click/button(?)) / scene / graph(tree/chart) / solver / click(hover) help
//     : inputfield / button / bootstrap / webgl(?) / live2d
import * as _ from "lodash";

namespace Ibuki { // animation
  export interface Tween {

  }
}

namespace Ibuki { // Widget

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
    let world = new World()
    let center = new Box(world, {
      background: Color.parse("#fce"),
      width: world.width * 0.5,
      height: world.height * 0.5,
      fit: { x: "center", y: "center" }
    });
    new TextSequence(center, [
      ["int main(){\n", { size: 72, fontName: "Menlo" }],
      ["  printf();\n", "#0fb"],
      ["  return;\n", "#ff0"],
      (p: Box) => new FAIcon(p, "faIgloo", { size: 100, color: Color.parse("#fab") }),
      ["}", "#000"],
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

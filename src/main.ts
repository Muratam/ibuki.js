import * as CSS from "./style";
import { Color, ColorScheme, LinearGradient } from "./color";
import { World, Box } from "./dom";
import { Text } from "./widget/text";
// TODO: animation / tween / background / effect / widgets / on* / requestAnimationFrame
//     : ColorScheme / Gradation
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
      super(parent, {
        height: parent.height * option.heightPercent,
        pos: { y: parent.height * (1 - option.heightPercent), x: 0 },
        background: new LinearGradient("left", ["#8ab", "#000"])
      });
    }
  }
}

namespace Ibuki { // other
  export interface OperationOption { }
}
namespace Ibuki {
  let world = new World()
  let scrollable = new Box(world, { overflow: "scroll" })
  let text = new Text(scrollable, "iikanji", {
    size: 100,
    color: Color.parse("#fab"),
    fontName: "Hiragino Maru Gothic Pro",
    edge: {
      color: Color.parse("#000"), width: 3
    }
  });
  let text2 = new Text(scrollable, "iikanji", {
    size: 40,
    color: Color.parse("#fab"),
    fontName: "Hiragino Maru Gothic Pro",
  });
  for (let i = 0; i < 1000; i++)text.text += i + " ";
  // new ConversationGameWidget(world, { heightPercent: 0.3 });
  //.text = "Hello World!";
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
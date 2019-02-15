import * as CSS from "./style";
import { Color, ColorScheme } from "./color";
import { World, DOM } from "./dom";

// TODO: animation / tween / background / effect / widgets / on* / requestAnimationFrame
//     : ColorScheme / Gradation
import * as _ from "lodash";
namespace Ibuki { // animation
  export interface Tween {

  }
}

namespace Ibuki { // Widget
  export interface Text {
    text: string
    size?: number
    fontName?: string
    color?: Color
    isBold?: boolean
    edgeColor?: Color
  }
  export class ConversationGameWidget extends DOM {
    constructor(parent: DOM, option: {
      heightPercent: number,
      colorScheme?: ColorScheme
    }) {
      super(parent, {
        height: parent.height * option.heightPercent,
        pos: { y: parent.height * (1 - option.heightPercent), x: 0 }
      });
      this.applyStyle({
        "background-color": Color.parse("#fab")
      })
    }
    private $text: string;
    get text(): string { return this.$text; }
    set text(val: string) {
      this.$text = val;
      this.$dom.innerText = val;
    }
  }
}

namespace Ibuki { // other
  export interface OperationOption { }
}
namespace Ibuki {
  let world = new World()
  new ConversationGameWidget(world, { heightPercent: 0.5 }).text = "Hello World!";
  // for (let i = 0; i < 10; i++) {
  //   let box = new Ibuki.DOM(world, {
  //     border: { color: Color.parse("#0a0"), width: 10, style: "solid", radius: 10 },
  //     // padding: 10,
  //     // margin: 20,
  //     height: 100,
  //   });
  //   box.$dom.innerText = "aaaaaa";
  // }
}
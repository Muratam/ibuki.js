import * as CSS from "./style";
import { Color, ColorScheme, LinearGradient } from "./color";
import { World, Box, iota } from "./dom";
import { Text, FAIcon, TextSequence } from "./widget/text";
import { Input } from "./widget/input"
// TODO: animation / tween / effect / widgets / on* / requestAnimationFrame
//     : ColorScheme / image tag  / vividjs / katex / markdown / table / tips
//     : operation(click/button(?)) / scene / graph(tree/chart) / solver / click(hover) help
//     : inputfield / bootstrap / webgl(?) / live2d / slider
//     : <progress> // a / progress / canvas / table
// MEDIA :: audio / img / video / iframe / progress / meter /

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
    let world = new World()
    let center = new Box(world, {
      background: Color.parse("#fce"),
      width: world.width * 0.5,
      height: world.height * 0.5,
      isButton: true,
      fit: { x: "center", y: "center" }
    }).on("click", () => { console.log(1); });
    new TextSequence(center, [
      ["int main(){\n", { size: 72, fontName: "Menlo" }],
      ["  printf();\n", "#0fb"],
      ["  return;\n", "#ff0"],
      p => new FAIcon(p, "faIgloo", { size: 100, color: Color.parse("#fab") }),
      ["}", "#000"],
    ])
    new Box(world, {
      background: Color.parse("#fce"),
      width: world.width * 0.2,
      height: world.height * 0.2,
      fit: { x: "right", y: "center" },
      isScrollable: true
    }).tree(p => {
      new TextSequence(p, [
        p => new Input(p, { type: "text", label: p => new Text(p, "namedayo") }),
        "\n",
        p => new Input(p, { type: "select", options: ["C#", "C++", "js"], label: "lang : " }),
        "\n",
        p => new Input(p, { type: "checkbox", label: "css : " }),
        "\n",
        p => new Input(p, { type: "checkbox", label: "js : " }),
        "\n",
        p => new Input(p, { type: "checkbox", label: "html : " }),
        "\n",
        p => new Input(p, { type: "checkbox", label: "html : " }),
        "\n",
      ])
      // world.$dom.
      // new InputBox(this, { type: "password" }, { height: 10 })
      // new Text(this, "iikanji", { size: 10 })
      // new InputBox(this, { type: "textarea" }, { height: this.height * 0.5 })
      // new InputBox(this, { type: "textarea" }, { height: this.height * 0.5 })
    });
    /*

    <div>
      <input id="html" name="html" type="checkbox" />
      <label for="html">HTML</label>
    </div>

    <div>
      <input id="css" name="css" type="checkbox" />
      <label for="css">CSS</label>
    </div>

    <div>
      <input id="javascript" name="javascript" type="checkbox" />
      <label for="javascript">JavaScript</label>
    </div>
    */

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

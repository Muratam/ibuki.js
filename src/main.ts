import * as CSS from "./style";
import { Color, ColorScheme, LinearGradient } from "./color";
import { World, Container, Box, BoxOption } from "./dom";
import { Text, TextSequence, FixedSizeText } from "./widget/text";
import { Input } from "./widget/input"
import { FlexBox, Table } from "./widget/container"
import { Root, DataStore, Updator } from "./root"
import { KeyBoard } from "./keyboard"
import { ProgressBar, MeterBar, IFrame, Image } from "./widget/media";
import { FAIcon } from "./widget/external"

// TODO: scene(destroy?) / effect / colorscheme bug
// ext : vividjs / katex / markdown / live2d / graph(tree/chart) / svgjs / code
//     : tips / click(hover) / media(image size bug(反映の形式を考慮))
//     : bootstrap / webgl(?) / canvas / drag and drop / vue.js / react.js / jquery
//     : a-href / table はみだし
//     : コメント流れる
//     : {scale / width / height } tree - flow
// colorSchemeLib は色を決めるのに使う
// isButton を hover時におこなう関数に変えたい.
// width に自動で(scaleが)フィットしてheightが無限大(になりうる)モードがあるといいかんじっぽい？

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
  function createElem1(parent: Container, option: BoxOption, store: DataStore): Box {
    return new FlexBox(parent, {
      ...option,
      flexDirection: "column",
      alignItems: "flex-start",
      colorScheme: new ColorScheme("#fce", "#034"),
      isButton: true,
      fontSize: 100,
      isScrollable: true
    }).tree(p => {
      new Input(p, { type: "text", size: 10, label: p2 => new FixedSizeText(p2, "name : ", p.width * 0.5, 20) }).assign(store.inputted)
      new Input(p, { type: "select", options: ["C#", "C++", "js"], label: p2 => new FixedSizeText(p2, "language : ", p.width * 0.5, 20) })
      new Input(p, { type: "checkbox", label: p2 => new FixedSizeText(p2, store.inputted.to(t => t + "yade"), p.width * 0.5, 20) })
    });
  }
  function createElem2(parent: Container, option: BoxOption, store: DataStore): Box {
    return new Container(parent, {
      // border: { width: 10 },
      ...option,
      colorScheme: new ColorScheme("#fce", "#876"),
      fontSize: 100,
      textAlign: "center",
      isScrollable: true,
      draggable: true,
    }).tree(p =>
      new TextSequence(p, [
        ["int main(){\n", { fontName: "Menlo" }],
        [store.sec.to(x => x + "\n"), "#0fb"],
        ["  return;\n", "#ff0"],
        p => new FAIcon(p, "faIgloo", { size: 100, color: Color.parse("#fab") }),
        [store.pressedKey, "#000"],
      ])
    )
  }
  function createElem3(parent: Container, option: BoxOption, store: DataStore): Box {
    return new Table(parent, {
      ...option,
      colorScheme: new ColorScheme("#fce", "#034"),
      fontSize: 100,
      isScrollable: true,
    }, (x, y) => {
      if (y % 2 === 0) return { colorScheme: new ColorScheme("#fce", "#034") }
      return { colorScheme: new ColorScheme("#fce", "#034") }
    }).addContents([
      ["iikanji", store.inputted, "year"],
      ["iikanji", p => new FAIcon(p, "faIgloo", {}), "year"],
      ["iikanji", p => new FAIcon(p, "faIgloo", {}), "year"],
      ["iikanji", p => new FAIcon(p, "faIgloo", {}), "year"],
      ["iikanji", p => new FAIcon(p, "faIgloo", {}), "year"],
      ["iikanji", p => new FAIcon(p, "faIgloo", {}), "year"],
      ["iikanji", store.inputted, "year"],
    ])
  }
  function createElem4(parent: Container, option: BoxOption, store: DataStore): Box {
    let clickCount = 0;
    return new Container(parent, {
      ...option,
      fit: { y: "bottom", x: "center" },
      height: parent.height * 0.2,
      colorScheme: new ColorScheme("#fce", "#034"),
      isScrollable: true
    }).tree(p => {
      new ProgressBar(p, store.posX, {}, 100)
      new Text(p, store.posX.to(x => x + "%"))
      new MeterBar(p, store.posX, { min: 0, max: 100, low: 22, high: 66, optimum: 80 })
      new IFrame(p, {
        src: "https://www.openstreetmap.org/export/embed.html",
        width: p.width * 0.7, fit: { y: "top", x: "right" },
      }).repeat({ duration: 1 }, { width: p.width * 0.8, fit: { y: "top", x: "right" } });
      new Image(p, { src: "https://sagisawa.0am.jp/me.jpg" })
    }).on("click", function () {
      clickCount++;
      if (clickCount % 2 === 1)
        this
          .to({
            fit: { x: "right", y: "center" },
          }, 0.5)
          .next({ fit: { x: "right", y: "top" } }, 0.5)
          .next({
            colorScheme: "#000-#fff" // WARN:
          }, 1)
      if (clickCount % 2 === 0)
        this.to({ fit: { x: "right", y: "bottom" } }, 1)
    })
  }
  function threeBoxWorld() {
    // store:TODO:登録した順番で変わる可能性が高いのでマージをしたい(createElemの順番で変更されないように)
    let store: DataStore = {
      sec: Root.perFrame(10),
      pressedKey: new Root(""),
      posX: new Root(0),
      inputted: new Root(""),
    }
    // position
    let boxes: BoxOption[] = [{
      scale: 0.2,
      fit: { x: "right", y: "center" },
      zIndex: 1
    }, {
      scale: 0.5,
      fit: { x: "center", y: "center" },
      zIndex: 10
    }, {
      scale: 0.2,
      fit: { x: "left", y: "center" },
      zIndex: 1
    }]
    // create world
    let world = new World()
    let treeView = new Container(world, { height: world.height * 0.5 })

    let e1 = createElem3(treeView, boxes[0], store)
    let e2 = createElem2(treeView, boxes[1], store)
    let e3 = createElem1(treeView, boxes[2], store)
    let bottom = createElem4(world, {}, store)
    // keyboard test
    let i1 = 0
    KeyBoard.onKeyDown(key => {
      store.pressedKey.set(key)
      let leftKey = "ArrowLeft"
      let rightKey = "ArrowRight"
      if (key === rightKey) store.posX.set(i1++)
      if (key === leftKey) store.posX.set(i1--)
      i1 = Math.max(0, Math.min(100, i1))
      if (key !== rightKey && key !== leftKey) return;
      e1.to(boxes[(i1 + 0) % 3])
      e2.to(boxes[(i1 + 1) % 3])
      e3.to(boxes[(i1 + 2) % 3])
    })
  }
  threeBoxWorld();
}

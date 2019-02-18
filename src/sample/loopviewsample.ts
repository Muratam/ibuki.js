import { Color, ColorScheme } from "../core/color";
import { Box, BoxOption, Scene } from "../core/dom";
import { Text, TextSequence, FixedSizeText } from "../html/text";
import { Input } from "../html/input"
import { FlexBox, Table } from "../html/container"
import { toStore } from "../core/store"
import { ProgressBar, MeterBar, IFrame, Image } from "../html/media";
import { FAIcon } from "../widget/external/faicon"
import { ThreeLoopView } from "../widget/loopview"


export function threeBoxSampleScene(scene: Scene) {
  let store = {
    inputted: toStore(""),
    sec: scene.perFrame(10),
    pressedKey: toStore(""),
    posX: toStore(0)
  }
  function createElem1(p: Box): Box {
    return new FlexBox(p, {
      flexDirection: "column",
      alignItems: "flex-start",
    }).tree(p => {
      new Input(p, { type: "text", size: 10, label: p2 => new FixedSizeText(p2, "name : ", p.width * 0.5, 20) }).assign(store.inputted)
      new Input(p, { type: "select", options: ["C#", "C++", "js"], label: p2 => new FixedSizeText(p2, "language : ", p.width * 0.5, 20) })
      new Input(p, { type: "checkbox", label: p2 => new FixedSizeText(p2, store.inputted.to(t => t + "yade"), p.width * 0.5, 20) })
    });
  }
  function createElem2(p: Box): Box {
    return new Box(p, {
      textAlign: "center",
      draggable: true,
    }).tree(p =>
      new TextSequence(p, [
        ["int main(){\n", { fontName: "Menlo" }],
        [store.sec.to(x => x + "\n"), "#0fb"],
        ["  return;\n", "#ff0"],
        p => new FAIcon(p, "faIgloo", { size: 100, color: Color.parse("#fab") }),
        [store.pressedKey, "#000"],
      ])
    ) // .to({ colorScheme: new ColorScheme("#000") }, 10)
  }
  function createElem3(p: Box): Box {
    return new Table(p, {}, (x, y) => {
      if (y % 2 === 0) return { colorScheme: new ColorScheme("#fce", "#034") }
      return {}
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
  function createElem4(p: Box, option: BoxOption): Box {
    return new Box(p, {
      ...option,
      fit: { x: "center", y: "bottom" },
      height: p.height * 0.2,
      width: p.width * 0.2,
      scale: 0.8
    }).tree(p => {
      new ProgressBar(p, store.posX, {}, 100)
      new Text(p, store.posX.to(x => x + "%"))
      new MeterBar(p, store.posX, { min: 0, max: 100, low: 22, high: 66, optimum: 80 })
    }).on("click", function () {
      this
        .to({
          fit: { x: "center", y: "center" },
        }, 0.5)
        .next({ fit: { x: "center", y: "top" } }, 0.5)
        .next({
          colorScheme: new ColorScheme("#000", "#fff", "#888")
        }, 1)
        .next({ fit: { x: "right", y: "top" } }, 0.5)
        .next({ fit: { x: "right", y: "center" } }, 0.5)
        .next({ fit: { x: "right", y: "bottom" } }, 0.5)
        .next({ fit: { x: "left", y: "top" } }, 0.5)
        .next({ fit: { x: "left", y: "center" } }, 0.5)
        .next({ fit: { x: "left", y: "bottom" } }, 0.5)
        .next({ fit: { x: "center", y: "bottom" } }, 0.5)
        .next({
          colorScheme: new ColorScheme("#fff", "#000", "#888")
        }, 1)
    }).update(function () { })
  }
  let back = new Box(scene, {
    colorScheme: new ColorScheme("#555")
  })
  let loopView = new ThreeLoopView(back, {
    height: scene.height * 0.7,
  }, {
      // padding: 30,
      colorScheme: new ColorScheme("#222", "#cdf", "#89d"),
      border: { width: 20, style: "solid", radius: 30 },
      fontSize: 100,
      isScrollable: true,
    }).add([
      createElem3, createElem2, createElem1,
      p => new Image(p, { src: "https://sagisawa.0am.jp/me.jpg" }),
      p => new IFrame(p, { src: "https://www.openstreetmap.org/export/embed.html" }),
      p => new IFrame(p, {
        src: "https://www.openstreetmap.org/export/embed.html",
        width: p.width * 0.7,
      })
    ])
  let wait = 0
  scene.update(() => { wait--; })
  scene.on("keydownall", key => {
    let last = ""
    for (let k in key) last = k
    if (last !== "") store.pressedKey.set(last)
    if (key.d) {
      scene.destroy();
      scene.gotoNextScene(threeBoxSampleScene)
      return;
    }
    if (wait > 0) return;
    if (key.ArrowRight) {
      store.posX.set((x: number) => x + 1)
      loopView.turn(1)
      wait = 20
    } else if (key.ArrowLeft) {
      store.posX.set((x: number) => x - 1)
      loopView.turn(-1)
      wait = 20
    }
  })
  let bottom = createElem4(back, {
    colorScheme: new ColorScheme("#444", "#cdf", "#89d"),
  })
  new Box(scene, { width: 100, height: 100 }).to({})
  //.repeatAtHover({ top: -0.1, height: 0.9 }, 0.5).repeat({ scale: 0.9 }, {}, 1)
}

// try
// new World().play(scene => threeBoxSampleScene(scene, threeLoopViewStore))

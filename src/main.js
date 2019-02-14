import * as Ibuki from "./ibuki";
// import "svg.js";
class SVGCanvas extends Ibuki.DOM {
  static style = {
    // width: "100%",
    // height: "100%",
    font: {
      color: "#000000",
    },
    background: `linear-gradient(#ffffff,#9eceee)`,
  }
  static attribute = {
    tag: "svg",
    x: "0",
    y: "0",
    width: "20",
    height: "20",
    xmlns: "http://www.w3.org/2000/svg",
    version: "1.1",
  }
  static callAtOnce() {
    Ibuki.Style.$instance.regist(`
    body { margin:0px;padding 0px; }
     *   { box-sizing: border-box; }
    html,body { height: 100%; }
    `);
  }
};
class SVGElem extends Ibuki.DOM {
  static attribute = {
    tag: "rect",
    x: "5",
    y: "5",
    width: "30",
    height: "30",
    stroke: "black",
    fill: "#fff",
    "stroke-width": "2",
  }
}

let svgCanvas = new SVGCanvas();
new SVGElem(svgCanvas);
// SVG(svgCanvas.$dom).rect(100, 100).fill("#f06");
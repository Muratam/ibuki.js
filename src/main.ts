// core
export * from "./core/style";
export * from "./core/color";
export * from "./core/dom";
export * from "./core/store";
// html
export * from "./html/text"
export * from "./html/input"
export * from "./html/container"
export * from "./html/media"
// widgets
export * from "./widget/loopview"
export * from "./widget/external/faicon"
export * from "./widget/external/markdown"
export * from "./widget/external/katex"
// sample scenes
import { World } from "./core/dom"
import { threeBoxSampleScene } from "./sample/loopviewsample"

// fun  : effect boxshadow
// ext  : graph(tree/chart) / vividjs svgjs code-highlight / nene
//      : bootstrap =>size(input/progressbar)bug / tips
// impl : drag and drop / a-href / colorSchemeLib
// ???? : worldにて、width に自動で(scaleが)フィットしてheightが無限大(になりうる)
//      : モードがあるとゲーム以外にも使える？(height可変はむずいのでは？)
let world = new World().play(threeBoxSampleScene)
// bootstrap -> effect <-> 弾幕画報 -> 超人録
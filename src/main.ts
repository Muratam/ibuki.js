// core
export * from "./core/style";
export * from "./core/color";
export * from "./core/store";
export * from "./core/static"
export * from "./core/dom"; // x
// html
export * from "./html/input"
export * from "./html/container"
export * from "./html/media"
export * from "./html/notice"
// widgets
// export * from "./widget/loopview"
// export * from "./widget/external/faicon"
// export * from "./widget/external/markdown"
// export * from "./widget/external/katex"
// sample scenes
import { World } from "./core/dom"
import { threeBoxSampleScene } from "./sample/loopviewsample"

// ext  : effect graph(tree/chart) nene
// impl : drag and drop
// ???? : worldにて、width に自動で(scaleが)フィットしてheightが無限大(にpなりうる)
//      : モードがあるとゲーム以外にも使える？(height可変はむずいのでは？)
// bootstrap -> effect <-> 弾幕画報 -> 超人録
// PIXI.js && THREE.js も同じ枠組みで適用したら
// fitwidthなButton/DropDownをBootStrapに頼らない形で作成すべき.
let world = new World().play(threeBoxSampleScene)




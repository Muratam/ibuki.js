// core
export * from "./core/style";
export * from "./core/color";
export * from "./core/dom";
export * from "./core/store";
// widgets
export * from "./widget/text"
export * from "./widget/input"
export * from "./widget/container"
export * from "./widget/media"
export * from "./widget/external"

import { World } from "./core/dom"
import { threeBoxSampleScene, threeLoopViewStore } from "./example/loopview"

// fun  : effect
//      : big inputbox(selectbox) / progress bar
// ext  : vividjs / katex / markdown / live2d / graph(tree/chart) / svgjs / code
//      : tips / bootstrap / vue.js / react.js / jquery / niconicocomment
// bug  : media(image size bug(style/attrs)) / rotate
// impl : webgl(?) / canvas / drag and drop / a-href
//      : colorSchemeLib
// ???? : worldにて、width に自動で(scaleが)フィットしてheightが無限大(になりうる)モードがあるとゲーム以外にも使える？(height可変はむずいのでは？)

let world = new World().play(scene => threeBoxSampleScene(scene, threeLoopViewStore))

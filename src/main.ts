// core
export * from "./core/style"
export * from "./core/color"
export * from "./core/store"
export * from "./core/static"
export * from "./core/dom" // x
// html
export * from "./html/input"
export * from "./html/container"
export * from "./html/media"
export * from "./html/notice"
// widgets
export * from "./widget/loopview"
export * from "./widget/external/faicon"
export * from "./widget/external/markdown"
export * from "./widget/external/katex"
// sample scenes
import { World } from "./core/dom"
import { threeBoxSampleScene } from "./sample/loopviewsample"

// -> 弾幕画報 -> 超人録
// onDrag(function(x,y){ this.x = x;this.y = y; }) みたいにできると嬉しい.
// state a system for loopview
// TODO: access and changeable {filter,zIndex,colorScheme :: 親まで遡る必要があるかも}
// TODO: Change Box -> Container (image に input は入れられないため)
// Library としてそろそろnpmに置いてもいいかも
// --save-dev : {plotly,vis}.js , (markdown,katex)　はサンプルとして分離
let world = new World().play(threeBoxSampleScene)

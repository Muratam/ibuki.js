import * as I from "./"
// -> 弾幕画報 -> 超人録
// state a system for loopview
// TODO: access and changeable {filter,zIndex,colorScheme :: 親まで遡る必要があるかも}
// TODO: Change Box -> Container (image に input は入れられないため)
// Library としてそろそろnpmに置いてもいいかも
// --save-dev : {plotly,vis}.js , (markdown,katex)　はサンプルとして分離
if (require.main == module) {
  const sample = require("./sample/loopviewsample")
  let world = new I.World().play(sample.threeBoxSampleScene)
}

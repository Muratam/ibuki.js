import * as I from "./"
// -> 弾幕画報 -> 超人録
// {plotly,vis}.js / effect
if (require.main == module) {
  const sample = require("./sample/loopviewsample")
  let world = new I.World().play(sample.threeBoxSampleScene)
}

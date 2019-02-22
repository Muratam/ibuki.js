import * as I from "./"
// 弾幕画報 -> 超人録
if (require.main == module) {
  new I.World().play(require("./sample/loopviewsample").threeBoxSampleScene)
}

import * as I from "../src/index";
let katexTranslater = require("katex")

export class Katex extends I.DOM {
  constructor(parent: I.DOM, markdown: I.MayStore<string>, option?: I.BoxOption) {
    super(parent, "span")
    if (typeof markdown === "string")
      this.$dom.innerHTML = katexTranslater.renderToString(markdown, {
        throwOnError: false
      })
    else markdown.regist(x => {
      this.$dom.innerHTML = katexTranslater.renderToString(x, {
        throwOnError: false
      })
    })
  }
}

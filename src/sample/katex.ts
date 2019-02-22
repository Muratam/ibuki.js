import { DOM, DOMOption, BoxOption, MayStore } from "..";
let katexTranslater = require("katex")

export class Katex extends DOM {
  constructor(parent: DOM, markdown: MayStore<string>, option?: BoxOption) {
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

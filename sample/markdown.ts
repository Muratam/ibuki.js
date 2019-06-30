import * as I from "../src/";
let markdownTranslater = require("markdown").markdown;

export class MarkDown extends I.DOM {
  constructor(parent: I.DOM, markdown: I.MayStore<string>, option?: I.BoxOption) {
    super(parent, "span")
    if (typeof markdown === "string")
      this.$dom.innerHTML = markdownTranslater.toHTML(markdown)
    else markdown.regist(x => {
      this.$dom.innerHTML = markdownTranslater.toHTML(x)
    })
  }
}

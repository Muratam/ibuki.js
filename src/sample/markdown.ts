import { DOM, DOMOption, BoxOption, MayStore } from "..";
let markdownTranslater = require("markdown").markdown;

export class MarkDown extends DOM {
  constructor(parent: DOM, markdown: MayStore<string>, option?: BoxOption) {
    super(parent, "span")
    if (typeof markdown === "string")
      this.$dom.innerHTML = markdownTranslater.toHTML(markdown)
    else markdown.regist(x => {
      this.$dom.innerHTML = markdownTranslater.toHTML(x)
    })
  }
}

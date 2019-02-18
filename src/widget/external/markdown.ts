import { DOM, DOMOption, BoxOption } from "../../core/dom";
import { MayStore } from "../../core/store";
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
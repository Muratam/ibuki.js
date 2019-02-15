import { Color } from "./color";

export interface AnyStyle {
  [key: string]: any
}
export interface Style {
  [key: string]: string
}
export function parse(style: AnyStyle): Style {
  let result: { [key: string]: string } = {}
  for (let key in style) {
    let val = style[key]
    if (val === null || val === undefined) continue
    if (typeof val === "number") result[key] = `${Math.floor(val)}px`
    else if (typeof val === "string") result[key] = val
    else if (val instanceof Color) result[key] = `${val}`
    else {
      let parsed = parse(val)
      for (let nkey in parsed) result[`${key}-${nkey}`] = parsed[nkey]
    }
  }
  return result
}
export function flatten(style: Style): string {
  let result = "";
  for (let key in style) result += `${key}:${style[key]};`
  return result;
}
export function transform(tr: { [key: string]: string | number }): Style {
  let result = { transform: "" }
  for (let key in tr) {
    if (key === "origin") result["transform-origin"] = tr[key]
    else result.transform += `${key}(${tr[key]})`
  }
  return result
}
export class Global {
  static doms: HTMLStyleElement[] = []
  public static regist(styles: { [key: string]: AnyStyle }) {
    let dom = document.createElement("style")
    dom.type = "text/css"
    let styleStr = ""
    for (let key in styles) styleStr += `${key}{${flatten(parse(styles[key]))}}`
    dom.innerHTML = styleStr
    this.doms.push(dom)
    document.head.appendChild(dom)
  }
}


export interface AnyStyle { [key: string]: any }
export interface Style { [key: string]: string }
export interface CanTranslateCSS {
  toCSS(): string
  // multiply(target: CanTranslateCSS): CanTranslateCSS
}
export function toNormalizedStyle(style: AnyStyle): AnyStyle {
  let result: AnyStyle = {}
  let isOK = false;
  for (let key in style) {
    let val = style[key]
    if (val === null || val === undefined || val === false) continue
    isOK = true;
    let rightKey = key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
    if (typeof val === "number" || typeof val === "string" || val.toCSS) {
      result[rightKey] = val
    } else {
      let parsed = toNormalizedStyle(val)
      for (let nkey in parsed) result[`${rightKey}-${nkey}`] = parsed[nkey]
    }
  }
  if (!isOK) return {};
  return result
}
export function parse(style: AnyStyle): Style {
  let flattened = toNormalizedStyle(style)
  let result: Style = {}
  for (let key in flattened) {
    let val = flattened[key]
    if (typeof val === "number") {
      if (key === "z-index") result[key] = `${Math.floor(val)}`
      else result[key] = `${Math.floor(val)}px`
    } else if (typeof val === "string") result[key] = val
    else if (val.toCSS) result[key] = val.toCSS()
    else console.assert(false, "parse error !! illegal css")
  }
  return result
}

export function flatten(style: Style): string {
  let result = "";
  for (let key in style) result += `${key}:${style[key]};`
  return result;
}

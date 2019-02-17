export interface AnyStyle {
  [key: string]: any
}
export interface Style {
  [key: string]: string
}
export function parse(style: AnyStyle): Style {
  let result: { [key: string]: string } = {}
  let isOK = false;
  for (let key in style) {
    let val = style[key]
    if (val === null || val === undefined || val === false) continue
    isOK = true;
    let rightKey = key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
    if (typeof val === "number") {
      if (rightKey === "z-index") result[rightKey] = `${Math.floor(val)}`
      else result[rightKey] = `${Math.floor(val)}px`
    } else if (typeof val === "string") result[rightKey] = val
    else if (val.toCSS) result[rightKey] = val.toCSS()
    else {
      let parsed = parse(val)
      for (let nkey in parsed) result[`${rightKey}-${nkey}`] = parsed[nkey]
    }
  }
  if (!isOK) return {};
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


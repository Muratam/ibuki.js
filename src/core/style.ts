export interface Style<T> { [key: string]: T }
export interface CanTranslateCSS {
  toCSS(): string,
  getProperties?(): string[]
}
export function toNormalizedStyle(style: Style<any>): Style<any> {
  let result: Style<any> = {}
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
export function parse(style: Style<any>): Style<any> {
  let flattened = toNormalizedStyle(style)
  let result: Style<string> = {}
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

export function flatten(style: Style<string>): string {
  let result = "";
  for (let key in style) result += `${key}:${style[key]};`
  return result;
}


export class TransformCSS implements CanTranslateCSS {
  y: number
  x: number
  scale: number
  rotation: number
  constructor(x: number, y: number, scale: number, rotation: number) {
    this.x = x
    this.y = y
    this.scale = scale
    this.rotation = rotation
  }
  toCSS(): string {
    return `translate(${Math.floor(this.x)}px,${Math.floor(this.y)}px) scale(${this.scale}) rotate(${100 * this.rotation}deg) `
  }
}
export interface FilterOption {
  blur?: number  // (px)
  brightness?: number  //
  contrast?: number  //
  dropShadow?: { x: number, y: number, blur: number, color: string }
  grayscale?: number  //
  hueRotate?: number  // deg
  opacity?: number  //
  saturate?: number  //
  sepia?: number
}

export class Filter implements CanTranslateCSS {
  option: FilterOption
  constructor(option: FilterOption) { this.option = option; }
  // o:src x:dst -> src のまま / 他は補完
  complement(src: Filter, per: number): Filter {
    let result = new Filter({ ...this.option })
    for (let key in { ...(src ? src.option : {}), ...this.option }) {
      if (key === "dropShadow") {
        for (let k2 in this.option[key]) {
          if (k2 === "color") result.option.dropShadow.color = this.option.dropShadow.color
          else result.option.dropShadow[k2] =
            this.option.dropShadow[k2] * per
            + (1 - per) * (src && src.option ? src.option.dropShadow[k2] || 0 : 0)
        }
        continue
      }
      result.option[key] = this.option[key] * per + (1 - per) * (src && src.option ? src.option[key] || 0 : 0)
    }
    return result
  }
  toCSS(): string {
    let result = ""
    if (typeof this.option.blur === "number") result += ` blur(${this.option.blur}px) `
    if (typeof this.option.brightness === "number") result += ` brightness(${this.option.brightness}) `
    if (typeof this.option.contrast === "number") result += ` contrast(${this.option.contrast}) `
    if (typeof this.option.grayscale === "number") result += ` grayscale(${this.option.grayscale}) `
    if (typeof this.option.hueRotate === "number") result += ` hue-rotate(${this.option.hueRotate}deg) `
    if (typeof this.option.opacity === "number") result += ` opacity(${this.option.opacity}) `
    if (typeof this.option.saturate === "number") result += ` saturate(${this.option.saturate}) `
    if (typeof this.option.sepia === "number") result += ` sepia(${this.option.sepia}) `
    if (this.option.dropShadow) {
      let s = this.option.dropShadow
      result += ` drop-shadow(${s.x}px ${s.y}px ${s.blur}px ${s.color}) `
    }
    return result
  }
}


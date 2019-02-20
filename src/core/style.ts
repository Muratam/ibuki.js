import { Store, MayStore, assign } from "./store"

export interface AnyStyle { [key: string]: any }
export interface Style { [key: string]: string }
export interface NumberStyle { [key: string]: number }

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


export class Transfrom implements CanTranslateCSS {
  y: number
  x: number
  scale: number
  rotate: number
  constructor(x: number, y: number, scale: number, rotate: number = 0) {
    this.x = x
    this.y = y
    this.scale = scale
    this.rotate = rotate
  }
  toCSS(): string {
    return `translate(${Math.floor(this.x)}px,${Math.floor(this.y)}px) scale(${this.scale}) rotate(${Math.floor(this.rotate)}deg) `
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
  toCSS(): string {
    let result = ""
    if (this.option.blur) result += ` blur(${this.option.blur}px) `
    if (this.option.brightness) result += ` brightness(${this.option.brightness}) `
    if (this.option.contrast) result += ` contrast(${this.option.contrast}) `
    if (this.option.grayscale) result += ` grayscale(${this.option.grayscale}) `
    if (this.option.hueRotate) result += ` hue-rotate(${this.option.hueRotate}deg) `
    if (this.option.opacity) result += ` opacity(${this.option.opacity}) `
    if (this.option.saturate) result += ` saturate(${this.option.saturate}) `
    if (this.option.sepia) result += ` sepia(${this.option.sepia}) `
    if (this.option.dropShadow) {
      let s = this.option.dropShadow
      result += ` drop-shadow(${s.x}px ${s.y}px ${s.blur}px ${s.color}) `
    }
    return result
  }
}

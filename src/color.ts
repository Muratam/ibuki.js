import * as rgba from "color-rgba";
import { CanTranslateCSS } from "./style"
import * as ColorSchemeLib from "color-scheme";
function clamp(val: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.floor(val)));
}
export class Color implements CanTranslateCSS {
  public readonly r: number = 1.0
  public readonly g: number = 1.0
  public readonly b: number = 1.0
  public readonly a: number = 1.0
  constructor(r: number, g: number, b: number, a: number = 1.0) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }
  static parse(str: string): Color {
    let c: number[] = rgba(str);
    return new Color(c[0] / 255, c[1] / 255, c[2] / 255, c[3]);
  }
  toCSS(): string {
    function tr(val: number): string {
      let res = Math.floor(clamp(val * 255, 0, 255)).toString(16);
      if (res.length === 2) return res;
      return "0" + res;
    }
    return "#" + tr(this.r) + tr(this.g) + tr(this.b) + tr(this.a);
  }
  multiply(c: CanTranslateCSS): Color {
    if (c instanceof Color)
      return new Color(this.r * c.r, this.g * c.g, this.b * c.b, this.a * c.a)
    console.assert(false, "not inplemented error @ multiply color")
    return this
  }
}
export type DirectionDegree = number | "bottom" | "top" | "right" | "left"
export class LinearGradient implements CanTranslateCSS {
  public readonly directionDegree: number;
  public readonly colors: Color[];
  constructor(colors: (string | Color)[], directionDegree: DirectionDegree = 0) {
    if (typeof directionDegree === "string")
      this.directionDegree = { bottom: 180, top: 0, right: 90, left: 270 }[directionDegree];
    else
      this.directionDegree = (360 + directionDegree % 360) % 360;
    this.colors = colors.map(x => typeof x === "string" ? Color.parse(x) : x);
    console.assert(this.colors.length >= 2, `${this.colors}  Linear Gradient Less Colors`)
  }
  toCSS(): string {
    return `linear-gradient(${this.directionDegree}deg,${
      this.colors.map(x => x.toCSS()).join(",")
      })`;
  }
  multiply(target: CanTranslateCSS) {
    console.assert(false, "not inplemented error @ multiply lineargradient")
    return this
  }
}
export type Colors = Color | LinearGradient | string | ColorScheme
export class ColorScheme implements CanTranslateCSS {
  baseColor?: Color | LinearGradient // 70%
  mainColor?: Color | LinearGradient// 25%
  accentColor?: Color | LinearGradient// 5%
  static parse(color: Colors): Color | LinearGradient {
    if (color instanceof Color) return color
    if (color instanceof LinearGradient) return color
    if (color instanceof ColorScheme) return color.baseColor
    return this.parseString(color)
  }
  static parseString(str: string): Color | LinearGradient {
    let colors = str.split("-")
    if (colors.length === 1) return Color.parse(str)
    return new LinearGradient(colors.map(x => Color.parse(x)))
  }
  static parseToColorScheme(color: Colors): ColorScheme {
    if (color instanceof ColorScheme) return color
    if (color instanceof LinearGradient) return new ColorScheme(color)
    if (color instanceof Color) return new ColorScheme(color)
    return new ColorScheme(color)
  }
  constructor(baseColor: Colors = "#fff", mainColor: Colors = "#000", accentColor: Colors = "") {
    this.baseColor = ColorScheme.parse(baseColor)
    this.mainColor = ColorScheme.parse(mainColor)
    if (accentColor === "") this.accentColor = this.baseColor
    else this.accentColor = ColorScheme.parse(accentColor)
  }
  multiply(target: CanTranslateCSS) {
    console.assert(false, "not inplemented error @ multiply color scheme")
    return this
  }
  toCSS(): string { return this.baseColor.toCSS() }
}

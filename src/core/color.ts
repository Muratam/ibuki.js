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
    this.r = Math.max(-1, Math.min(1, r));
    this.g = Math.max(-1, Math.min(1, g));
    this.b = Math.max(-1, Math.min(1, b));
    this.a = Math.max(-1, Math.min(1, a));
  }
  static sub(str: string): Color {
    let c: number[] = rgba(str);
    c = c.map(x => -x)
    if (!str.startsWith("#") || (str.length !== 5 && str.length !== 9)) {
      c[3] = 0;
    }
    return new Color(c[0] / 255, c[1] / 255, c[2] / 255, c[3]);
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
  addColor(c: Color | string): Color {
    if (typeof c === "string") c = Color.parse(c)
    return new Color(this.r + c.r, this.g + c.g, this.b + c.b, this.a + c.a)
  }
  mul(n: number): Color {
    return new Color(this.r * n, this.g * n, this.b * n, this.a * n)
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
  addColor(c: Color | string): LinearGradient {
    if (typeof c === "string") c = Color.parse(c)
    return new LinearGradient(this.colors.map(x => x.addColor(c)), this.directionDegree);
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
  addColor(color: Color | string): ColorScheme {
    if (typeof color === "string") color = Color.parse(color)
    return new ColorScheme(
      this.baseColor.addColor(color),
      this.mainColor.addColor(color),
      this.accentColor.addColor(color))
  }
  constructor(baseColor: Colors = "#fff", mainColor: Colors = "#000", accentColor: Colors = "") {
    if (baseColor instanceof ColorScheme) {
      this.baseColor = baseColor.baseColor
      this.mainColor = baseColor.mainColor
      this.accentColor = baseColor.accentColor
      return
    }
    this.baseColor = ColorScheme.parse(baseColor)
    this.mainColor = ColorScheme.parse(mainColor)
    if (accentColor === "") this.accentColor = this.baseColor
    else this.accentColor = ColorScheme.parse(accentColor)
  }
  // o:src x:dst -> src のまま / 他は補完
  complement(src: ColorScheme, per: number): ColorScheme {
    let result = new ColorScheme(this)
    if (src === undefined) return result
    for (let key in ["baseColor", "accentColor", "mainColor"]) {
      if (src[key] instanceof LinearGradient || this[key] instanceof LinearGradient)
        console.assert("LinearGradient is not suppoerted for animation...")
      let a = src[key]
      let b = this[key]
      result[key] = new Color(
        per * b.r + (1 - per) * (a.r || 0),
        per * b.g + (1 - per) * (a.g || 0),
        per * b.b + (1 - per) * (a.b || 0),
        per * b.a + (1 - per) * (a.a || 0)
      )
    }
    return result
  }
  toCSS(): string { return this.baseColor.toCSS() }
}

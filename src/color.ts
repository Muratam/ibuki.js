import * as rgba from "color-rgba";
import * as ColorSchemeLib from "color-scheme";
function clamp(val: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.floor(val)));
}
export class Color {
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
}
export type DirectionDegree = number | "bottom" | "top" | "right" | "left"
export class LinearGradient {
  public readonly directionDegree: number;
  public readonly colors: Color[];
  constructor(directionDegree: DirectionDegree, colors: (string | Color)[]) {
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
}
export interface ColorScheme {
  baseColor?: Color // 70%
  mainColor?: Color // 25%
  accentColor?: Color // 5%
  palette?: Color[] // others
}

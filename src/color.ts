import * as rgba from "color-rgba";
import * as ColorSchemeLib from "color-scheme";
function clamp(val: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.floor(val)));
}
export class Color {
  public r: number = 1.0
  public g: number = 1.0
  public b: number = 1.0
  public a: number = 1.0
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
  toString(): string {
    function tr(val: number): string {
      return Math.floor(clamp(val * 255, 0, 255)).toString(16)
    }
    return "#" + tr(this.r) + tr(this.g) + tr(this.b) + tr(this.a);
  }
}
export interface ColorScheme {
  baseColor?: Color // 70%
  mainColor?: Color // 25%
  accentColor?: Color // 5%
  palette?: Color[] // others
}

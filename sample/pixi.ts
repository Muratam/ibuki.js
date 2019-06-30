import { FitBox, Box, BoxOption, IBukiMinElement, Transform, Scene } from "../"
import * as PIXI from "pixi.js"
// DOMの裏側に描画される.
class PIXIBox extends FitBox {
  app: PIXI.Application
  $dom: HTMLCanvasElement
  constructor(parent: Box, option: BoxOption = {}) {
    super(parent, { tag: "canvas", ...option })
    this.app = new PIXI.Application({
      width: this.width, height: this.height,
      antialias: true,
      resolution: 1,
      view: this.$dom
    })
  }
}
export class Sprite extends IBukiMinElement implements Transform {
  $width: number = undefined;
  public get width(): number { return this.$width }
  public set width(val: number) { this.$width = this.sprite.width = val }
  $height: number = undefined;
  public get height(): number { return this.$height }
  public set height(val: number) { this.$height = this.sprite.height = val }
  $x: number = 0;
  public get x(): number { return this.$x }
  public set x(val: number) { this.$x = this.sprite.x = val }
  $y: number = 0;
  public get y(): number { return this.$y }
  public set y(val: number) { this.$y = this.sprite.y = val }
  $scale: number = 1;
  public get scale(): number { return this.$scale }
  public set scale(val: number) { this.$scale = val; this.sprite.scale.set(val, val) }
  $rotation: number = 0;
  public get rotation(): number { return this.$rotation }
  public set rotation(val: number) { this.$rotation = this.sprite.rotation = val }
  sprite: PIXI.Sprite
  constructor(scene: Scene, imageURL: string, option: Transform = {}) {
    super()
    // use PIXI.Loader.shared.add('bunny', 'me.jpg').load((loader, resources) => {
    this.sprite = PIXI.Sprite.from(imageURL)
    this.sprite.anchor.set(0.5)
    this.$width = this.sprite.width
    this.$height = this.sprite.height
    for (let key in option) { this[key] = option[key] }
    this.$scene = scene
    this.$createdFrame = this.$scene.createdFrame
    // this.$scene.stage.addChild(this.sprite)
  }
}
// @Scene
// public readonly stage: PIXI.Container
// this.stage = parent.pixi.app.stage;
// @World
// public readonly pixi: PIXIBox
// this.pixi = new PIXIBox(this)

import * as Ibuki from "./ibuki";
class SinAnimation extends Ibuki.Class {
  static animation = {
    0: {
      transform: `translate(0,0)`
    },
    50: {
      transform: `translate(0,-10px)`
    },
    100: {
      transform: `translate(0,0)`
    },
    duration: 0.75,
    timing: "ease",
    iteration: `infinite`,
  }
  static style = {
    cursor: "pointer",
  }
};
let world = new Ibuki.World();
class Green extends Ibuki.CanvasElement {
  update() {
    this.$ctx.fillStyle = "green";
    let x = this.$world.width * (this.time % 1.5 - 0.5);
    this.$ctx.fillRect(x, 10, 200, 200);
  }
}
new Green(world);
class GameView extends Ibuki.UI {
  static style = {
    background: {
      color: new Ibuki.Color(240, 240, 200, 200)
    },
    border: {
      radius: 5,
      width: 2,
      style: "solid",
      color: new Ibuki.Color(13, 13, 13),
    },
  }
}

class Hai extends Ibuki.UIText {
  static style = {
    width: world.width / 14,
    height: world.height / 6,
    font: {
      color: "#000000",
    },
    background: `linear-gradient(#ffffff,#ceceee)`,
    border: {
      radius: 5,
      width: 2,
      style: "solid",
      color: new Ibuki.Color(13, 13, 13),
    },
  }
  constructor(parent = document.body, name) {
    super(parent);
    this.text = name;
  }
  onClick() {
    this.style["border-width"] = 10;
  }
  onMouseEnter() {
    this.addClass(SinAnimation);
  }
  onMouseLeave() {
    this.removeClass(SinAnimation);
  }
}

let gameView = new GameView(world);
let names = [
  "一", "二", "三", "四", "五", "六", "七", "八", "九",
  "１", "２", "３", "４", "５", "６", "７", "８", "９",
  "Ⅰ", "Ⅱ", "Ⅲ", "Ⅳ", "Ⅴ", "Ⅵ", "Ⅶ", "Ⅷ", "Ⅸ",
  "東", "南", "西", "北", "發", " ", "中"
];
for (let i = 0; i < 14; i++) {
  let name = names[Math.floor(Math.random() * names.length)];
  let hai = new Hai(gameView, name);
  hai.x = world.width * i / 14;
}
import * as Ibuki from "./ibuki";
class Thin extends Ibuki.Class {
  static style = {
    border: {
      width: 10,
    }
  }
};
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
class GameView extends Ibuki.Block {
  static style = {
    background: {
      color: new Ibuki.Color(240, 240, 200)
    },
    border: {
      radius: 5,
      width: 2,
      style: "solid",
      color: new Ibuki.Color(13, 13, 13),
    },
  }
  constructor(parent) {
    super(parent);
    // this.top = parent.height * 0.25;
    // this.height = parent.height * 0.5;
  }

}

class Hai extends Ibuki.TextBlock {
  static style = {
    width: "2em",
    height: "3em",
    font: {
      color: "#000000",
      size: "100%",
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
    this.addClass(Thin);
    this.style = {
      font: {
        size: 100
      }
    }
  }
  onMouseEnter() {
    this.addClass(SinAnimation);
  }
  onMouseLeave() {
    this.removeClass(SinAnimation);
  }
}
let world = new Ibuki.World();

let gameView = new GameView(world);
let names = [
  "一", "二", "三", "四", "五", "六", "七", "八", "九",
  "１", "２", "３", "４", "５", "６", "７", "８", "９",
  "Ⅰ", "Ⅱ", "Ⅲ", "Ⅳ", "Ⅴ", "Ⅵ", "Ⅶ", "Ⅷ", "Ⅸ",
  "東", "南", "西", "北", "發", " ", "中"
];
let x = 0;
for (let i = 0; i < 14; i++) {
  let name = names[Math.floor(Math.random() * names.length)];
  let hai = new Hai(gameView, name);
  hai.x = x;
  hai.y = 0;
  x = hai.right;
  // hai.x = hai.width * i * 1.1;
  // hai.y = gameView.height - hai.height * 1.3;
}
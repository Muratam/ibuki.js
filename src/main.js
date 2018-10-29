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
class GameView extends Ibuki.DOM {
  static style = {
    background: {
      color: new Ibuki.Color(240, 240, 200)
    },
    overflow: "hidden",
    position: "relative",
    border: {
      radius: 5,
      width: 2,
      style: "solid",
      color: new Ibuki.Color(13, 13, 13),
    }
  }
  constructor(parent) {
    super(parent);
    this.style = {
      top: parent.height * 0.25,
      left: parent.width * 0.01,
      width: parent.width * 0.98,
      height: parent.height * 0.5,
    }
    this.addClass(SinAnimation);
  }
}

// class TopBar extends Ibuki.DOM {
//   static style = {
//     background: {
//       color: new Ibuki.Color(0, 240, 200)
//     },
//     overflow: "hidden",
//     position: "absolute",

//     "border-bottom": {
//       width: 10,
//       style: "solid",
//       color: new Ibuki.Color(0, 0, 0)
//     }
//   }
//   constructor(parent) {
//     super(parent);
//     this.style = {
//       top: 0,
//       width: parent.width,
//       height: parent.height * 0.05,
//     }
//     this.addClass(SinAnimation);
//   }
// }
// class ButtomBar extends Ibuki.DOM {
//   static style = {
//     background: {
//       color: new Ibuki.Color(0, 240, 200)
//     },
//     overflow: "hidden",
//     position: "absolute",
//   }
//   constructor(parent) {
//     super(parent);
//     this.style = {
//       top: parent.height * 0.95,
//       width: parent.width,
//       height: parent.height * 0.15,
//     }
//     this.addClass(SinAnimation);
//   }
// }
// new TopBar();
// new ButtomBar();

class Hai extends Ibuki.DOM {
  static style = {
    width: "1em",
    height: "2em",
    font: {
      color: "#000000",
      size: 30,

    },
    // color: new Ibuki.Color(13, 13, 13),
    background: `linear-gradient(#ffffff,#eeeeee)`,
    display: "flex",
    "justify-content": "center",
    "align-items": "center",
    border: {
      radius: 5,
      width: 2,
      style: "solid",
      color: new Ibuki.Color(13, 13, 13),
    },
    padding: "0.6em",
    margin: 10,
  }
  // static attribute = {
  //   tag: "img",
  //   src: "../img/img.jpg"
  // }
  constructor(parent = document.body, name) {
    super(parent);
    this.text = name;
  }
  onClick() {
    this.addClass(Thin);
  }
  onMouseEnter() {
    this.addClass(SinAnimation);
  }
  onMouseLeave() {
    this.removeClass(SinAnimation);
  }
}
let root = new Ibuki.Root();
let gameView = new GameView(root);
let names = [
  "一", "二", "三", "四", "五", "六", "七", "八", "九",
  "１", "２", "３", "４", "５", "６", "７", "８", "９",
  "Ⅰ", "Ⅱ", "Ⅲ", "Ⅳ", "Ⅴ", "Ⅵ", "Ⅶ", "Ⅷ", "Ⅸ",
  "東", "南", "西", "北", "發", " ", "中"
];
for (let i = 0; i < 14; i++) {
  let hai = new Hai(gameView, names[Math.floor(Math.random() * names.length)]);
  hai.x = hai.width * i * 1.1;
  hai.y = gameView.height - hai.height * 1.3;
}
class TestImage extends IbukiDOM {
  static style() {
    // 全部に共通の css-style を書く
    return {
      border: {
        radius: 20,
        width: 3,
        style: "solid",
        color: "#000000",
      },
    };
  }
  static animation() {
    // 全部に共通の animation を書く
    return {
      keyframes: {
        rot: `
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }`
      },
      name: "rot",
      duration: "1s",
      "timing-function": "linear",
      "iteration-count": `infinite`,
    };
  }
  static attribute() {
    // 全部に共通の attribute を書く
    return {
      tag: "img",
      width: 100,
      src: "./img/img.png",
    };
  }
  constructor(parent = document.body) {
    super(parent);
    const square = 400;
    // x y を操作すると自動で abusolute に変更
    this.x = square * Math.random() % square;
    this.y = square * Math.random() % square;
    this.i = 0;
  }
  update() {
    // WARN: changing style is too slow
    this.x++;
    this.y++;
    this.i++;
    this.style = {
      transform: `rotate(${this.x + this.y}deg)`,
      border: {
        radius: 40 * Math.abs(Math.sin(this.i / Math.PI / 10))
      }
    };
    if (this.i > 100) return false;
  }
}

class TestText extends IbukiDOM {
  static style() {
    return {
      width: "20",
      color: "#333333",
      background: {
        color: "#cccccc"
      },
      "text-align": "center",
      border: {
        radius: 10,
        width: 2,
        style: "solid",
        color: "#333333",
      },
      padding: 3,
      margin: 10,
    };
  }
  static attribute() {
    return {
      tag: "div"
    }
  }
  constructor(parent = document.body) {
    super(parent);
    this.dom.innerHTML = "aaaa";
  }
}
let i = -1;
let root = new IbukiDOM();
new TestText(new TestText(new TestText(new TestText(root).registUpdate(function () {
  this.y = (this.y || 0) + 1;
})))).registUpdate(function () {
  this.y = (this.y || 0) + 1;
});
registUpdate(() => {
  if ((i++ % 10) === 0) new TestImage();
});
registUpdate(() => {
  let globalWidth = window.innerWidth;
  let globalHeight = screen.height;
  // console.log(globalWidth);
});
class TestRotationAnimation extends Ibuki.Class {
  static animation() {
    return {
      0: {
        transform: `rotate(0deg)`
      },
      100: {
        transform: `rotate(360deg)`
      },
      duration: 0.75,
      timing: "linear",
      iteration: `infinite`,
    }
  }
  static style() {
    return {
      color: new Ibuki.Color(200, 10, 10),
    }
  }
}

class TestText extends Ibuki.DOM {
  static style() {
    return {
      width: "20",
      color: new Ibuki.Color(13, 13, 13),
      background: {
        color: new Ibuki.Color(200, 200, 200),
      },
      "text-align": "center",
      border: {
        radius: 10,
        width: 2,
        style: "solid",
        color: new Ibuki.Color(13, 13, 13),
      },
      padding: 3,
      margin: 10,
    };
  }
  constructor(parent = document.body) {
    super(parent);
  }
  update() {
    if (this.frame > 200) return;
    if (this.frame % 10 == 0) this.text += "\n"
    else this.text += "a";
  }
  onClick() {
    console.log(this.text.length);
  }
  onMouseEnter() {
    this.addClass(TestRotationAnimation);
  }
  onMouseLeave() {
    this.removeClass(TestRotationAnimation);
  }
}
new TestText();
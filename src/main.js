let appendGlobalStyle = (() => {
  // 全てに固定なstyleがあるなら当然headに置いたほうがパフォーマンスはよさそう
  let definedStyle = undefined;
  let result = code => {
    if (definedStyle !== undefined) {
      // definedStyle.sheet.insertRule(code);
      definedStyle.innerHTML += code;
      return;
    }
    let style = document.createElement("style");
    style.type = "text/css";
    style.innerHTML = code;
    document.head.appendChild(style);
    definedStyle = style;
  };
  result("");
  return result;
})();
let registUpdate = (() => {
  // 一度の requestAnimationFrameで全て更新することで一度しかRecalcを走らせない(だいじ)
  let updateList = [];
  let maxIndex = -1;
  let applyUpdateList = () => {
    for (let i = 0; i < Math.min(maxIndex + 1, updateList.length); i++) {
      if (updateList[i]() !== false) continue;
      updateList[i] = updateList[maxIndex];
      maxIndex--;
      i--;
    }
    requestAnimationFrame(applyUpdateList);
  };
  requestAnimationFrame(applyUpdateList);
  return fun => {
    maxIndex++;
    if (maxIndex === updateList.length) updateList.push(fun);
    else updateList[maxIndex] = fun;
  };
})();
// extends 元によって tag は決めれば良い
class Ibuki {
  static withUnit(x) {
    return (typeof (x) === "number" ? `${Math.floor(x)}px` : x);
  }
  static applyStyle(style, elem = undefined) {
    let result = "";
    let returnCode = !elem;

    function apply(key, val) {
      if (returnCode) result += `${key}:${Ibuki.withUnit(val)};\n`;
      else elem.style[key] = Ibuki.withUnit(val);
    }
    for (let key in style) {
      let val = style[key];

      if (val.constructor.name !== "Object") {
        apply(key, val)
        continue;
      }
      // 1階層まで省略できるように
      for (let kk in val) apply(key + "-" + kk, val[kk]);
    }
    if (returnCode) return result;
  }
  static registGlobal() {
    let className = this.className();
    let styleObj = this.style();
    let animObj = this.animation();
    let css = "";
    if ("keyframes" in animObj) {
      let anims = animObj.keyframes;
      for (let key in anims) css += ` @keyframes ${className}-${key} \{ ${anims[key]} \} `;
      delete animObj.keyframes
    }
    if ("name" in animObj) animObj.name = `${className}-${animObj.name}`;
    styleObj.animation = animObj;
    let style = Ibuki.applyStyle(styleObj);
    if (style === "") return;
    css += `.${className} \{\n${style}\}`;
    appendGlobalStyle(css);
  }
  static className() {
    return this.name.toLowerCase();
  }
  static style() {
    return {};
  }
  static animation() {
    return {};
  }
  static attribute() {
    return {
      tag: "div"
    };
  }
  remove() {
    this.dom.remove();
    // WARN: GC が勝手にやってくれるので余計な処理かもしれない
    // let keys = Reflect.ownKeys(this);
    // for (let key of keys) delete this[key];
    // this.__proto__ = null;
  }
  // x y を設定すると floating にする
  floatPosition(updateX, updateY) {
    if (!this.isFloating) {
      this.dom.style.position = "absolute";
      this.dom.style.contain = "layout paint";
    }
    this.isFloating = true;
    if (updateX) this.dom.style.left = Ibuki.withUnit(this.$x || 0);
    if (updateY) this.dom.style.top = Ibuki.withUnit(this.$y || 0);
  }
  set style(val) {
    Ibuki.applyStyle(val, this.dom);
  }
  set x(val) {
    val = Math.floor(val);
    if (this.$x === val) return;
    this.$x = val;
    this.floatPosition(true, false);
  }
  set y(val) {
    val = Math.floor(val);
    if (this.$y === val) return;
    this.$y = val;
    this.floatPosition(false, true);
  }
  get x() {
    return this.$x || 0;
  }
  get y() {
    return this.$y || 0;
  }
  get text() {
    return this.dom.innerText || "";
  }
  set text(val) {
    this.dom.innerText = val;
  }

  static checkRegisted() {
    if (this.name === "Ibuki") return;
    if (!this.$registed) this.registGlobal();
    this.$registed = true;
  }
  registUpdate(updateFun) {
    updateFun = updateFun.bind(this);
    registUpdate((updateFrame => () => {
      if (!updateFun) return false;
      if (updateFrame) this.frame++;
      let ok = updateFun();
      if (ok === false) this.remove();
      return ok;
    })(this.$updateFrame || true));
    this.$updateFrame = false;
    return this;
  }

  constructor(parent = document.body) {
    this.constructor.checkRegisted();
    let attrs = this.constructor.attribute();
    this.dom = document.createElement(attrs.tag || "div");
    if (parent.dom) parent.dom.appendChild(this.dom);
    else parent.appendChild(this.dom)
    for (let key in attrs) this.dom[key] = attrs[key];
    this.dom.className = this.constructor.className();
    if (this.update) this.registUpdate(this.update);
    this.frame = 0;
    let methods = Reflect.ownKeys(this.constructor.prototype);
    for (let method of methods) {
      if (method.startsWith("on")) {
        let name = method.toLowerCase().replace(/^on/, "");
        this.dom.addEventListener(name, this[method].bind(this));
      }
    }
  }
}
class Color {
  constructor(r, g, b, a = 255) {
    this.r = this.clamp(r, 0, 255);
    this.g = this.clamp(g, 0, 255);
    this.b = this.clamp(b, 0, 255);
    this.a = this.clamp(a, 0, 255);
  }
  toString() {
    let str = x => (Math.floor(x) < 16 ? "0" : "") + Math.floor(x).toString(16);
    return `#${str(this.r)}${str(this.g)}${str(this.b)}${this.a == 255 ? "" : str(this.a)}`;
  }
  clamp(val, min, max) {
    return Math.min(max, Math.max(min, Math.floor(val)));
  }
  mul(val) {
    if (val.constructor.name === this.constructor.name) {
      return new Color(val.r * this.r, val.g * this.g, val.b * this.b, val.a * this.a);
    } else {
      return new Color(val * this.r, val * this.g, val * this.b);
    }
  }
}


if (false) {
  class TestImage extends Ibuki {
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

  class TestText extends Ibuki {
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
  let root = new Ibuki();
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
}
if (true) {
  class TestText extends Ibuki {
    static style() {
      return {
        width: "20",
        color: new Color(13, 13, 13),
        background: {
          color: new Color(200, 200, 200),
        },
        // "text-align": "center",
        border: {
          radius: 10,
          width: 2,
          style: "solid",
          color: new Color(13, 13, 13),
        },
        padding: 3,
        margin: 10,
      };
    }
    // static attribute() {
    //   return {
    //     tag: "div"
    //   }
    // }
    constructor(parent = document.body) {
      super(parent);
    }
    update() {
      if (this.frame > 2000) return;
      if (this.frame % 50 == 0) this.text += "\n"
      else this.text += "a";
    }
    onClick() {
      console.log(this.text.length);
    }
  }
  // class TestRoot extends Ibuki {
  //   static style() {
  //     return {
  //       width: window.innerWidth,
  //       height: screen.height,
  //       margin: 0,
  //       padding: 0,
  //       background: {
  //         color: new Color(200, 200, 200),
  //       },
  //     };
  //   }
  //   constructor(parent = document.body) {
  //     super(parent);
  //   }

  // }
  new TestText();
  // new TestText();

}
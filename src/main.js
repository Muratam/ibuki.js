let appendGlobalStyle = (() => {
  // 全てに固定なstyleがあるなら当然headに置いたほうがパフォーマンスはよさそう
  let definedStyle = undefined;
  return code => {
    if (definedStyle !== undefined) {
      definedStyle.sheet.insertRule(code);
      return;
    }
    let style = document.createElement("style");
    style.type = "text/css";
    style.innerHTML = code;
    document.head.appendChild(style);
    definedStyle = style;
  }
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
      if (typeof (val) !== "object") {
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
    return {};
  }
  applyStyle(style) {
    Ibuki.applyStyle(style, this.dom);
  }
  remove() {
    this.dom.remove();
    // WARN: GC が勝手にやってくれるので余計な処理かもしれない
    let keys = Reflect.ownKeys(this);
    for (let key of keys) delete this[key];
    this.__proto__ = null;
  }
  update() {}
  // x y を設定すると floating にする
  floatPosition(updateX, updateY) {
    if (!this.isFloating) {
      this.dom.style.position = "absolute";
      this.dom.style.contain = "layout paint";
    }
    this.isFloating = true;
    if (updateX) this.dom.style.left = Ibuki.withUnit(this.__x || 0);
    if (updateY) this.dom.style.top = Ibuki.withUnit(this.__y || 0);
  }
  set x(val) {
    val = Math.floor(val);
    if (this.__x === val) return;
    this.__x = val;
    this.floatPosition(true, false);
  }
  set y(val) {
    val = Math.floor(val);
    if (this.__y === val) return;
    this.__y = val;
    this.floatPosition(false, true);
  }
  get x() {
    return this.__x || 0;
  }
  get y() {
    return this.__y || 0;
  }
  static checkRegisted() {
    if (!this.__registed) this.registGlobal();
    this.__registed = true;
  }

  constructor() {
    this.constructor.checkRegisted();
    this.dom = document.createElement("img");
    document.body.appendChild(this.dom);
    let attrs = this.constructor.attribute();
    for (let key in attrs) this.dom[key] = attrs[key];
    this.dom.className = this.constructor.className();
    registUpdate(() => {
      if (!this.update) return false;
      let ok = this.update();
      if (ok === false) this.remove();
      return ok;
    });
  }
}
class TestImage extends Ibuki {
  static style() {
    // 全部に共通の css-style を書く
    return {
      // color: "#f00000",
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
      width: 100,
      src: "./img/img.png",
    };
  }
  constructor() {
    super();
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
    this.applyStyle({
      transform: `rotate(${this.x + this.y}deg)`,
      border: {
        radius: 40 * Math.abs(Math.sin(this.i / Math.PI / 10))
      }
    });
    if (this.i > 100) return false;
  }
}
let i = -1;
registUpdate(() => {
  if ((i++ % 10) === 0) new TestImage();
});
if (false) {
  update(() => {
    let globalWidth = window.innerWidth;
    let globalHeight = screen.height;
    // console.log(globalWidth);
  });
}
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
  // 一度の requestAnimationFrameで全て更新することで一度しかRecalcを走らせない
  let updateList = [];
  let maxIndex = -1;
  let applyUpdateList = () => {
    for (let i = 0; i < Math.min(maxIndex + 1, updateList.length); i++) {
      if (updateList[i]() !== false) continue;
      updateList[i] = updateList[maxIndex];
      updateList[maxIndex] = null;
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
  static applyStyle(style, elem = undefined) {
    let result = "";
    let returnCode = !elem;

    function apply(key, val) {
      const withUnit = x => (typeof (x) === "number" ? `${x}px` : x);
      if (returnCode) result += `${key}:${withUnit(val)};\n`;
      else elem.style[key] = withUnit(val);
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
  floatPosition() {
    let style = {
      top: this._x || 0,
      left: this._y || 0,
    };
    if (!this.isFloating) style.position = "absolute";
    this.isFloating = true;
    this.applyStyle(style);
  }
  set x(val) {
    this._x = val;
    this.floatPosition();
  }
  get x() {
    return this._x || 0;
  }
  set y(val) {
    this._y = val;
    this.floatPosition();
  }
  get y() {
    return this._y || 0;
  }

  constructor() {
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
      color: "#f00000",
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
        rot: ` 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); }`
      },
      name: "rot",
      duration: "1s",
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
    // 書くインスタンスごとに独立の状態を書く
    const square = 100;
    // x y を操作すると自動で abusolute に変更
    this.x = Math.floor(square * Math.random()) % square;
    this.y = Math.floor(square * Math.random()) % square;
  }
  update() {
    this.x++;
    this.y++;
    // this.applyStyle({
    //   transform: `rotate(${this.x + this.y}deg)`,
    //   border: {
    //     radius: this.x % 100
    //   }
    // });
    if (this.x > 200) return false;
  }
}
Ibuki.registGlobal();
TestImage.registGlobal();
let i = -1;
registUpdate(() => {
  if ((i++ % 10) === 0) new TestImage();
  // console.log(img);
});
if (false) {
  update(() => {
    let globalWidth = window.innerWidth;
    let globalHeight = screen.height;
    // console.log(globalWidth);
  });
}
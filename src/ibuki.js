// head に 新たな css を登録
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
// requestAnimationFrame に登録
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
// 数値 x に px をつける
function withUnit(x) {
  return (typeof (x) === "number" ? `${Math.floor(x)}px` : x);
}
// style オブジェクトを解析し css に(elem があれば適用もする)
function applyStyle(style, elem = undefined) {
  let result = "";
  let apply = (key, val) => {
    if (elem) elem.style[key] = withUnit(val);
    result += `${key}:${withUnit(val)};\n`
  }
  for (let key in style) {
    let val = style[key];
    if (val.constructor.name !== "Object") {
      apply(key, val)
      continue;
    }
    for (let kk in val) apply(key + "-" + kk, val[kk]);
  }
  return result;
}
// class を登録
let registClass = (() => {
  let classList = {};
  return c => {
    let className = c.name.toLowerCase();
    if (className in classList) return;
    let styleObj = c.style || {};
    let animObj = c.animation || {};
    let nums = (() => {
      let result = [];
      for (let key in animObj) {
        if (!isNaN(key)) result.push(key);
      }
      return result;
    })();
    let css = "";
    if (nums.length > 0) {
      let animationName = className + "animation";
      let keyFrames = "";
      for (let key of nums) {
        keyFrames += `${key}% \{ ${applyStyle(animObj[key])}\}`;
        delete animObj[key];
      }
      css = ` @keyframes ${animationName} \{ ${keyFrames}\}\n`;
      styleObj["animation-name"] = animationName;
    }
    if ("iteration" in animObj) {
      animObj["iteration-count"] = animObj.iteration;
      delete animObj.iteration;
    }
    if ("timing" in animObj) {
      animObj["timing-function"] = animObj.timing;
      delete animObj.timing;
    }
    if ("duration" in animObj) {
      if (!isNaN(animObj.duration)) animObj.duration = Math.floor(animObj.duration * 1000) + "ms";
    }
    styleObj.animation = animObj;
    let style = applyStyle(styleObj);
    css += `.${className} \{\n${style}\} \n`;
    appendGlobalStyle(css);
    classList[className] = styleObj;
  }
})();

// 名前を付けてclassオブジェクトにする
class Class {
  static animation = {}
  static style = {}
}

class DOM {
  static registGlobal() {
    let className = this.className();
    let styleObj = this.style;
    let style = applyStyle(styleObj);
    if (style === "") return;
    let css = `.${className} \{\n${style}\}`;
    appendGlobalStyle(css);
  }
  changeClass(c, op) {
    registClass(c);
    this.dom.classList[op](c.name.toLowerCase());
  }
  addClass(c) {
    this.changeClass(c, "add");
  }
  toggleClass(c) {
    this.changeClass(c, "toggle");
  }
  removeClass(c) {
    this.changeClass(c, "remove");
  }
  static className() {
    return this.name.toLowerCase();
  }
  static style = {}
  static attribute = {
    tag: "div"
  }
  remove() {
    this.dom.remove();
    // WARN: GC が勝手にやってくれるので余計な処理かもしれない
    // let keys = Reflect.ownKeys(this);
    // for (let key of keys) delete this[key];
    // this.__proto__ = null;
  }
  // x y を設定すると absolute に floating にする
  floatPosition(updateX, updateY) {
    if (!this.isFloating) {
      this.dom.style.position = "absolute";
      // this.dom.style.contain = "layout paint";
    }
    this.isFloating = true;
    if (updateX) this.dom.style.left = withUnit(this.$x || 0);
    if (updateY) this.dom.style.top = withUnit(this.$y || 0);
  }
  set style(val) {
    applyStyle(val, this.dom);
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
  get width() {
    return this.dom.offsetWidth;
  }
  get height() {
    return this.dom.offsetHeight;
  }

  static checkRegisted() {
    if (this.name === "DOM") return;
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
    let attrs = this.constructor.attribute;
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
      return new this.constructor(val.r * this.r, val.g * this.g, val.b * this.b, val.a * this.a);
    } else {
      return new this.constructor(val * this.r, val * this.g, val * this.b);
    }
  }
}
class Root extends DOM {
  static style() {
    return {
      overflow: "hidden",
      position: "relative",
    };
  }
  constructor() {
    super();
    appendGlobalStyle(`body { margin:0px;padding 0px; } *{ box-sizing: border-box; }`);
    this.style = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }
  // update() {
  //   // おもそう
  //   this.style = {
  //     width: window.innerWidth,
  //     height: window.innerHeight,
  //   };
  // }
}
export var Ibuki = {
  registUpdate,
  appendGlobalStyle,
  DOM,
  Root,
  Color,
  Class,
}
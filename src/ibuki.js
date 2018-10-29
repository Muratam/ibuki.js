{ // appendGlobalStyle: head に 新たな css を登録
  let definedStyle = undefined;
  var appendGlobalStyle = code => {
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
  appendGlobalStyle("");
}; { // registUpdate: requestAnimationFrame に登録
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
  var registUpdate = fun => {
    maxIndex++;
    if (maxIndex === updateList.length) updateList.push(fun);
    else updateList[maxIndex] = fun;
  };
}
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
};

export class Class {
  static animation = {}
  static style = {}
  // 名前を付けてclassオブジェクトにする
  static $classList = {};
  static $regist() {
    if (this.className in Class.$classList) return;
    console.log(`regist : ${this.className}`);
    let styleObj = this.style || {};
    let animObj = this.animation || {};
    let nums = (() => {
      let result = [];
      for (let key in animObj) {
        if (!isNaN(key)) result.push(key);
      }
      return result;
    })();
    let css = "";
    if (nums.length > 0) {
      let animationName = this.className + "animation";
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
    css += `.${this.className} \{\n${style}\} \n`;
    appendGlobalStyle(css);
    Class.$classList[this.className] = styleObj;
  }
  static get className() {
    return this.name.toLowerCase();
  }
}
export class DOM extends Class {
  static attribute = {
    tag: "div"
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
  changeClass(c, op) {
    c.$regist();
    this.dom.classList[op](c.className);
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

  constructor(parent = document.body) {
    super().constructor.$regist();
    let attrs = this.constructor.attribute;
    this.dom = document.createElement(attrs.tag || "div");
    if (parent.dom) parent.dom.appendChild(this.dom);
    else parent.appendChild(this.dom)
    for (let key in attrs) this.dom[key] = attrs[key];
    this.dom.className = this.constructor.className;
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
export class Color {
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
export class Root extends DOM {
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
// export var Ibuki = {
//   registUpdate,
//   appendGlobalStyle,
//   DOM,
//   Root,
//   Color,
//   Class,
// }
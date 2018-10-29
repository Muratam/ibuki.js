class Updater {
  regist(fun) {
    this.maxIndex++;
    if (this.maxIndex === this.updateList.length) this.updateList.push(fun);
    else this.updateList[this.maxIndex] = fun;
  }
  applyUpdateList() {
    this.frame++;
    for (let i = 0; i < Math.min(this.maxIndex + 1, this.updateList.length); i++) {
      if (this.updateList[i]() !== false) continue;
      this.updateList[i] = this.updateList[maxIndex];
      this.maxIndex--;
      i--;
    }
    requestAnimationFrame(this.applyUpdateList.bind(this));
  }
  constructor() {
    this.updateList = [];
    this.maxIndex = -1;
    this.frame = 0;
    requestAnimationFrame(this.applyUpdateList.bind(this));
  }
  static $instance = new Updater();
}
class Style {
  regist(code) {
    this.$dom.innerHTML += code;
  }
  constructor() {
    this.$dom = document.createElement("style");
    this.$dom.type = "text/css";
    this.$dom.innerHTML = "";
    document.head.appendChild(this.$dom);
  }
  static withUnit(x) {
    // 数値 x に px をつける
    return (typeof (x) === "number" ? `${Math.floor(x)}px` : x);
  }
  static analyzeStyleObject(style, hookFunc) {
    for (let key in style) {
      let val = style[key];
      if (val.constructor.name !== "Object") {
        hookFunc(key, this.withUnit(val));
        continue;
      }
      for (let kk in val) hookFunc(key + "-" + kk, this.withUnit(val[kk]));
    }
  }
  static getCSS(style) {
    let result = "";
    this.analyzeStyleObject(style, (key, val) => {
      result += `${key}:${val};\n`
    });
    return result;
  }
  static apply(style, elem) {
    this.analyzeStyleObject(style, (key, val) => {
      elem.style[key] = val;
    });
  }
  static $instance = new Style();
}

export class Class {
  static animation = {}
  static style = {}
  static get className() {
    return this.name.toLowerCase();
  }
  // 名前を付けてclassオブジェクトにする
  static $classList = {};
  static $regist() {
    if (this.className in Class.$classList) return;
    // console.log(`regist : ${this.className}`);
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
        keyFrames += `${key}% \{ ${Style.getCSS(animObj[key])}\}`;
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
    let style = Style.getCSS(styleObj);
    css += `.${this.className} \{\n${style}\} \n`;
    Style.$instance.regist(css);
    Class.$classList[this.className] = styleObj;
  }
}
export class DOM extends Class {
  static attribute = {
    tag: "div"
  }
  changeClass(c, op) {
    c.$regist();
    this.$dom.classList[op](c.className);
    return this;
  }
  addClass(c) {
    return this.changeClass(c, "add");
  }
  toggleClass(c) {
    return this.changeClass(c, "toggle");
  }
  removeClass(c) {
    return this.changeClass(c, "remove");
  }
  remove() {
    this.$dom.remove();
    // WARN: GC が勝手にやってくれるので余計な処理かもしれない
    // let keys = Reflect.ownKeys(this);
    // for (let key of keys) delete this[key];
    // this.__proto__ = null;
  }
  registUpdate(updateFun) {
    updateFun = updateFun.bind(this);
    Updater.$instance.regist(() => {
      if (!updateFun) return false;
      let ok = updateFun();
      if (ok === false) this.remove();
      return ok;
    });
    return this;
  }

  // x y を設定すると absolute に floating にする
  floatPosition(updateX, updateY) {
    if (!this.isFloating) {
      this.$dom.style.position = "absolute";
      // this.$dom.style.contain = "layout paint";
    }
    this.isFloating = true;
    if (updateX) this.$dom.style.left = Style.withUnit(this.$x || 0);
    if (updateY) this.$dom.style.top = Style.withUnit(this.$y || 0);
  }
  set style(val) {
    Style.apply(val, this.$dom);
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
    return this.$dom.innerText || "";
  }
  set text(val) {
    this.$dom.innerText = val;
  }
  get width() {
    return this.$dom.offsetWidth;
  }
  get height() {
    return this.$dom.offsetHeight;
  }
  get frame() { // インスタンス化してからの経過フレーム
    return Updater.$instance.frame - this.$startFrame;
  }

  constructor(parent = document.body) {
    super().constructor.$regist();
    let attrs = this.constructor.attribute;
    this.$dom = document.createElement(attrs.tag || "div");
    if (parent.$dom) parent.$dom.appendChild(this.$dom);
    else parent.appendChild(this.$dom)
    for (let key in attrs) this.$dom[key] = attrs[key];
    this.$dom.className = this.constructor.className;
    if (this.update) this.registUpdate(this.update);
    this.$startFrame = Updater.$instance.frame;
    let methods = Reflect.ownKeys(this.constructor.prototype);
    for (let method of methods) {
      if (method.startsWith("on")) {
        let name = method.toLowerCase().replace(/^on/, "");
        this.$dom.addEventListener(name, this[method].bind(this));
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
    Style.$instance.regist(`body { margin:0px;padding 0px; } *{ box-sizing: border-box; }`);
    this.style = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }
  update() {
    // console.log(this.frame);
  }
  // update() {
  //   // おもそう
  //   this.style = {
  //     width: window.innerWidth,
  //     height: window.innerHeight,
  //   };
  // }
}
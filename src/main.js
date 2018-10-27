function appendStyle(code) {
  // WARN: 流用したほうがよい？
  let style = document.createElement("style");
  style.type = "text/css";
  style.innerHTML = code;
  document.head.appendChild(style);
}

function applyStyle(elem, style = {}) {
  const withUnit = x => (typeof (x) === "number" ? `${x}px` : x);
  for (let key in style) {
    let val = style[key];
    if (typeof (val) === "object") {
      let prefix = key; // 1階層まで省略できるように
      for (let kk in val) {
        let currentKey = kk === "" ? prefix : prefix + "-" + kk;
        elem.style[currentKey] = withUnit(val[kk]);
      }
    } else {
      elem.style[key] = withUnit(val);
    }
  }
}


function update(fun) {
  // WARN: 流用したほうが良い?(複数のrequestAnimationFrameは遅い?)
  let updateFun = () => {
    let ok = fun();
    if (ok !== false) requestAnimationFrame(updateFun);
  };
  updateFun();
}

function create(tag = "div", style = {}, options = {}, updateFunction = undefined) {
  let elem = document.createElement(tag);
  applyStyle(elem, style)
  for (let key in options) {
    if (key === "parent") options[key].appendChild(elem);
    else if (key === "update") update(options[key].bind(elem))
    else if (key !== "awake") elem[key] = options[key];
  }
  if (options["awake"]) options["awake"].bind(elem)();
  return elem;
}

if (true) {
  appendStyle(`@keyframes rot {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }`);

  class TestImage {
    constructor() {
      const square = 400;
      this.x = Math.floor(square * Math.random()) % square;
      this.y = Math.floor(square * Math.random()) % square;
    }
    get initialStyle() {
      return {
        position: "absolute",
        color: "#f00000",
        top: this.x,
        left: this.y,
        animation: {
          "": "rot 1s",
          "iteration-count": `infinite`,
        },
        border: {
          radius: 20,
          width: 3,
          style: "solid",
          color: "#000000",
        }
      };
    }
    get initialAttribute() {
      return {
        width: 100,
        src: "./img/img.png",
        parent: parent,
      };
    }
    update() {
      this.x++;
      this.y++;
      applyStyle(this, {
        top: this.x,
        left: this.y,
        transform: `rotate(${this.x + this.y}deg)`,
        "border-radius": this.x % 100
      });
      if (this.x > 500) {
        this.remove();
        return false;
      }
    }
  }

  function createImg(parent = document.body) {
    const square = 400;
    let x = Math.floor(square * Math.random()) % square;
    let y = Math.floor(square * Math.random()) % square;
    return create("img", {
      position: "absolute",
      color: "#f00000",
      top: x,
      left: y,
      animation: {
        "": "rot 1s",
        "iteration-count": `infinite`,
      },
      border: {
        radius: 20,
        width: 3,
        style: "solid",
        color: "#000000",
      }
    }, {
      width: 100,
      src: "./img/img.png",
      parent: parent,
      awake() {},
      update() {
        x++;
        y++;
        applyStyle(this, {
          top: x,
          left: y,
          transform: `rotate(${x + y}deg)`,
          "border-radius": x % 100
        });
        if (x > 500) {
          this.remove();
          return false;
        }
      }
    });
  }
  createImg();
  let i = 0;
  update(() => {
    i += 1;
    if (i % 10 == 0) createImg();
  });
}

if (true) {
  update(() => {
    let globalWidth = window.innerWidth;
    let globalHeight = screen.height;
    // console.log(globalWidth);
  });
}
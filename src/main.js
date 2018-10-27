function appendStyle(code) {
  // WARN: 流用したほうがよい？
  let style = document.createElement("style");
  style.type = "text/css";
  style.innerHTML = code;
  document.head.appendChild(style);
}

function create(tag = "div", style = {}, options = {}) {
  let elem = document.createElement(tag);
  for (let key in style) elem.style[key] = style[key];
  for (let key in options) elem[key] = options[key];
  return elem;
}

function repeat(fun) {
  // WARN: 流用したほうが良い?(複数のrequestAnimationFrameは遅い?)
  let repeatFun = () => {
    fun();
    requestAnimationFrame(repeatFun);
  };
  requestAnimationFrame(repeatFun);
}

if (true) {
  appendStyle(`@keyframes rot {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }`);
  let imgs = [];

  function createImg() {
    const square = 400;
    let x = Math.floor(square * Math.random()) % square;
    let y = Math.floor(square * Math.random()) % square;
    let img = create("img", {
      animation: "rot 1s",
      position: "absolute",
      color: "#f00000",
      // "animation-iteration-count": `infinite`,
      top: `${x}px`,
      left: `${y}px`,
      "border-radius": "20px",
    }, {
      width: 100,
      src: "./img/img.png",
    });
    // repeat(() => {
    //   img.style.transform = `rotate(${x + y}deg)`;
    //   x++;
    //   y++;
    //   img.style.top = `${x}px`;
    //   img.style.left = `${y}px`;
    // });
    return [img, {
      dom: img,
      x: x,
      y: y,
      isValid: true
    }];
  }

  function appendImg(parent = document.body) {
    let [img, data] = createImg();
    parent.appendChild(img);
    for (let i = 0; i < imgs.length; i++) {
      if (imgs[i].isValid) continue;
      imgs[i] = data;
      return;
    }
    imgs.push(data);
  }
  appendImg();
  let i = 0;
  repeat(() => {
    for (let img of imgs) {
      if (!img.isValid) continue;
      img.dom.style.transform = `rotate(${img.x + img.y}deg)`;
      img.x++;
      img.y++;
      img.dom.style.top = `${img.x}px`;
      img.dom.style.left = `${img.y}px`;
      if (img.x > 500) {
        img.dom.remove();
        img.isValid = false;
      }
    }
    i += 1;
    if (i % 10 == 0) appendImg();
  });
}

if (true) {
  repeat(() => {
    let globalWidth = window.innerWidth;
    let globalHeight = screen.height;
    // console.log(globalWidth);
  });
}
getProperties(): string[] {
  let result: string[] = []
  if (this.x !== undefined || this.y !== undefined) result.push("translate")
  // if (this.y !== undefined) result.push("translateY")
  if (this.scale !== undefined) result.push("scale")
  if (this.rotation !== undefined) result.push("rotate")
  return result
}


getProperties(): string[] {
  let result: string[] = []
  for (let key in this.option) {
    if (this.option[key] === undefined) continue
    result.push(key.replace(/([A-Z])/g, g => `-${g[0].toLowerCase()}`));
  }
  return result
}
// transform: "translateX(793px) translateY(60px) scale(0.5) rotate(0deg) "
// filter: " blur(5px)  drop-shadow(5px 5px 10px gray) "
//  -> blur(calc(var(--ib-filter-blur,0px) * var(--ip-filter-blur,1)))
// color: "#fff"
// position: "absolute"
// transform-origin: "center center"
// width: "486px"
// z-index: "100"
// ! custom-property は animation してくれない
// ! transition: [translateX,translateY,scale,drop-shadow,...]
export function getProperties(style: Style<any>): string[] {
  let result: string[] = []
  for (let key in style) {
    if (typeof style[key] !== "object" || !style[key].getProperties) {
      result.push(key)
      continue
    }
    let props = style[key].getProperties()
    if (typeof props === "string") result.push(props)
    else if (props instanceof Array) for (let p of props) result.push(p)
    else console.assert(false, "illegal property")
  }
  return result
}
export function separateCalcVarPercent(style: Style<string>, isPercent: boolean): [Style<string>, Style<string>] {
  let result: Style<string> = {}
  let varLists: Style<string> = {}
  for (let key in style) {
    let str = style[key]
    let others = str.split(/[.0-9]+[a-zA-Z]*/g)
    let nums = str.match(/[.0-9]+[a-zA-Z]*/g)
    if (nums === null || nums.length === 0) {
      result[key] = style[key];
      continue
    }
    console.assert(others.length === nums.length + 1, "invalid css separator")
    let strRes = others[0]
    let num = 0
    let preTag = "first"
    for (let i = 0; i < nums.length; i++) {
      let match = others[i].match(/[a-zA-Z]+/g)
      let tag = preTag
      if (match !== null && match[0] !== "") {
        tag = match[0]
        num = 1
      } else {
        num++;
      }
      let varName = "--" + key + "-" + tag + "-" + num
      let varVal = nums[i]
      if (!isPercent) varLists[varName + "-v"] = varVal
      else varLists[varName + "-p"] = varVal
      let zero = varVal.replace(/[0-9.]+/g, "0")
      strRes += `calc(var(${varName}-v,${zero}) * var(${varName}-p,1))` + others[i + 1]
      tag = preTag
    }
    result[key] = strRes
  }
  return [result, varLists]
}
// o:src x:dst -> src のまま / 他は補完
complement(srcOp: BoxOption, dstOp: BoxOption, per: number): BoxOption {
  let result: BoxOption = {}
  let src = this.parseBoxOption(srcOp)
  let dst = this.parseBoxOption(dstOp)
  for (let key in { ...src, ...dst }) {
    if (dst[key] === undefined) {
      continue
    } else if (dst[key].complement) {
      result[key] = dst[key].complement(src[key], per)
    } else if (typeof dst[key] !== "number") {
      result[key] = dst[key]
    } else {
      result[key] = dst[key] * per + (1 - per) * (src[key] || 0)
    }
  }
  return result
}
  private callBacks: { [key: number]: () => any } = { }
  private transitionMaxId = 0
to(dst: BoxOption, duration = 1, timingFunction: TimingFunction = "ease", delay = 0, id: number = undefined) {
  let src = this.getValues()
  if (timingFunction !== "linear" && timingFunction !== "ease") console.assert(false, "not implemented")
  if (id === undefined) {
    this.transitionMaxId++;
    id = this.transitionMaxId;
  }
  this.update(millisec => {
    // 割り込み percent ease を無視
    let j = millisec / 1000.0 - delay
    if (j < 0) return;
    if (j >= duration) {
      this.applyOption(dst)
      if (this.callBacks[id]) {
        this.callBacks[id]()
        delete this.callBacks[id]
      }
      return false;
    }
    let t = j / duration
    if (timingFunction === "ease") t = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
    this.applyOption(this.complement(src, dst, t))
  })
  return this
}
// 最後に登録した to / next が 終わってから発火する
next(option: BoxOption, duration = 1, timingFunction: TimingFunction = "ease", delay = 0) {
  this.transitionMaxId++;
  let id = this.transitionMaxId
  if (!this.callBacks[id - 1]) {
    this.callBacks[id - 1] = () => {
      this.to(option, duration, timingFunction, delay, id)
    }
  } else console.assert("illegal transition maxid")
  return this
}

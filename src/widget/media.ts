import { HasValueWidgetInterface, DOM } from "../dom";
// MEDIA :: audio / img / video / iframe / progress / meter
export class ProgressBar extends DOM {
  constructor(parent: DOM) {
    super(parent, "progress")
  }
}
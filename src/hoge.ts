export function hoge(input: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, input));
}
console.log("hoge");

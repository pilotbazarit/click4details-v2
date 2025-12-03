export default function getPixelToPercentageWidth(pixel: number) {
  return `${(pixel / window.innerWidth) * 100}%`;
}

// 设计稿以750为准
const referenceWidth = 750;
const referenceHeight = 1444;

export function getVw(px) {
  return (px / referenceWidth) * 100 + 'vw';
}

export function getVh(px) {
  return (px / referenceHeight) * 100 + 'vh';
}

// 字体大小兼容，默认转vw，打算根据media-query来按不同比例缩减
export function getFontSize(px) {
  return (px / referenceWidth) * 100 + 'vmin';
}

/**
 * 获取保额（万元）
 * @param {Number} limitMoney - 元
 * @return {Number} 返回万元
 */
export function getLimitMoney(limitMoney) {
  if (typeof limitMoney === 'number') {
    return limitMoney / 10000;
  }
  return '-';
}

/**
 * 获取保费（元）
 * @param {Number} priceMoney - 分
 * @return {Number} 返回元
 */
export function getPriceMoney(priceMoney) {
  if (typeof priceMoney === 'number') {
    return priceMoney / 100;
  }
  return '-';
}

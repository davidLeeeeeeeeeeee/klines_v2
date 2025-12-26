/**
 * 数字格式化工具函数
 */

/**
 * 将数字或字符串数字转换为千分位格式
 * @param value 数字或字符串数字
 * @param decimals 小数位数，默认为2
 * @returns 格式化后的字符串，如 "7,887.22"
 * 
 * @example
 * formatNumber(7887.22) // "7,887.22"
 * formatNumber("7887.22") // "7,887.22"
 * formatNumber(1234567.891) // "1,234,567.89"
 * formatNumber(1234567.891, 3) // "1,234,567.891"
 * formatNumber(1234567) // "1,234,567.00"
 * formatNumber(1234567, 0) // "1,234,567"
 * formatNumber(null) // "0.00"
 * formatNumber(undefined) // "0.00"
 * formatNumber("abc") // "0.00"
 */
export function formatNumber(value: number | string | null | undefined, decimals: number = 2): string {
  // 处理 null 或 undefined
  if (value === null || value === undefined) {
    return decimals > 0 ? `0.${'0'.repeat(decimals)}` : '0';
  }

  // 将字符串转换为数字
  let num: number;
  if (typeof value === 'string') {
    // 移除已有的千分位分隔符
    const cleanValue = value.replace(/,/g, '');
    num = parseFloat(cleanValue);
  } else {
    num = value;
  }

  // 如果转换后不是有效数字，返回默认值
  if (isNaN(num)) {
    return decimals > 0 ? `0.${'0'.repeat(decimals)}` : '0';
  }

  // 使用 toLocaleString 进行格式化
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * 将数字或字符串数字转换为带符号的千分位格式（用于显示盈亏）
 * @param value 数字或字符串数字
 * @param decimals 小数位数，默认为2
 * @returns 格式化后的字符串，正数带+号，负数带-号
 * 
 * @example
 * formatNumberWithSign(7887.22) // "+7,887.22"
 * formatNumberWithSign(-7887.22) // "-7,887.22"
 * formatNumberWithSign(0) // "0.00"
 */
export function formatNumberWithSign(value: number | string | null | undefined, decimals: number = 2): string {
  // 处理 null 或 undefined
  if (value === null || value === undefined) {
    return decimals > 0 ? `0.${'0'.repeat(decimals)}` : '0';
  }

  // 将字符串转换为数字
  let num: number;
  if (typeof value === 'string') {
    const cleanValue = value.replace(/,/g, '');
    num = parseFloat(cleanValue);
  } else {
    num = value;
  }

  // 如果转换后不是有效数字，返回默认值
  if (isNaN(num)) {
    return decimals > 0 ? `0.${'0'.repeat(decimals)}` : '0';
  }

  const formatted = Math.abs(num).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });

  if (num > 0) {
    return `+${formatted}`;
  } else if (num < 0) {
    return `-${formatted}`;
  }
  return formatted;
}

/**
 * 格式化货币金额（带货币符号）
 * @param value 数字或字符串数字
 * @param currency 货币符号，默认为 '$'
 * @param decimals 小数位数，默认为2
 * @returns 格式化后的字符串，如 "$7,887.22"
 */
export function formatCurrency(
  value: number | string | null | undefined, 
  currency: string = '$', 
  decimals: number = 2
): string {
  return `${currency}${formatNumber(value, decimals)}`;
}


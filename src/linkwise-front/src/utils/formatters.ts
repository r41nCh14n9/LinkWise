/**
 * 格式化工具函數
 * 處理數字、日期、貨幣等格式化
 */

import { CURRENCY_SYMBOLS } from './constants';

// ============================================================================
// 數字格式化
// ============================================================================

/**
 * 格式化大數字為易讀的形式
 * 例如: 1234567 -> 1,234,567
 */
export const formatNumber = (num: number, decimals = 0): string => {
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

/**
 * 格式化為簡化形式
 * 將大數字轉換為易讀的簡化單位表示
 * 
 * @param num - 要格式化的數字，支持正數、負數和零
 * @returns 簡化後的字符串表示
 * 
 * @example
 * ```
 * formatCompactNumber(1234567)   // => "1.2百萬"
 * formatCompactNumber(123456)    // => "12.3萬"
 * formatCompactNumber(1234)      // => "1.2千"
 * formatCompactNumber(-1234567)  // => "-1.2百萬"
 * formatCompactNumber(100)       // => "100"
 * ```
 * 
 * @remarks
 * 邊界情況處理:
 * - 零返回 "0"
 * - 負數：保留負號，使用絕對值計算後添加負號
 * - 小數精度：大數字保留 1 位小數
 */
export const formatCompactNumber = (num: number): string => {
  const isNegative = num < 0;
  const absNum = Math.abs(num);
  const sign = isNegative ? '-' : '';

  if (absNum >= 1000000) {
    return `${sign}${(absNum / 1000000).toFixed(1)}百萬`;
  }
  if (absNum >= 100000) {
    return `${sign}${(absNum / 10000).toFixed(1)}萬`;
  }
  if (absNum >= 1000) {
    return `${sign}${(absNum / 1000).toFixed(1)}千`;
  }
  return num.toString();
};

/**
 * 格式化百分比
 * 例如: 12.5 -> 12.5%
 */
export const formatPercentage = (num: number, decimals = 1): string => {
  return `${formatNumber(num, decimals)}%`;
};

/**
 * 格式化為貨幣格式
 * 例如: (1234567.89, 'CNY') -> ¥1,234,567.89
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'CNY',
  decimals = 2
): string => {
  const symbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || currency;
  const formatted = formatNumber(amount, decimals);
  return `${symbol}${formatted}`;
};

/**
 * 格式化趨勢指示器
 * 例如: 12 -> "+12% ↑", -5 -> "-5% ↓"
 */
export const formatTrendIndicator = (trend: number): {
  text: string;
  icon: string;
  color: string;
} => {
  const sign = trend >= 0 ? '+' : '';
  const icon = trend >= 0 ? '↑' : '↓';
  const color = trend >= 0 ? '#10b981' : '#ef4444'; // 綠/紅

  return {
    text: `${sign}${trend}%`,
    icon,
    color,
  };
};

// ============================================================================
// 日期格式化
// ============================================================================

/**
 * 格式化日期為 YYYY-MM-DD
 */
export const formatDate = (date: Date | string, format = 'YYYY-MM-DD'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');

  if (format === 'YYYY-MM-DD') {
    return `${year}-${month}-${day}`;
  }

  if (format === 'YYYY/MM/DD') {
    return `${year}/${month}/${day}`;
  }

  if (format === 'MM-DD') {
    return `${month}-${day}`;
  }

  if (format === 'YYYY-MM') {
    return `${year}-${month}`;
  }

  return dateObj.toLocaleDateString('zh-CN');
};

/**
 * 格式化日期為相對時間
 * 例如: 2 小時前, 1 天前
 */
export const formatRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
    return '剛剛';
  }
  if (diffMins < 60) {
    return `${diffMins} 分鐘前`;
  }
  if (diffHours < 24) {
    return `${diffHours} 小時前`;
  }
  if (diffDays < 7) {
    return `${diffDays} 天前`;
  }

  return formatDate(dateObj);
};

/**
 * 格式化月份
 * 例如: 2026-05 -> 2026年5月
 */
export const formatMonth = (monthStr: string): string => {
  const [year, month] = monthStr.split('-');
  return `${year}年${parseInt(month)}月`;
};

// ============================================================================
// 字符串格式化
// ============================================================================

/**
 * 截斷字符串到指定長度
 */
export const truncateString = (str: string, length: number, suffix = '...'): string => {
  if (str.length <= length) {
    return str;
  }
  return str.substring(0, length) + suffix;
};

/**
 * 格式化供應商名稱（首字母大寫）
 */
export const formatVendorName = (name: string): string => {
  return name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * 將駝峰命名轉為可讀文本
 * 例如: vendorName -> Vendor Name
 */
export const formatCamelCase = (str: string): string => {
  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (match) => match.toUpperCase());
};

// ============================================================================
// 驗證和轉換
// ============================================================================

/**
 * 確保數字在指定範圍內
 */
export const clampNumber = (num: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, num));
};

/**
 * 安全地解析數字
 */
export const safeParseNumber = (value: any, defaultValue = 0): number => {
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

/**
 * 安全地獲取嵌套對象值
 */
export const safeGet = (obj: any, path: string, defaultValue = undefined): any => {
  const keys = path.split('.');
  let result = obj;

  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      return defaultValue;
    }
  }

  return result;
};

// ============================================================================
// 數據聚合和計算
// ============================================================================

/**
 * 計算總和
 */
export const calculateSum = (arr: number[]): number => {
  return arr.reduce((sum, num) => sum + num, 0);
};

/**
 * 計算平均值
 */
export const calculateAverage = (arr: number[]): number => {
  if (arr.length === 0) return 0;
  return calculateSum(arr) / arr.length;
};

/**
 * 計算百分比變化
 */
export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

/**
 * 查找最大值和最小值
 */
export const findMinMax = (arr: number[]): { min: number; max: number } => {
  return {
    min: Math.min(...arr),
    max: Math.max(...arr),
  };
};

/**
 * 計算中位數
 */
export const calculateMedian = (arr: number[]): number => {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

// ============================================================================
// 導出
// ============================================================================

export {
  formatNumber,
  formatCompactNumber,
  formatPercentage,
  formatCurrency,
  formatTrendIndicator,
  formatDate,
  formatRelativeTime,
  formatMonth,
  truncateString,
  formatVendorName,
  formatCamelCase,
  clampNumber,
  safeParseNumber,
  safeGet,
  calculateSum,
  calculateAverage,
  calculatePercentageChange,
  findMinMax,
  calculateMedian,
};

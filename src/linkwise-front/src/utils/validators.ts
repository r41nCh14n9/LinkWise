/**
 * 驗證工具函數
 * 驗證數據格式、範圍和類型
 */

// ============================================================================
// 類型檢查
// ============================================================================

export const isNumber = (value: any): value is number => {
  return typeof value === 'number' && !isNaN(value);
};

export const isString = (value: any): value is string => {
  return typeof value === 'string';
};

export const isArray = (value: any): value is any[] => {
  return Array.isArray(value);
};

export const isObject = (value: any): value is Record<string, any> => {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
};

export const isBoolean = (value: any): value is boolean => {
  return typeof value === 'boolean';
};

export const isNull = (value: any): value is null => {
  return value === null;
};

export const isUndefined = (value: any): value is undefined => {
  return value === undefined;
};

export const isEmpty = (value: any): boolean => {
  if (isNull(value) || isUndefined(value)) return true;
  if (isString(value)) return value.trim().length === 0;
  if (isArray(value)) return value.length === 0;
  if (isObject(value)) return Object.keys(value).length === 0;
  return false;
};

// ============================================================================
// 數值驗證
// ============================================================================

export const isPositive = (value: number): boolean => {
  return isNumber(value) && value > 0;
};

export const isNonNegative = (value: number): boolean => {
  return isNumber(value) && value >= 0;
};

export const isInRange = (value: number, min: number, max: number): boolean => {
  return isNumber(value) && value >= min && value <= max;
};

export const isPercentage = (value: number): boolean => {
  return isInRange(value, 0, 100);
};

// ============================================================================
// 字符串驗證
// ============================================================================

export const isEmail = (value: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return isString(value) && emailRegex.test(value);
};

export const isPhone = (value: string): boolean => {
  const phoneRegex = /^1[3-9]\d{9}$/; // 中國手機號
  return isString(value) && phoneRegex.test(value);
};

export const isIDCard = (value: string): boolean => {
  // 簡化的 ID 卡檢查
  return isString(value) && (value.length === 18 || value.length === 15);
};

// ============================================================================
// 日期驗證
// ============================================================================

export const isValidDate = (date: any): boolean => {
  if (date instanceof Date) {
    return !isNaN(date.getTime());
  }
  if (isString(date)) {
    return !isNaN(new Date(date).getTime());
  }
  return false;
};

export const isDateBefore = (date1: Date | string, date2: Date | string): boolean => {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  return d1.getTime() < d2.getTime();
};

export const isDateAfter = (date1: Date | string, date2: Date | string): boolean => {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  return d1.getTime() > d2.getTime();
};

// ============================================================================
// API 響應驗證
// ============================================================================

export const isValidApiResponse = (response: any): boolean => {
  return (
    isObject(response) &&
    isNumber(response.code) &&
    isString(response.message) &&
    isString(response.timestamp)
  );
};

export const isSuccessResponse = (response: any): boolean => {
  return isValidApiResponse(response) && response.code === 200;
};

// ============================================================================
// Dashboard 數據驗證
// ============================================================================

export const isValidSummaryCards = (data: any): boolean => {
  return (
    isObject(data) &&
    isObject(data.monthlyExpense) &&
    isNumber(data.monthlyExpense.amount) &&
    isString(data.monthlyExpense.currency) &&
    isNumber(data.activeVendors) &&
    isNumber(data.pendingPRs) &&
    isNumber(data.inventoryWarnings)
  );
};

export const isValidExpenseTrend = (data: any): boolean => {
  return (
    isObject(data) &&
    isString(data.timeRange) &&
    isArray(data.monthlyData) &&
    isObject(data.budgetComparison) &&
    isObject(data.costCenterAnalysis)
  );
};

export const isValidVendorScoring = (data: any): boolean => {
  return (
    isObject(data) &&
    isArray(data.vendorScores) &&
    isObject(data.riskDistribution)
  );
};

export const isValidPRPOFunnel = (data: any): boolean => {
  return (
    isObject(data) &&
    isArray(data.funnel) &&
    isObject(data.conversionRates) &&
    isArray(data.bottlenecks)
  );
};

export const isValidRecentOperations = (data: any): boolean => {
  return (
    isObject(data) &&
    isArray(data.recentPRs) &&
    isArray(data.recentVendors) &&
    isArray(data.quickActions)
  );
};

// ============================================================================
// 風險等級驗證
// ============================================================================

export const isValidRiskLevel = (level: any): level is 'LOW' | 'MEDIUM' | 'HIGH' => {
  return isString(level) && ['LOW', 'MEDIUM', 'HIGH'].includes(level);
};

// ============================================================================
// 時間範圍驗證
// ============================================================================

export const isValidTimeRange = (range: any): range is '6MONTHS' | '12MONTHS' => {
  return isString(range) && ['6MONTHS', '12MONTHS'].includes(range);
};

// ============================================================================
// 複合驗證
// ============================================================================

export const validateRequired = (value: any, fieldName: string): { valid: boolean; error?: string } => {
  if (isEmpty(value)) {
    return { valid: false, error: `${fieldName} is required` };
  }
  return { valid: true };
};

export const validateNumber = (value: any, fieldName: string, min?: number, max?: number): { valid: boolean; error?: string } => {
  if (!isNumber(value)) {
    return { valid: false, error: `${fieldName} must be a number` };
  }
  if (isNumber(min) && value < min) {
    return { valid: false, error: `${fieldName} must be >= ${min}` };
  }
  if (isNumber(max) && value > max) {
    return { valid: false, error: `${fieldName} must be <= ${max}` };
  }
  return { valid: true };
};

export const validateString = (value: any, fieldName: string, minLength = 0, maxLength = Infinity): { valid: boolean; error?: string } => {
  if (!isString(value)) {
    return { valid: false, error: `${fieldName} must be a string` };
  }
  if (value.length < minLength) {
    return { valid: false, error: `${fieldName} must be at least ${minLength} characters` };
  }
  if (value.length > maxLength) {
    return { valid: false, error: `${fieldName} must be at most ${maxLength} characters` };
  }
  return { valid: true };
};

// ============================================================================
// 導出
// ============================================================================

export {
  isNumber,
  isString,
  isArray,
  isObject,
  isBoolean,
  isNull,
  isUndefined,
  isEmpty,
  isPositive,
  isNonNegative,
  isInRange,
  isPercentage,
  isEmail,
  isPhone,
  isIDCard,
  isValidDate,
  isDateBefore,
  isDateAfter,
  isValidApiResponse,
  isSuccessResponse,
  isValidSummaryCards,
  isValidExpenseTrend,
  isValidVendorScoring,
  isValidPRPOFunnel,
  isValidRecentOperations,
  isValidRiskLevel,
  isValidTimeRange,
  validateRequired,
  validateNumber,
  validateString,
};

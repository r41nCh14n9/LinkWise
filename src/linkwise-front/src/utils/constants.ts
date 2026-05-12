/**
 * 常量定義
 */

// ============================================================================
// API 端點
// ============================================================================

export const API_ENDPOINTS = {
  DASHBOARD: '/api/v1/dashboard',
  SUMMARY: '/api/v1/dashboard/summary',
  SPENDING_TREND: '/api/v1/dashboard/spending-trend',
  SPENDING_TREND_EXPORT: '/api/v1/dashboard/spending-trend/export',
  VENDOR_SCORING: '/api/v1/dashboard/vendor-scoring',
  PIPELINE_FUNNEL: '/api/v1/dashboard/pipeline-funnel',
  RECENT_OPERATIONS: '/api/v1/dashboard/recent-operations',
  HEALTH: '/api/v1/dashboard/health',
} as const;

// ============================================================================
// 時間範圍選項
// ============================================================================

export const TIME_RANGES = {
  SIX_MONTHS: '6MONTHS' as const,
  TWELVE_MONTHS: '12MONTHS' as const,
} as const;

export const TIME_RANGE_LABELS = {
  '6MONTHS': '過去 6 個月',
  '12MONTHS': '過去 12 個月',
} as const;

// ============================================================================
// 風險等級
// ============================================================================

export const RISK_LEVELS = {
  LOW: 'LOW' as const,
  MEDIUM: 'MEDIUM' as const,
  HIGH: 'HIGH' as const,
} as const;

export const RISK_LEVEL_LABELS = {
  LOW: '低風險',
  MEDIUM: '中風險',
  HIGH: '高風險',
} as const;

export const RISK_LEVEL_COLORS = {
  LOW: '#10b981', // 綠色
  MEDIUM: '#f59e0b', // 黃色
  HIGH: '#ef4444', // 紅色
} as const;

export const RISK_LEVEL_BG_COLORS = {
  LOW: '#d1fae5', // 淺綠色
  MEDIUM: '#fef3c7', // 淺黃色
  HIGH: '#fee2e2', // 淺紅色
} as const;

// ============================================================================
// PR/PO 狀態
// ============================================================================

export const PR_PO_STATUSES = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  APPROVED: 'APPROVED',
  RECEIVED: 'RECEIVED',
} as const;

export const PR_PO_STATUS_LABELS = {
  DRAFT: '草稿',
  SUBMITTED: '已提交',
  APPROVED: '已批准',
  RECEIVED: '已收貨',
} as const;

export const PR_PO_STATUS_COLORS = {
  DRAFT: '#6b7280',
  SUBMITTED: '#3b82f6',
  APPROVED: '#10b981',
  RECEIVED: '#8b5cf6',
} as const;

// ============================================================================
// 快速操作類型
// ============================================================================

export const QUICK_ACTION_TYPES = {
  CREATE_PR: 'CREATE_PR',
  VIEW_VENDOR: 'VIEW_VENDOR',
  VIEW_PO: 'VIEW_PO',
  APPROVE_PR: 'APPROVE_PR',
} as const;

export const QUICK_ACTION_LABELS = {
  CREATE_PR: '創建 PR',
  VIEW_VENDOR: '查看供應商',
  VIEW_PO: '查看 PO',
  APPROVE_PR: '批准 PR',
} as const;

// ============================================================================
// 漏斗階段
// ============================================================================

export const FUNNEL_STAGES = [
  { name: 'Draft', label: '草稿' },
  { name: 'Submitted', label: '已提交' },
  { name: 'Approved', label: '已批准' },
  { name: 'PO Created', label: 'PO 已建立' },
  { name: 'Received', label: '已收貨' },
] as const;

// ============================================================================
// 部門名稱
// ============================================================================

export const DEPARTMENTS = {
  MARKETING: '市場部',
  OPERATIONS: '運營部',
  PROCUREMENT: '採購部',
  FINANCE: '財務部',
  IT: 'IT 部門',
} as const;

// ============================================================================
// 類別名稱
// ============================================================================

export const CATEGORIES = {
  LOGISTICS: '物流',
  RAW_MATERIALS: '原材料',
  SERVICES: '服務',
  EQUIPMENT: '設備',
  OFFICE_SUPPLIES: '辦公用品',
} as const;

// ============================================================================
// 貨幣
// ============================================================================

export const CURRENCIES = {
  CNY: 'CNY',
  USD: 'USD',
  EUR: 'EUR',
} as const;

export const CURRENCY_SYMBOLS = {
  CNY: '¥',
  USD: '$',
  EUR: '€',
} as const;

// ============================================================================
// 分頁大小
// ============================================================================

export const PAGE_SIZES = {
  SMALL: 10,
  MEDIUM: 20,
  LARGE: 50,
} as const;

// ============================================================================
// 快取過期時間 (毫秒)
// ============================================================================

export const CACHE_DURATIONS = {
  SHORT: 2 * 60 * 1000, // 2 分鐘
  MEDIUM: 5 * 60 * 1000, // 5 分鐘
  LONG: 30 * 60 * 1000, // 30 分鐘
  VERY_LONG: 60 * 60 * 1000, // 1 小時
} as const;

// ============================================================================
// 響應時間門檻 (毫秒)
// ============================================================================

export const PERFORMANCE_THRESHOLDS = {
  EXCELLENT: 100,
  GOOD: 300,
  ACCEPTABLE: 500,
  POOR: 1000,
} as const;

// ============================================================================
// 默認參數
// ============================================================================

export const DEFAULTS = {
  ORGANIZATION_ID: 1,
  USER_ID: 1,
  TIME_RANGE: '6MONTHS' as const,
  LIMIT: 20,
  OFFSET: 0,
} as const;

// ============================================================================
// 導出
// ============================================================================

export type RiskLevel = keyof typeof RISK_LEVEL_LABELS;
export type TimeRange = keyof typeof TIME_RANGE_LABELS;
export type PRPOStatus = keyof typeof PR_PO_STATUS_LABELS;

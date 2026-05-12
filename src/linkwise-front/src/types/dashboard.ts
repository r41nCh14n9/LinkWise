/**
 * Dashboard DTO 類型定義
 * 對應後端 API 響應格式
 */

// ============================================================================
// 摘要卡片相關類型
// ============================================================================

export interface MonthlyExpenseDTO {
  amount: number;
  currency: string;
  trend: number; // 增減百分比，例如 12 代表 +12%
  departmentBreakdown: Record<string, number>;
  categoryBreakdown: Record<string, number>;
  updatedAt?: string; // 可選
}

export interface ActiveVendorsDTO {
  count: number;
  trend: number;
  byCategory?: Record<string, number>;
}

export interface PendingPRsDTO {
  count: number;
  overdue: number;
  byCostCenter?: Record<string, number>;
}

export interface InventoryWarningsDTO {
  count: number;
  criticalItems?: string[];
}

export interface SummaryCardsDTO {
  monthlyExpense: MonthlyExpenseDTO;
  activeVendors: ActiveVendorsDTO;
  pendingPRs: PendingPRsDTO;
  inventoryWarnings: InventoryWarningsDTO;
}

// ============================================================================
// 支出趨勢相關類型
// ============================================================================

export interface MonthlyExpenseDataDTO {
  month: string; // 格式: YYYY-MM
  totalExpense: number;
  byDepartment: Record<string, number>;
  byCategory: Record<string, number>;
  byVendor: Record<string, number>;
}

export interface BudgetComparisonDTO {
  budgeted: number;
  actual: number;
  variance: number;
}

export interface CostCenterAnalysisDTO {
  [costCenterId: string]: {
    amount: number;
    trend: number; // 百分比
  };
}

export interface ExpenseTrendDTO {
  timeRange: string; // "6MONTHS" | "12MONTHS"
  monthlyData: MonthlyExpenseDataDTO[];
  isExportable: boolean;
  reportGenerationStatus: string; // "GENERATED" | "PROCESSING"
  budgetComparison: BudgetComparisonDTO;
  costCenterAnalysis: CostCenterAnalysisDTO;
  currencyUnit: string;
}

// ============================================================================
// 供應商評分相關類型
// ============================================================================

export interface VendorScoreDetailDTO {
  vendorId: string;
  vendorName: string;
  overallScore: number; // 0-100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  dimensions: {
    financial: number;
    delivery: number;
    quality: number;
    compliance: number;
  };
  trend: number; // 历史趋势百分比
  alerts?: string[]; // 風險告警信息
}

export interface RiskDistributionDTO {
  LOW: number;
  MEDIUM: number;
  HIGH: number;
}

export interface VendorScoringDTO {
  vendorScores: VendorScoreDetailDTO[];
  riskDistribution: RiskDistributionDTO;
  lastUpdated: string; // ISO 8601 日期字符串
}

// ============================================================================
// PR/PO 漏斗相關類型
// ============================================================================

export interface FunnelStageDTO {
  stageName: string;
  count: number;
  percentage: number;
}

export interface BottleneckDTO {
  stageName: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface PRPOFunnelDTO {
  funnel: FunnelStageDTO[];
  conversionRates: Record<string, number>; // "stage1->stage2": 85.5
  bottlenecks: BottleneckDTO[];
  totalPRs: number;
  totalPOs: number;
}

// ============================================================================
// 最近操作相關類型
// ============================================================================

export interface RecentPRDTO {
  prId: string;
  prNumber: string;
  amount: number;
  status: string; // "DRAFT" | "SUBMITTED" | "APPROVED" | "RECEIVED"
  vendorName: string;
  createdDate: string; // ISO 8601
  updatedDate: string; // ISO 8601
}

export interface RecentVendorDTO {
  vendorId: string;
  vendorName: string;
  score: number;
  lastOrderDate: string; // ISO 8601
}

export interface QuickActionDTO {
  actionId: string;
  actionName: string;
  actionType: 'CREATE_PR' | 'VIEW_VENDOR' | 'VIEW_PO' | 'APPROVE_PR';
  icon?: string;
}

export interface RecentOperationsDTO {
  recentPRs: RecentPRDTO[];
  recentVendors: RecentVendorDTO[];
  quickActions: QuickActionDTO[];
}

// ============================================================================
// 完整 Dashboard DTO
// ============================================================================

export interface DashboardDTO {
  summaryCards: SummaryCardsDTO;
  spendingTrend: ExpenseTrendDTO;
  vendorScoring: VendorScoringDTO;
  prpoFunnel: PRPOFunnelDTO;
  recentOperations: RecentOperationsDTO;
}

// ============================================================================
// API 請求參數類型
// ============================================================================

export interface DashboardQueryParams {
  organizationId: number;
  userId?: number;
}

export interface SpendingTrendParams extends DashboardQueryParams {
  timeRange?: '6MONTHS' | '12MONTHS';
  startDate?: string;
  endDate?: string;
}

export interface VendorScoringParams extends DashboardQueryParams {
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  sortBy?: 'score' | 'name';
  limit?: number;
}

export interface RecentOperationsParams extends DashboardQueryParams {
  limit?: number;
  offset?: number;
}

// ============================================================================
// API 響應包裝類型
// ============================================================================

export interface ApiResponse<T> {
  code: number;
  message: string;
  data?: T;
  timestamp: string;
}

export interface ApiErrorResponse {
  code: number;
  message: string;
  timestamp: string;
}

// ============================================================================
// 數據映射函數
// ============================================================================

import type { DashboardSummary } from '../types';

export const mapSummaryCardsToState = (dto: SummaryCardsDTO): DashboardSummary => {
  return {
    monthlyExpense: {
      amount: dto.monthlyExpense.amount,
      currency: dto.monthlyExpense.currency,
      trend: dto.monthlyExpense.trend,
      departmentBreakdown: dto.monthlyExpense.departmentBreakdown,
      categoryBreakdown: dto.monthlyExpense.categoryBreakdown,
      updatedAt: dto.monthlyExpense.updatedAt || new Date().toISOString(),
    },
    activeVendors: {
      count: dto.activeVendors.count,
      trend: dto.activeVendors.trend,
      byCategory: dto.activeVendors.byCategory || {},
    },
    pendingPRs: {
      count: dto.pendingPRs.count,
      overdue: dto.pendingPRs.overdue,
      byCostCenter: dto.pendingPRs.byCostCenter || {},
    },
    inventoryWarnings: {
      count: dto.inventoryWarnings.count,
      criticalItems: dto.inventoryWarnings.criticalItems || [],
    },
  };
};



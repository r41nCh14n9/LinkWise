/**
 * 自定義 React Hooks
 * 處理 Dashboard 數據獲取、快取和狀態管理
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { dashboardApiClient } from '../services/api';
import type {
  DashboardDTO,
  SummaryCardsDTO,
  ExpenseTrendDTO,
  VendorScoringDTO,
  PRPOFunnelDTO,
  RecentOperationsDTO,
  DashboardQueryParams,
  SpendingTrendParams,
  VendorScoringParams,
  RecentOperationsParams,
} from '../types/dashboard';

// ============================================================================
// 類型定義
// ============================================================================

interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// ============================================================================
// 快取管理
// ============================================================================

const CACHE_DURATION = 5 * 60 * 1000; // 5 分鐘快取
const cache = new Map<string, CacheEntry<any>>();

const getCacheKey = (prefix: string, params: any): string => {
  return `${prefix}:${JSON.stringify(params)}`;
};

const getCachedData = <T>(key: string): T | null => {
  const entry = cache.get(key);
  if (!entry) return null;

  const now = Date.now();
  if (now - entry.timestamp > CACHE_DURATION) {
    cache.delete(key);
    return null;
  }

  return entry.data as T;
};

const setCachedData = <T>(key: string, data: T): void => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
};

const clearCache = (): void => {
  cache.clear();
};

// ============================================================================
// 通用數據獲取 Hook
// ============================================================================

/**
 * 通用的異步數據獲取 Hook，支持快取
 */
function useAsyncData<T>(
  fetchFn: () => Promise<T>,
  cacheKey: string | null,
  dependencies: any[] = []
): UseAsyncState<T> {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    const fetchData = async () => {
      try {
        // 嘗試從快取獲取
        if (cacheKey) {
          const cachedData = getCachedData<T>(cacheKey);
          if (cachedData) {
            if (isMountedRef.current) {
              setState({ data: cachedData, loading: false, error: null });
            }
            return;
          }
        }

        // 從 API 獲取
        const data = await fetchFn();
        if (isMountedRef.current) {
          setState({ data, loading: false, error: null });
          if (cacheKey) {
            setCachedData(cacheKey, data);
          }
        }
      } catch (error) {
        if (isMountedRef.current) {
          setState({
            data: null,
            loading: false,
            error: error instanceof Error ? error : new Error('Unknown error'),
          });
        }
      }
    };

    fetchData();

    return () => {
      isMountedRef.current = false;
    };
  }, dependencies);

  return state;
}

// ============================================================================
// 特定功能的 Hooks
// ============================================================================

/**
 * 獲取完整 Dashboard 數據
 * 
 * @param params - Dashboard 查詢參數，必須包含 organizationId
 * @returns UseAsyncState<DashboardDTO> - 包含完整 Dashboard 數據的異步狀態
 * 
 * @example
 * ```typescript
 * const { data, loading, error } = useDashboard({ 
 *   organizationId: 'org-123',
 *   userId: 'user-456' 
 * });
 * if (loading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage error={error} />;
 * return <DashboardLayout data={data} />;
 * ```
 */
export function useDashboard(params: DashboardQueryParams): UseAsyncState<DashboardDTO> {
  const cacheKey = getCacheKey('dashboard', params);

  return useAsyncData(
    () => dashboardApiClient.getDashboard(params),
    cacheKey,
    [params.organizationId, params.userId]
  );
}

/**
 * 獲取摘要卡片數據
 * 
 * @param params - Dashboard 查詢參數，必須包含 organizationId
 * @returns UseAsyncState<SummaryCardsDTO> - 包含 4 張摘要卡片數據的異步狀態
 * 
 * 摘要卡片包括:
 * - 月度支出 (Monthly Expense)
 * - 活躍供應商計數 (Active Vendors)
 * - 待處理 PR 計數 (Pending PRs)
 * - 庫存預警計數 (Inventory Warnings)
 */
export function useSummaryCards(params: DashboardQueryParams): UseAsyncState<SummaryCardsDTO> {
  const cacheKey = getCacheKey('summaryCards', params);

  return useAsyncData(
    () => dashboardApiClient.getSummaryCards(params),
    cacheKey,
    [params.organizationId]
  );
}

/**
 * 獲取支出趨勢數據
 * 
 * @param params - 支出查詢參數，必須包含 organizationId
 * @returns UseAsyncState<ExpenseTrendDTO> - 包含支出趨勢數據的異步狀態
 * 
 * 支持的時間範圍:
 * - '6MONTHS' (默認) - 過去 6 個月
 * - '12MONTHS' - 過去 12 個月
 */
export function useSpendingTrend(params: SpendingTrendParams): UseAsyncState<ExpenseTrendDTO> {
  const cacheKey = getCacheKey('spendingTrend', params);

  return useAsyncData(
    () => dashboardApiClient.getSpendingTrend(params),
    cacheKey,
    [params.organizationId, params.timeRange]
  );
}

/**
 * 獲取供應商評分數據
 * 
 * @param params - 供應商查詢參數
 * @returns UseAsyncState<VendorScoringDTO> - 包含供應商評分的異步狀態
 * 
 * 支持的風險等級篩選:
 * - 'LOW' - 低風險
 * - 'MEDIUM' - 中等風險
 * - 'HIGH' - 高風險
 * - undefined - 所有風險等級 (默認)
 */
export function useVendorScoring(params: VendorScoringParams): UseAsyncState<VendorScoringDTO> {
  const cacheKey = getCacheKey('vendorScoring', params);

  return useAsyncData(
    () => dashboardApiClient.getVendorScoring(params),
    cacheKey,
    [params.organizationId, params.riskLevel, params.limit]
  );
}

/**
 * 獲取 PR/PO 漏斗數據
 * 
 * @param params - Dashboard 查詢參數
 * @returns UseAsyncState<PRPOFunnelDTO> - 包含 PR/PO 漏斗數據的異步狀態
 * 
 * 漏斗階段包括:
 * - Draft (草稿)
 * - Pending Review (待審核)
 * - Approved (已批准)
 * - Ordered (已下單)
 */
export function usePRPOFunnel(params: DashboardQueryParams): UseAsyncState<PRPOFunnelDTO> {
  const cacheKey = getCacheKey('prpoFunnel', params);

  return useAsyncData(
    () => dashboardApiClient.getPRPOFunnel(params),
    cacheKey,
    [params.organizationId]
  );
}

/**
 * 獲取最近操作數據
 * 
 * @param params - 最近操作查詢參數
 * @returns UseAsyncState<RecentOperationsDTO> - 包含最近操作數據的異步狀態
 * 
 * 返回數據包括:
 * - 最近的 PR (Recent PRs)
 * - 最近新增的供應商 (Recent Vendors)
 * - 快速操作列表 (Quick Actions)
 */
export function useRecentOperations(params: RecentOperationsParams): UseAsyncState<RecentOperationsDTO> {
  const cacheKey = getCacheKey('recentOperations', params);

  return useAsyncData(
    () => dashboardApiClient.getRecentOperations(params),
    cacheKey,
    [params.organizationId, params.limit, params.offset]
  );
}

/**
 * 健康檢查
 */
export function useHealthCheck() {
  const [state, setState] = useState<UseAsyncState<{ status: string }>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    dashboardApiClient
      .health()
      .then((data) => {
        if (isMounted) {
          setState({ data, loading: false, error: null });
        }
      })
      .catch((error) => {
        if (isMounted) {
          setState({
            data: null,
            loading: false,
            error: error instanceof Error ? error : new Error('Health check failed'),
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return state;
}

// ============================================================================
// 工具 Hooks
// ============================================================================

/**
 * 時間範圍管理 Hook
 * 
 * @param defaultRange - 默認時間範圍，默認為 '6MONTHS'
 * @returns 包含當前時間範圍和切換函數的對象
 * 
 * @example
 * ```typescript
 * const { timeRange, switchTimeRange } = useTimeRange('6MONTHS');
 * 
 * return (
 *   <div>
 *     <button onClick={() => switchTimeRange('6MONTHS')}>過去 6 個月</button>
 *     <button onClick={() => switchTimeRange('12MONTHS')}>過去 12 個月</button>
 *     <Chart data={getDataByRange(timeRange)} />
 *   </div>
 * );
 * ```
 */
export function useTimeRange(
  defaultRange: '6MONTHS' | '12MONTHS' = '6MONTHS'
): {
  timeRange: '6MONTHS' | '12MONTHS';
  switchTimeRange: (range: '6MONTHS' | '12MONTHS') => void;
} {
  const [timeRange, setTimeRange] = useState<'6MONTHS' | '12MONTHS'>(defaultRange);

  const switchTimeRange = useCallback((range: '6MONTHS' | '12MONTHS') => {
    setTimeRange(range);
  }, []);

  return { timeRange, switchTimeRange };
}

/**
 * 風險等級篩選 Hook
 * 
 * @returns 包含選定的風險等級和相關操作函數的對象
 * 
 * 支持的風險等級:
 * - 'LOW' - 低風險 (綠色)
 * - 'MEDIUM' - 中等風險 (黃色)
 * - 'HIGH' - 高風險 (紅色)
 * 
 * @example
 * ```typescript
 * const { selectedRisks, toggleRiskLevel, resetFilters } = useRiskLevelFilter();
 * 
 * return (
 *   <div>
 *     {['LOW', 'MEDIUM', 'HIGH'].map((risk) => (
 *       <Checkbox
 *         key={risk}
 *         checked={selectedRisks.includes(risk)}
 *         onChange={() => toggleRiskLevel(risk)}
 *         label={`${risk} Risk`}
 *       />
 *     ))}
 *     <Button onClick={resetFilters}>重置篩選</Button>
 *   </div>
 * );
 * ```
 */
export function useRiskLevelFilter(): {
  selectedRisks: ('LOW' | 'MEDIUM' | 'HIGH')[];
  toggleRiskLevel: (risk: 'LOW' | 'MEDIUM' | 'HIGH') => void;
  resetFilters: () => void;
} {
  const [selectedRisks, setSelectedRisks] = useState<Set<'LOW' | 'MEDIUM' | 'HIGH'>>(
    new Set(['LOW', 'MEDIUM', 'HIGH'])
  );

  const toggleRiskLevel = useCallback((risk: 'LOW' | 'MEDIUM' | 'HIGH') => {
    setSelectedRisks((prev) => {
      const next = new Set(prev);
      if (next.has(risk)) {
        next.delete(risk);
      } else {
        next.add(risk);
      }
      return next;
    });
  }, []);

  const resetFilters = useCallback(() => {
    setSelectedRisks(new Set(['LOW', 'MEDIUM', 'HIGH']));
  }, []);

  return { selectedRisks: Array.from(selectedRisks), toggleRiskLevel, resetFilters };
}

// ============================================================================
// 快取管理 Hook
// ============================================================================

/**
 * 刷新數據 Hook - 清除快取並重新獲取
 */
export function useRefreshData() {
  return useCallback(() => {
    clearCache();
  }, []);
}

// ============================================================================
// 導出
// ============================================================================

export {
  useAsyncData,
  getCacheKey,
  getCachedData,
  setCachedData,
  clearCache,
};

export type { UseAsyncState };

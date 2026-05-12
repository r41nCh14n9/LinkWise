/**\n * Dashboard 主頁面組件 - Phase 1 完成 (骨架)\n *\n * 本組件整合所有 Dashboard 功能模塊，目前實現了基礎架構和第一個功能模塊。\n *\n * ✅ 已完成功能 (4/17 需求, 24% 進度):\n * - FR-D1.1: 顯示月度支出卡片 ✓\n * - FR-D1.2: 顯示活躍供應商計數 ✓\n * - FR-D1.3: 顯示待處理 PR 計數 ✓\n * - FR-D1.4: 顯示庫存預警計數 ✓\n *\n * ⏳ 計畫中的功能 (後續 Phase):\n * - FR-D2.1-FR-D2.4: 支出趨勢圖表模塊 (Phase 2)\n * - FR-D3.1-FR-D3.3: 供應商評分模塊 (Phase 2)\n * - FR-D4.1-FR-D4.3: PR/PO 漏斗模塊 (Phase 3)\n * - FR-D5.1-FR-D5.3: 最近操作模塊 (Phase 3)\n *\n * 進度：✓ 4/17 = 24% 完成\n *\n * @component\n * @example\n * ```tsx\n * <DashboardPage organizationId={123} userId={456} />\n * ```\n */"

import React, { useState, useCallback, useMemo } from 'react';
import { Loader, AlertCircle, RefreshCw } from 'lucide-react';
import { DEFAULTS } from '../utils/constants';
import {
  useSummaryCards,
  useSpendingTrend,
  useVendorScoring,
  usePRPOFunnel,
  useRecentOperations,
  useRefreshData,
  useTimeRange,
  useRiskLevelFilter,
} from '../hooks/useDashboard';
import SummaryCards from './SummaryCards';
// TODO: 導入其他組件
// import SpendingTrend from './SpendingTrend';
// import VendorScoring from './VendorScoring';
// import PRPOFunnel from './PRPOFunnel';
// import RecentOperations from './RecentOperations';

interface DashboardPageProps {
  organizationId?: number;
  userId?: number;
}

/**
 * Dashboard 主頁面
 */
export const DashboardPage: React.FC<DashboardPageProps> = ({
  organizationId = DEFAULTS.ORGANIZATION_ID,
  userId = DEFAULTS.USER_ID,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { timeRange, switchTimeRange } = useTimeRange(DEFAULTS.TIME_RANGE);
  const { selectedRisks, toggleRiskLevel, resetFilters } = useRiskLevelFilter();
  const refreshData = useRefreshData();

  // 數據獲取
  const summaryCards = useSummaryCards({ organizationId, userId });
  const spendingTrend = useSpendingTrend({ organizationId, timeRange });
  const vendorScoring = useVendorScoring({ organizationId, limit: DEFAULTS.LIMIT });
  const prpoFunnel = usePRPOFunnel({ organizationId });
  const recentOperations = useRecentOperations({ organizationId, limit: DEFAULTS.LIMIT });

  // 判斷整體加載狀態
  const isLoading = useMemo(
    () =>
      summaryCards.loading ||
      spendingTrend.loading ||
      vendorScoring.loading ||
      prpoFunnel.loading ||
      recentOperations.loading,
    [
      summaryCards.loading,
      spendingTrend.loading,
      vendorScoring.loading,
      prpoFunnel.loading,
      recentOperations.loading,
    ]
  );

  // 判斷是否有錯誤
  const hasError = useMemo(
    () =>
      summaryCards.error ||
      spendingTrend.error ||
      vendorScoring.error ||
      prpoFunnel.error ||
      recentOperations.error,
    [
      summaryCards.error,
      spendingTrend.error,
      vendorScoring.error,
      prpoFunnel.error,
      recentOperations.error,
    ]
  );

  // 刷新數據
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    refreshData();
    // 模擬刷新延遲
    setTimeout(() => setIsRefreshing(false), 500);
  }, [refreshData]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頁面頭部 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* 標題 */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">採購儀表板</h1>
              <p className="text-gray-600 text-sm mt-1">
                實時監控採購狀況、關鍵指標和業務洞察
              </p>
            </div>

            {/* 操作按鈕 */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing || isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">刷新</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 頁面內容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 全局錯誤提示 */}
        {hasError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-900">載入出錯</h3>
              <p className="text-sm text-red-700 mt-1">
                無法載入部分數據，請檢查網絡連接或稍後重試
              </p>
            </div>
          </div>
        )}

        {/* 加載中提示 */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="ml-2 text-gray-600">載入中...</span>
          </div>
        )}

        {/* 摘要卡片區域 */}
        {!isLoading && summaryCards.data && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">主要指標</h2>
            <SummaryCards
              data={summaryCards.data}
              isLoading={summaryCards.loading}
              error={summaryCards.error}
            />
          </section>
        )}

        {/* 支出趨勢區域 */}
        {!isLoading && spendingTrend.data && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">支出趨勢</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => switchTimeRange('6MONTHS')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    timeRange === '6MONTHS'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  6 個月
                </button>
                <button
                  onClick={() => switchTimeRange('12MONTHS')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    timeRange === '12MONTHS'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  12 個月
                </button>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-gray-600 text-center py-12">
                支出趨勢組件待開發
                <br />
                <span className="text-sm">預計包含：圖表、預算對比、成本中心分析</span>
              </p>
            </div>
          </section>
        )}

        {/* 供應商評分區域 */}
        {!isLoading && vendorScoring.data && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">供應商評分</h2>
              <button
                onClick={resetFilters}
                className="px-3 py-1 rounded text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
              >
                重置篩選
              </button>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-gray-600 text-center py-12">
                供應商評分組件待開發
                <br />
                <span className="text-sm">預計包含：評分表、風險分布、篩選功能</span>
              </p>
            </div>
          </section>
        )}

        {/* PR/PO 漏斗區域 */}
        {!isLoading && prpoFunnel.data && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">PR/PO 漏斗</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-gray-600 text-center py-12">
                PR/PO 漏斗組件待開發
                <br />
                <span className="text-sm">預計包含：漏斗圖、轉化率、瓶頸分析</span>
              </p>
            </div>
          </section>
        )}

        {/* 最近操作區域 */}
        {!isLoading && recentOperations.data && (
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">最近操作</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-gray-600 text-center py-12">
                最近操作組件待開發
                <br />
                <span className="text-sm">預計包含：PR 列表、供應商、快速操作</span>
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;

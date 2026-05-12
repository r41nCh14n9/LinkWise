/**
 * 摘要卡片組件 (Summary Cards)
 * 顯示 4 張主要 KPI 卡片：月度支出、活躍供應商、待處理 PR、庫存預警
 * 對應需求: FR-D1.1, FR-D1.2, FR-D1.3, FR-D1.4
 */

import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Users, FileText, AlertTriangle } from 'lucide-react';
import type { SummaryCardsDTO } from '../types/dashboard';
import { formatCurrency, formatNumber, formatTrendIndicator } from '../utils/formatters';
import { RISK_LEVEL_COLORS } from '../utils/constants';

interface SummaryCardsProps {
  data: SummaryCardsDTO;
  isLoading?: boolean;
  error?: Error | null;
}

interface CardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  unit?: string;
  trend?: { text: string; icon: string; color: string };
  subtext?: string;
  bgColor?: string;
}

/**
 * 單個卡片組件
 */
const SummaryCard: React.FC<CardProps> = ({
  icon,
  title,
  value,
  unit,
  trend,
  subtext,
  bgColor = 'bg-white',
}) => {
  return (
    <div
      className={`${bgColor} rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow`}
    >
      {/* 頭部 - 圖標和標題 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
        </div>
        <div className="text-gray-400">{icon}</div>
      </div>

      {/* 主數值 */}
      <div className="mb-3">
        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-bold text-gray-900">{value}</div>
          {unit && <span className="text-sm text-gray-500">{unit}</span>}
        </div>
      </div>

      {/* 趨勢或子文本 */}
      {trend && (
        <div className="flex items-center gap-1 text-sm font-medium" style={{ color: trend.color }}>
          <span>{trend.icon}</span>
          <span>{trend.text}</span>
        </div>
      )}

      {subtext && <p className="text-xs text-gray-500 mt-2">{subtext}</p>}
    </div>
/**
 * Skeleton Loading 組件
 * 在加載數據時顯示骨架屏，改善用戶體驗
 */
const SummaryCardsSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {[1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        aria-loading="true"
        aria-label={`載入中... (卡片 ${i})`}
      >
        {/* 標題骨架 */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
          </div>
          <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* 數值骨架 */}
        <div className="mb-3">
          <div className="h-8 bg-gray-200 rounded w-32 animate-pulse mb-2" />
        </div>

        {/* 趨勢/子文本骨架 */}
        <div className="h-3 bg-gray-200 rounded w-20 animate-pulse" />
      </div>
    ))}
  </div>
);

/**
 * 錯誤狀態組件
 */
const SummaryCardsError: React.FC<{ error: Error }> = ({ error }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center" role="alert">
    <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
    <p className="text-red-700 font-medium">無法加載摘要卡片</p>
    <p className="text-red-600 text-sm mt-1">{error.message}</p>
  </div>
);

/**
 * 摘要卡片容器組件
 */
  data,
  isLoading = false,
  error = null,
}) => {
  // 格式化卡片數據
  const cards = useMemo(() => {
    if (!data) return [];

    const { monthlyExpense, activeVendors, pendingPRs, inventoryWarnings } = data;

    return [
      {
        id: 'monthly-expense',
        icon: <TrendingUp className="w-5 h-5" />,
        title: '月度支出',
        value: formatCurrency(monthlyExpense.amount, monthlyExpense.currency, 2),
        unit: monthlyExpense.currency,
        trend: formatTrendIndicator(monthlyExpense.trend),
        subtext: '相較上月',
        bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
      },
      {
        id: 'active-vendors',
        icon: <Users className="w-5 h-5" />,
        title: '活躍供應商',
        value: formatNumber(activeVendors),
        unit: '家',
        subtext: '本月有過交易',
        bgColor: 'bg-gradient-to-br from-green-50 to-green-100',
      },
      {
        id: 'pending-prs',
        icon: <FileText className="w-5 h-5" />,
        title: '待處理 PR',
        value: formatNumber(pendingPRs),
        unit: '個',
        subtext: '等待批准',
        bgColor: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
      },
      {
        id: 'inventory-warnings',
        icon: <AlertTriangle className="w-5 h-5" />,
        title: '庫存預警',
        value: formatNumber(inventoryWarnings),
        unit: '項',
        subtext: '需要關注',
        bgColor: 'bg-gradient-to-br from-red-50 to-red-100',
      },
    ];
  }, [data]);

  // 加載狀態 - 使用 Skeleton 組件
  if (isLoading) {
    return <SummaryCardsSkeleton />;
  }

  // 錯誤狀態
  if (error) {
    return <SummaryCardsError error={error} />;
  }

  // 正常渲染
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <SummaryCard key={card.id} {...card} />
      ))}
    </div>
  );
};

export default SummaryCards;

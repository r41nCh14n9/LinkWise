package com.linkwise.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Dashboard 儀表板主容器 DTO - 聚合所有 Dashboard 相關數據
 * 對應需求: FR-D (全部 17 個功能)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDTO {
    
    private SummaryCardsDTO summaryCards;
    private ExpenseTrendDTO expenseTrend;
    private VendorScoringDTO vendorScoring;
    private PRPOFunnelDTO prpoFunnel;
    private RecentOperationsDTO recentOperations;
    private LocalDateTime lastUpdated;
    private Long organizationId;
    private Long userId;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SummaryCardsDTO {
        private MonthlyExpenseDTO monthlyExpense;
        private ActiveVendorsDTO activeVendors;
        private PendingPRsDTO pendingPRs;
        private InventoryWarningsDTO inventoryWarnings;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyExpenseDTO {
        private BigDecimal amount;
        private String currency;
        private Integer trend;
        private Map<String, BigDecimal> departmentBreakdown;
        private Map<String, BigDecimal> categoryBreakdown;
        private LocalDateTime updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActiveVendorsDTO {
        private Integer count;
        private Integer trend;
        private Map<String, Integer> byCategory;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PendingPRsDTO {
        private Integer count;
        private Integer overdue;
        private Map<String, Integer> byCostCenter;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InventoryWarningsDTO {
        private Integer count;
        private List<String> criticalItems;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExpenseTrendDTO {
        private String timeRange;
        private List<MonthlyExpenseDataDTO> monthlyData;
        private Boolean isExportable;
        private String reportGenerationStatus;
        private BudgetComparisonDTO budgetComparison;
        private Map<String, CostCenterAnalysisDTO> costCenterAnalysis;
        private String currencyUnit;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyExpenseDataDTO {
        private String month;
        private BigDecimal totalExpense;
        private Map<String, BigDecimal> byDepartment;
        private Map<String, BigDecimal> byCategory;
        private Map<String, BigDecimal> byVendor;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BudgetComparisonDTO {
        private BigDecimal budgeted;
        private BigDecimal actual;
        private BigDecimal variance;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CostCenterAnalysisDTO {
        private BigDecimal amount;
        private Integer trend;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VendorScoringDTO {
        private List<VendorScoreDetailDTO> vendorScores;
        private Map<String, Integer> riskDistribution;
        private List<VendorAlertDTO> alerts;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VendorScoreDetailDTO {
        private String vendorId;
        private String vendorName;
        private Integer overallScore;
        private String riskLevel;
        private Map<String, Integer> dimensions;
        private List<Integer> trend;
        private LocalDateTime lastUpdated;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VendorAlertDTO {
        private String vendorId;
        private String severity;
        private String message;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PRPOFunnelDTO {
        private List<FunnelStageDTO> funnel;
        private Map<String, String> conversionRates;
        private List<BottleneckDTO> bottlenecks;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FunnelStageDTO {
        private String stage;
        private String stageName;
        private Integer count;
        private Double percentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BottleneckDTO {
        private String stage;
        private String reason;
        private String recommendation;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentOperationsDTO {
        private List<RecentPRDTO> recentPRs;
        private List<RecentVendorDTO> recentVendors;
        private List<QuickActionDTO> quickActions;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentPRDTO {
        private String prNumber;
        private BigDecimal amount;
        private String status;
        private String vendor;
        private LocalDateTime createdAt;
        private LocalDateTime lastUpdated;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentVendorDTO {
        private String vendorId;
        private String vendorName;
        private Integer score;
        private LocalDateTime lastOrder;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuickActionDTO {
        private String action;
        private String label;
        private String icon;
    }
}

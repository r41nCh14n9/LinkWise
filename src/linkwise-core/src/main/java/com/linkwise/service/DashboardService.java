package com.linkwise.service;

import com.linkwise.dto.*;
import com.linkwise.dto.DashboardDTO.*;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;

/**
 * Dashboard 服務層
 * 
 * 責任:
 * 1. 聚合來自多個模塊的數據 (VMS、Procurement、RBAC)
 * 2. 計算 KPI 指標
 * 3. 應用多租戶和權限隔離
 * 
 * 當前實現: Mock 數據 (尚未依賴其他模塊)
 * 未來集成:
 *   - VMS 服務: 供應商數據、風險評分
 *   - Procurement 服務: PR/PO 數據
 *   - RBAC 服務: 用戶權限、數據隔離
 * 
 * 對應需求: FR-D (全部 17 個功能)
 */
@Service
public class DashboardService {

    /**
     * 獲取完整儀表板數據
     * 
     * 對應 API: GET /api/dashboard
     * 涵蓋所有 FR-D 需求
     */
    public DashboardDTO getDashboard(Long organizationId, Long userId) {
        
        // TODO: 驗證用戶權限 (RBAC 服務集成)
        // TODO: 驗證租戶隔離 (多租戶驗證)
        
        return DashboardDTO.builder()
            .summaryCards(getSummaryCards(organizationId))
            .expenseTrend(getExpenseTrend(organizationId, "6MONTHS"))
            .vendorScoring(getVendorScoring(organizationId))
            .prpoFunnel(getPRPOFunnel(organizationId))
            .recentOperations(getRecentOperations(organizationId))
            .lastUpdated(LocalDateTime.now())
            .organizationId(organizationId)
            .userId(userId)
            .build();
    }

    /**
     * FR-D1: 摘要卡片 (月度支出、活躍供應商、待處理 PR、庫存預警)
     */
    public SummaryCardsDTO getSummaryCards(Long organizationId) {
        
        // TODO: 集成 Procurement 服務獲取真實 PO 數據
        // 計算 FR-D1.1: 月度總支出
        MonthlyExpenseDTO monthlyExpense = MonthlyExpenseDTO.builder()
            .amount(new BigDecimal("2345678.50"))
            .currency("CNY")
            .trend(12)  // +12% 與上月對比
            .departmentBreakdown(Map.of(
                "採購部", new BigDecimal("1000000"),
                "運營部", new BigDecimal("800000"),
                "市場部", new BigDecimal("545678.50")
            ))
            .categoryBreakdown(Map.of(
                "物流", new BigDecimal("1000000"),
                "原材料", new BigDecimal("1000000"),
                "服務", new BigDecimal("345678.50")
            ))
            .updatedAt(LocalDateTime.now())
            .build();
        
        // TODO: 集成 VMS 服務獲取供應商數據
        // 計算 FR-D1.2: 活躍供應商
        ActiveVendorsDTO activeVendors = ActiveVendorsDTO.builder()
            .count(45)
            .trend(3)  // +3 家供應商
            .byCategory(Map.of(
                "物流", 12,
                "原材料", 20,
                "服務", 13
            ))
            .build();
        
        // TODO: 集成 Procurement 服務獲取 PR 數據
        // 計算 FR-D1.3: 待處理 PR
        PendingPRsDTO pendingPRs = PendingPRsDTO.builder()
            .count(12)
            .overdue(2)  // 2 個逾期 PR
            .byCostCenter(Map.of(
                "CC001", 5,
                "CC002", 7
            ))
            .build();
        
        // 計算 FR-D1.4: 庫存預警 (暫時 Mock)
        InventoryWarningsDTO inventoryWarnings = InventoryWarningsDTO.builder()
            .count(3)
            .criticalItems(List.of("Item-001", "Item-002", "Item-003"))
            .build();
        
        return SummaryCardsDTO.builder()
            .monthlyExpense(monthlyExpense)
            .activeVendors(activeVendors)
            .pendingPRs(pendingPRs)
            .inventoryWarnings(inventoryWarnings)
            .build();
    }

    /**
     * FR-D2: 支出趨勢 (時間篩選、多維過濾、導出、報表預生成)
     */
    public ExpenseTrendDTO getExpenseTrend(Long organizationId, String timeRange) {
        
        // TODO: 集成 Procurement 服務獲取歷史 PO 數據
        // FR-D2.1: 時間篩選 + FR-D2.2: 多維過濾
        List<MonthlyExpenseDataDTO> monthlyData = generateMonthlyData(timeRange);
        
        return ExpenseTrendDTO.builder()
            .timeRange(timeRange)
            .monthlyData(monthlyData)
            .currencyUnit("CNY")
            // FR-D2.3: 數據導出
            .isExportable(true)
            // FR-D2.4: 報表預生成
            .reportGenerationStatus("GENERATED")
            // 預算對比
            .budgetComparison(BudgetComparisonDTO.builder()
                .budgeted(new BigDecimal("8000000"))
                .actual(new BigDecimal("7500000"))
                .variance(new BigDecimal("-500000"))
                .build())
            // 成本中心分析
            .costCenterAnalysis(Map.of(
                "CC001", CostCenterAnalysisDTO.builder()
                    .amount(new BigDecimal("3000000"))
                    .trend(5)
                    .build(),
                "CC002", CostCenterAnalysisDTO.builder()
                    .amount(new BigDecimal("4500000"))
                    .trend(-2)
                    .build()
            ))
            .build();
    }

    /**
     * FR-D3: 供應商評分 (風險等級、評分詳情、高風險告警)
     */
    public VendorScoringDTO getVendorScoring(Long organizationId) {
        
        // TODO: 集成 VMS 服務獲取供應商評分數據
        
        // FR-D3.1: 風險等級展示 + FR-D3.2: 評分詳情
        List<VendorScoreDetailDTO> vendorScores = List.of(
            VendorScoreDetailDTO.builder()
                .vendorId("V001")
                .vendorName("廠商A")
                .overallScore(85)
                .riskLevel("LOW")
                .dimensions(Map.of(
                    "financial", 90,
                    "delivery", 80,
                    "quality", 85,
                    "compliance", 75
                ))
                .trend(List.of(80, 82, 84, 85))
                .lastUpdated(LocalDateTime.now())
                .build(),
            VendorScoreDetailDTO.builder()
                .vendorId("V002")
                .vendorName("廠商B")
                .overallScore(72)
                .riskLevel("MEDIUM")
                .dimensions(Map.of(
                    "financial", 70,
                    "delivery", 75,
                    "quality", 70,
                    "compliance", 65
                ))
                .trend(List.of(68, 70, 71, 72))
                .lastUpdated(LocalDateTime.now())
                .build(),
            VendorScoreDetailDTO.builder()
                .vendorId("V003")
                .vendorName("廠商C")
                .overallScore(55)
                .riskLevel("HIGH")
                .dimensions(Map.of(
                    "financial", 50,
                    "delivery", 60,
                    "quality", 55,
                    "compliance", 45
                ))
                .trend(List.of(70, 65, 60, 55))
                .lastUpdated(LocalDateTime.now())
                .build()
        );
        
        // FR-D3.3: 高風險告警
        List<VendorAlertDTO> alerts = List.of(
            VendorAlertDTO.builder()
                .vendorId("V003")
                .severity("HIGH")
                .message("財務風險升高，評分從 70 降至 55")
                .build()
        );
        
        return VendorScoringDTO.builder()
            .vendorScores(vendorScores)
            .riskDistribution(Map.of(
                "LOW", 30,
                "MEDIUM", 12,
                "HIGH", 3
            ))
            .alerts(alerts)
            .build();
    }

    /**
     * FR-D4: PR/PO 漏斗 (漏斗分布、階段分析、轉化率指標)
     */
    public PRPOFunnelDTO getPRPOFunnel(Long organizationId) {
        
        // TODO: 集成 Procurement 服務獲取 PR/PO 狀態分布
        
        // FR-D4.1: 採購漏斗 + FR-D4.2: 各階段分析
        List<FunnelStageDTO> funnel = List.of(
            FunnelStageDTO.builder()
                .stage("DRAFT")
                .stageName("草稿")
                .count(5)
                .percentage(8.3)
                .build(),
            FunnelStageDTO.builder()
                .stage("SUBMITTED")
                .stageName("已提交")
                .count(30)
                .percentage(50.0)
                .build(),
            FunnelStageDTO.builder()
                .stage("APPROVED")
                .stageName("已批准")
                .count(20)
                .percentage(33.3)
                .build(),
            FunnelStageDTO.builder()
                .stage("CONVERTED_TO_PO")
                .stageName("已轉 PO")
                .count(15)
                .percentage(25.0)
                .build(),
            FunnelStageDTO.builder()
                .stage("PO_COMPLETED")
                .stageName("完成")
                .count(8)
                .percentage(13.3)
                .build()
        );
        
        // FR-D4.3: 轉化率指標
        Map<String, String> conversionRates = Map.of(
            "submitToApprove", "66.7%",
            "approveToConvert", "75%",
            "convertToComplete", "53.3%"
        );
        
        List<BottleneckDTO> bottlenecks = List.of(
            BottleneckDTO.builder()
                .stage("SUBMITTED")
                .reason("批准人過多，審批效率低")
                .recommendation("優化批准流程")
                .build()
        );
        
        return PRPOFunnelDTO.builder()
            .funnel(funnel)
            .conversionRates(conversionRates)
            .bottlenecks(bottlenecks)
            .build();
    }

    /**
     * FR-D5: 最近操作 (最近 PR/PO、最近供應商、快速操作)
     */
    public RecentOperationsDTO getRecentOperations(Long organizationId) {
        
        // TODO: 集成 Procurement、VMS 服務獲取最新操作
        
        // FR-D5.1: 最近 PR/PO 列表
        List<RecentPRDTO> recentPRs = List.of(
            RecentPRDTO.builder()
                .prNumber("PR-2026-001")
                .amount(new BigDecimal("50000"))
                .status("APPROVED")
                .vendor("廠商A")
                .createdAt(LocalDateTime.now().minusHours(2))
                .lastUpdated(LocalDateTime.now().minusHours(1))
                .build(),
            RecentPRDTO.builder()
                .prNumber("PR-2026-002")
                .amount(new BigDecimal("120000"))
                .status("SUBMITTED")
                .vendor("廠商B")
                .createdAt(LocalDateTime.now().minusHours(4))
                .lastUpdated(LocalDateTime.now().minusHours(3))
                .build()
        );
        
        // FR-D5.2: 最近供應商
        List<RecentVendorDTO> recentVendors = List.of(
            RecentVendorDTO.builder()
                .vendorId("V001")
                .vendorName("廠商A")
                .score(85)
                .lastOrder(LocalDateTime.now().minusDays(1))
                .build(),
            RecentVendorDTO.builder()
                .vendorId("V002")
                .vendorName("廠商B")
                .score(72)
                .lastOrder(LocalDateTime.now().minusDays(3))
                .build()
        );
        
        // FR-D5.3: 快速操作
        List<QuickActionDTO> quickActions = List.of(
            QuickActionDTO.builder()
                .action("CREATE_PR")
                .label("創建採購申請")
                .icon("plus")
                .build(),
            QuickActionDTO.builder()
                .action("VIEW_VENDOR")
                .label("查看供應商")
                .icon("building")
                .build(),
            QuickActionDTO.builder()
                .action("VIEW_PO")
                .label("查看採購訂單")
                .icon("file")
                .build()
        );
        
        return RecentOperationsDTO.builder()
            .recentPRs(recentPRs)
            .recentVendors(recentVendors)
            .quickActions(quickActions)
            .build();
    }

    /**
     * 輔助方法: 生成月度數據
     */
    private List<MonthlyExpenseDataDTO> generateMonthlyData(String timeRange) {
        List<MonthlyExpenseDataDTO> data = new ArrayList<>();
        int months = timeRange.equals("6MONTHS") ? 6 : 12;
        
        BigDecimal baseAmount = new BigDecimal("1000000");
        for (int i = months - 1; i >= 0; i--) {
            YearMonth yearMonth = YearMonth.now().minusMonths(i);
            BigDecimal amount = baseAmount.multiply(new BigDecimal(0.9 + Math.random() * 0.3));
            
            data.add(MonthlyExpenseDataDTO.builder()
                .month(yearMonth.toString())
                .totalExpense(amount)
                .byDepartment(Map.of(
                    "採購部", amount.multiply(new BigDecimal("0.6")),
                    "運營部", amount.multiply(new BigDecimal("0.4"))
                ))
                .byCategory(Map.of(
                    "物流", amount.multiply(new BigDecimal("0.5")),
                    "原材料", amount.multiply(new BigDecimal("0.5"))
                ))
                .byVendor(Map.of(
                    "廠商A", amount.multiply(new BigDecimal("0.3")),
                    "廠商B", amount.multiply(new BigDecimal("0.7"))
                ))
                .build());
        }
        
        return data;
    }
}

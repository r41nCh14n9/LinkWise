package com.linkwise.util;

import lombok.extern.slf4j.Slf4j;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

/**
 * 假資料生成工具類
 * 
 * 用途:
 * 1. 在尚未集成 VMS、Procurement 服務時生成測試數據
 * 2. 提供逼真的模擬數據便於前端開發和 UI 測試
 * 3. 支持多租戶場景測試
 * 
 * TODO: 待真實服務集成後移除此類
 * 
 * 功能:
 * - 生成組織級別的模擬數據
 * - 生成分布式隨機數據(避免假數據過於規律)
 * - 支持數據一致性(同一 organizationId 返回相同數據)
 */
@Slf4j
public class MockDataGenerator {

    private static final Random RANDOM = new Random();
    
    // 模擬廠商庫
    private static final List<String> VENDORS = List.of(
        "廠商A", "廠商B", "廠商C", "廠商D", "廠商E",
        "華東物流", "南方運輸", "中通快遞", "順豐物流", "京東物流"
    );
    
    // 模擬部門庫
    private static final List<String> DEPARTMENTS = List.of(
        "採購部", "運營部", "市場部", "生產部", "財務部"
    );
    
    // 模擬分類庫
    private static final List<String> CATEGORIES = List.of(
        "物流", "原材料", "服務", "設備", "軟件"
    );
    
    // 模擬成本中心庫
    private static final List<String> COST_CENTERS = List.of(
        "CC001", "CC002", "CC003", "CC004", "CC005"
    );

    /**
     * 生成供應商列表 (用於摘要卡片和最近供應商)
     */
    public static List<Map<String, Object>> generateVendorList(int count) {
        List<Map<String, Object>> vendors = new ArrayList<>();
        
        for (int i = 0; i < count; i++) {
            Map<String, Object> vendor = new HashMap<>();
            vendor.put("id", "V" + String.format("%03d", i + 1));
            vendor.put("name", VENDORS.get(RANDOM.nextInt(VENDORS.size())));
            vendor.put("score", 50 + RANDOM.nextInt(50));  // 50-100
            vendor.put("riskLevel", getRiskLevel(vendor.get("score")));
            vendor.put("category", CATEGORIES.get(RANDOM.nextInt(CATEGORIES.size())));
            vendors.add(vendor);
        }
        
        return vendors;
    }

    /**
     * 生成月度支出數據 (用於支出趨勢)
     */
    public static BigDecimal generateMonthlyExpense(String month, Long organizationId) {
        // 基於組織 ID 和月份生成穩定的隨機數據
        long seed = organizationId * 31 + month.hashCode();
        Random seededRandom = new Random(seed);
        
        // 模擬月度支出在 500W - 300W 之間
        int baseAmount = 2000000;
        int variance = (int) (baseAmount * 0.5);
        
        return new BigDecimal(baseAmount + seededRandom.nextInt(variance) - variance / 2);
    }

    /**
     * 生成 PR/PO 漏斗數據
     */
    public static Map<String, Integer> generateFunnelData(Long organizationId) {
        // 模擬漏斗: 60 個 Draft -> 30 個 Submitted -> 20 個 Approved -> 15 個 Converted -> 8 個 Completed
        long seed = organizationId;
        Random seededRandom = new Random(seed);
        
        Map<String, Integer> funnel = new LinkedHashMap<>();
        funnel.put("DRAFT", 60 + seededRandom.nextInt(20));
        funnel.put("SUBMITTED", funnel.get("DRAFT") / 2 + seededRandom.nextInt(5));
        funnel.put("APPROVED", funnel.get("SUBMITTED") * 2 / 3 + seededRandom.nextInt(3));
        funnel.put("CONVERTED_TO_PO", funnel.get("APPROVED") * 3 / 4 + seededRandom.nextInt(2));
        funnel.put("PO_COMPLETED", funnel.get("CONVERTED_TO_PO") / 2 + 1);
        
        return funnel;
    }

    /**
     * 生成供應商風險等級分布
     */
    public static Map<String, Integer> generateRiskDistribution(int totalVendors) {
        int lowRisk = (int) (totalVendors * 0.6);    // 60% 低風險
        int mediumRisk = (int) (totalVendors * 0.3); // 30% 中風險
        int highRisk = totalVendors - lowRisk - mediumRisk; // 剩餘高風險
        
        return Map.of(
            "LOW", lowRisk,
            "MEDIUM", mediumRisk,
            "HIGH", highRisk
        );
    }

    /**
     * 生成供應商評分趨勢 (時間序列)
     */
    public static List<Integer> generateScoreTrend(int initialScore, int months) {
        List<Integer> trend = new ArrayList<>();
        int score = initialScore;
        
        for (int i = 0; i < months; i++) {
            score = Math.max(40, Math.min(100, score + RANDOM.nextInt(11) - 5));
            trend.add(score);
        }
        
        return trend;
    }

    /**
     * 生成部門支出分布
     */
    public static Map<String, BigDecimal> generateDepartmentExpense(BigDecimal total) {
        Map<String, BigDecimal> distribution = new LinkedHashMap<>();
        
        BigDecimal remaining = total;
        for (int i = 0; i < DEPARTMENTS.size() - 1; i++) {
            int percentage = 20 + RANDOM.nextInt(30);
            BigDecimal amount = total.multiply(new BigDecimal(percentage)).divide(new BigDecimal(100));
            distribution.put(DEPARTMENTS.get(i), amount);
            remaining = remaining.subtract(amount);
        }
        
        distribution.put(DEPARTMENTS.get(DEPARTMENTS.size() - 1), remaining);
        return distribution;
    }

    /**
     * 生成分類支出分布
     */
    public static Map<String, BigDecimal> generateCategoryExpense(BigDecimal total) {
        Map<String, BigDecimal> distribution = new LinkedHashMap<>();
        
        BigDecimal remaining = total;
        for (int i = 0; i < CATEGORIES.size() - 1; i++) {
            int percentage = 15 + RANDOM.nextInt(35);
            BigDecimal amount = total.multiply(new BigDecimal(percentage)).divide(new BigDecimal(100));
            distribution.put(CATEGORIES.get(i), amount);
            remaining = remaining.subtract(amount);
        }
        
        distribution.put(CATEGORIES.get(CATEGORIES.size() - 1), remaining);
        return distribution;
    }

    /**
     * 生成供應商支出分布
     */
    public static Map<String, BigDecimal> generateVendorExpense(BigDecimal total, int vendorCount) {
        Map<String, BigDecimal> distribution = new LinkedHashMap<>();
        
        List<String> vendorList = VENDORS.subList(0, Math.min(vendorCount, VENDORS.size()));
        BigDecimal remaining = total;
        
        for (int i = 0; i < vendorList.size() - 1; i++) {
            int percentage = 10 + RANDOM.nextInt(40);
            BigDecimal amount = total.multiply(new BigDecimal(percentage)).divide(new BigDecimal(100));
            distribution.put(vendorList.get(i), amount);
            remaining = remaining.subtract(amount);
        }
        
        distribution.put(vendorList.get(vendorList.size() - 1), remaining);
        return distribution;
    }

    /**
     * 生成待處理 PR 數據
     */
    public static Map<String, Integer> generatePendingPRsByCostCenter() {
        Map<String, Integer> result = new LinkedHashMap<>();
        
        for (String cc : COST_CENTERS) {
            result.put(cc, 1 + RANDOM.nextInt(10));
        }
        
        return result;
    }

    /**
     * 生成成本中心分析數據
     */
    public static Map<String, Object> generateCostCenterAnalysis(BigDecimal totalExpense) {
        Map<String, Object> analysis = new LinkedHashMap<>();
        
        BigDecimal remaining = totalExpense;
        for (int i = 0; i < COST_CENTERS.size() - 1; i++) {
            int percentage = 15 + RANDOM.nextInt(30);
            BigDecimal amount = totalExpense.multiply(new BigDecimal(percentage)).divide(new BigDecimal(100));
            
            Map<String, Object> cc = new HashMap<>();
            cc.put("amount", amount);
            cc.put("trend", RANDOM.nextInt(21) - 10);  // -10 ~ +10%
            analysis.put(COST_CENTERS.get(i), cc);
            
            remaining = remaining.subtract(amount);
        }
        
        Map<String, Object> cc = new HashMap<>();
        cc.put("amount", remaining);
        cc.put("trend", RANDOM.nextInt(21) - 10);
        analysis.put(COST_CENTERS.get(COST_CENTERS.size() - 1), cc);
        
        return analysis;
    }

    /**
     * 生成轉化率指標
     */
    public static Map<String, String> generateConversionRates() {
        return Map.of(
            "submitToApprove", (50 + RANDOM.nextInt(40)) + "%",
            "approveToConvert", (60 + RANDOM.nextInt(30)) + "%",
            "convertToComplete", (40 + RANDOM.nextInt(40)) + "%"
        );
    }

    /**
     * 輔助方法: 根據分數判斷風險等級
     */
    private static String getRiskLevel(Object scoreObj) {
        int score = ((Number) scoreObj).intValue();
        
        if (score >= 80) return "LOW";
        if (score >= 60) return "MEDIUM";
        return "HIGH";
    }

    /**
     * 生成活躍供應商數 (月度對比)
     */
    public static int generateActiveVendorCount(Long organizationId) {
        long seed = organizationId * 17;
        Random seededRandom = new Random(seed);
        return 30 + seededRandom.nextInt(40);
    }

    /**
     * 生成待處理 PR 總數
     */
    public static int generatePendingPRCount(Long organizationId) {
        long seed = organizationId * 23;
        Random seededRandom = new Random(seed);
        return 5 + seededRandom.nextInt(20);
    }

    /**
     * 生成超期 PR 數
     */
    public static int generateOverduePRCount(int totalPending) {
        return Math.max(0, RANDOM.nextInt(totalPending / 3));
    }

    /**
     * 生成庫存預警項目
     */
    public static List<String> generateInventoryWarnings(int count) {
        List<String> warnings = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            warnings.add("Item-" + String.format("%03d", i + 1));
        }
        return warnings;
    }
}

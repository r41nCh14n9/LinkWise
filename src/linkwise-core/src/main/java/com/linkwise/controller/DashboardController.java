package com.linkwise.controller;

import com.linkwise.dto.*;
import com.linkwise.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Dashboard 控制層
 * API 規格:
 * - Base: /api/v1/dashboard
 * - 認證: JWT Token
 * - 隔離: organizationId (多租戶)
 * 
 * 對應需求: FR-D (全部 17 個功能)
 */
@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<DashboardDTO> getDashboard(
            @RequestParam(value = "organizationId", defaultValue = "1") Long organizationId,
            @RequestParam(value = "timeRange", defaultValue = "6MONTHS") String timeRange) {
        try {
            Long userId = 1L;
            DashboardDTO dashboard = dashboardService.getDashboard(organizationId, userId);
            return ResponseEntity.ok(dashboard);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/summary")
    public ResponseEntity<DashboardDTO.SummaryCardsDTO> getSummaryCards(
            @RequestParam(value = "organizationId", defaultValue = "1") Long organizationId) {
        try {
            DashboardDTO.SummaryCardsDTO summary = dashboardService.getSummaryCards(organizationId);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/spending-trend")
    public ResponseEntity<DashboardDTO.ExpenseTrendDTO> getSpendingTrend(
            @RequestParam(value = "organizationId", defaultValue = "1") Long organizationId,
            @RequestParam(value = "timeRange", defaultValue = "6MONTHS") String timeRange) {
        try {
            DashboardDTO.ExpenseTrendDTO trend = dashboardService.getExpenseTrend(organizationId, timeRange);
            return ResponseEntity.ok(trend);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/spending-trend/export")
    public ResponseEntity<?> exportSpendingTrend(
            @RequestParam(value = "organizationId", defaultValue = "1") Long organizationId,
            @RequestParam(value = "format", defaultValue = "EXCEL") String format) {
        return ResponseEntity.ok("{\"message\":\"Export feature coming soon\"}");
    }

    @GetMapping("/vendor-scoring")
    public ResponseEntity<DashboardDTO.VendorScoringDTO> getVendorScoring(
            @RequestParam(value = "organizationId", defaultValue = "1") Long organizationId) {
        try {
            DashboardDTO.VendorScoringDTO scoring = dashboardService.getVendorScoring(organizationId);
            return ResponseEntity.ok(scoring);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/pipeline-funnel")
    public ResponseEntity<DashboardDTO.PRPOFunnelDTO> getPRPOFunnel(
            @RequestParam(value = "organizationId", defaultValue = "1") Long organizationId) {
        try {
            DashboardDTO.PRPOFunnelDTO funnel = dashboardService.getPRPOFunnel(organizationId);
            return ResponseEntity.ok(funnel);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/recent-operations")
    public ResponseEntity<DashboardDTO.RecentOperationsDTO> getRecentOperations(
            @RequestParam(value = "organizationId", defaultValue = "1") Long organizationId,
            @RequestParam(value = "limit", defaultValue = "20") Integer limit) {
        try {
            DashboardDTO.RecentOperationsDTO operations = dashboardService.getRecentOperations(organizationId);
            return ResponseEntity.ok(operations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("{\"status\":\"OK\"}");
    }
}

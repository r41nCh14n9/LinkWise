# NFR-3: 合規設計文檔

**文檔編碼**: NFR-3  
**文檔版本**: 1.0  
**編寫日期**: 2026-05-08  
**需求數**: 6 個  
**優先級**: P0 (MVP 必須)  
**狀態**: 🔄 初版

---

## 📋 需求映射表

| 需求編碼 | 需求名稱 | 優先級 | 設計位置 | 複雜度 |
|---------|--------|-------|---------|--------|
| **NFR-3.1** | GDPR 數據保護 | P0 | [第 2 部分](#gdpr-數據保護) | ⭐⭐⭐ |
| **NFR-3.2** | 數據最小化原則 | P0 | [第 3 部分](#數據最小化) | ⭐⭐ |
| **NFR-3.3** | 用戶同意管理 | P0 | [第 4 部分](#用戶同意管理) | ⭐⭐ |
| **NFR-3.4** | 數據導出能力 | P0 | [第 5 部分](#數據導出-gdpr-要求) | ⭐⭐ |
| **NFR-3.5** | 數據刪除能力 (被遺忘權) | P0 | [第 6 部分](#數據刪除被遺忘權) | ⭐⭐⭐ |
| **NFR-3.6** | 法務合同管理 | P0 | [第 7 部分](#法務合同管理) | ⭐ |

---

## 第 1 部分：合規架構概述

### 合規範疇

```
┌───────────────────────────────────────────────────────┐
│              合規管理架構                              │
├───────────────────────────────────────────────────────┤
│ GDPR (歐盟)             → 個人數據保護                 │
│ CCPA (加州)             → 消費者隱私權                 │
│ PIPL (中國)             → 個人信息保護                 │
│ 本地法規                → 根據運營地區調整             │
└───────────────────────────────────────────────────────┘
```

### 影響模塊

```
全部 FR 受影響:
✓ FR-R (RBAC) - 用戶同意管理
✓ FR-D (Dashboard) - 數據展示合規
✓ FR-V (VMS) - 供應商數據隔離
✓ FR-P (Procurement) - 採購記錄保留
```

---

## 第 2 部分：GDPR 數據保護

### NFR-3.1 設計

**目標**: 完全遵守 GDPR 規定

### 實現方案

#### 1. 數據處理協議

```
組織方         ←→ 數據處理方 (LinkWise)
(Data Controller)   (Data Processor)

協議內容:
✓ 數據分類 (個人、敏感、商業)
✓ 處理目的 (業務運營、分析、營銷)
✓ 保留期限 (永久 vs. 定期刪除)
✓ 安全措施 (加密、訪問控制)
✓ 違規通報 (72 小時內)
✓ 數據主體權利 (訪問、刪除、轉移)
```

#### 2. 隱私影響評估 (DPIA)

```java
@Entity
@Table(name = "dpia_assessment")
public class DataProtectionImpactAssessment {
    
    @Id
    private UUID id;
    
    private String processName;
    private LocalDate conductedDate;
    private String riskLevel; // LOW, MEDIUM, HIGH
    private String mitigationMeasures;
    private String approverName;
}
```

#### 3. 數據處理記錄

```sql
CREATE TABLE data_processing_record (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL,
    data_category VARCHAR(100), -- e.g., "Employee", "Customer"
    purpose VARCHAR(255),
    retention_period VARCHAR(50),
    recipients VARCHAR(255),
    safeguards TEXT,
    created_at TIMESTAMP,
    last_reviewed TIMESTAMP
);
```

---

## 第 3 部分：數據最小化

### NFR-3.2 設計

**目標**: 僅收集必要的數據

### 實現方案

#### 1. 數據分類

```
必須收集:
✓ 身份信息 (email, 名稱)
✓ 租戶 ID (多租戶隔離)
✓ 採購信息 (金額、日期、廠商)

不應收集:
✗ 家庭地址
✗ 電話號碼 (除非必要)
✗ IP 日誌 (長期保存)
✗ 追蹤 cookie (除非同意)
```

#### 2. 數據驗證

```java
@Service
public class DataMinimizationService {
    
    public void validateUserDataCollection(CreateUserRequest request) {
        // 僅允許必要字段
        String[] allowedFields = {"email", "name", "department"};
        Set<String> providedFields = request.getProvidedFields();
        
        for (String field : providedFields) {
            if (!Arrays.asList(allowedFields).contains(field)) {
                logger.warn("Unnecessary data field collected: {}", field);
                throw new DataMinimizationViolation(field);
            }
        }
    }
}
```

#### 3. 定期審查

```java
@Component
@Scheduled(cron = "0 0 0 1 * *") // 每月 1 日審查
public class DataMinimizationReview {
    
    public void reviewCollectedData() {
        // 1. 審查收集的所有字段
        // 2. 確認每個字段的合理性
        // 3. 刪除不必要的數據
        // 4. 生成合規報告
    }
}
```

---

## 第 4 部分：用戶同意管理

### NFR-3.3 設計

**目標**: 明確記錄用戶同意

### 實現方案

#### 1. 同意表

```sql
CREATE TABLE user_consent (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES "user"(id),
    tenant_id UUID NOT NULL,
    consent_type VARCHAR(100), -- e.g., "DATA_PROCESSING", "MARKETING"
    is_granted BOOLEAN DEFAULT FALSE,
    granted_at TIMESTAMP,
    version INT, -- 版本控制
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_consent ON user_consent(user_id, consent_type);
```

#### 2. 同意收集

```java
@Service
public class ConsentService {
    
    @Autowired
    private UserConsentRepository consentRepository;
    
    public void grantConsent(String userId, String consentType, HttpServletRequest request) {
        UserConsent consent = new UserConsent();
        consent.setUserId(userId);
        consent.setConsentType(consentType);
        consent.setIsGranted(true);
        consent.setGrantedAt(LocalDateTime.now());
        consent.setIpAddress(getClientIp(request));
        consent.setUserAgent(request.getHeader("User-Agent"));
        
        consentRepository.save(consent);
        logger.info("User {} granted consent for {}", userId, consentType);
    }
    
    public boolean hasConsent(String userId, String consentType) {
        return consentRepository
            .findLatestConsent(userId, consentType)
            .map(UserConsent::isGranted)
            .orElse(false);
    }
}
```

---

## 第 5 部分：數據導出 (GDPR 要求)

### NFR-3.4 設計

**目標**: 用戶可導出個人數據

### 實現方案

#### 1. 導出 API

```java
@RestController
@RequestMapping("/api/data-export")
public class DataExportController {
    
    @PostMapping("/request")
    public DataExportResponse requestDataExport() {
        String userId = getCurrentUserId();
        
        // 創建導出任務
        DataExportTask task = new DataExportTask();
        task.setUserId(userId);
        task.setStatus("PENDING");
        task.setRequestedAt(LocalDateTime.now());
        
        dataExportRepository.save(task);
        
        // 異步生成導出文件
        exportService.generateExportAsync(task);
        
        return new DataExportResponse(task.getId());
    }
    
    @GetMapping("/{taskId}")
    public ResponseEntity<Resource> downloadExport(@PathVariable String taskId) {
        DataExportTask task = dataExportRepository.findById(taskId)
            .orElseThrow(() -> new ResourceNotFoundException());
        
        if (!task.getStatus().equals("COMPLETED")) {
            throw new DataExportNotReadyException();
        }
        
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, 
                "attachment; filename=\"data-export.json\"")
            .body(new FileSystemResource(task.getFilePath()));
    }
}
```

#### 2. 導出數據結構

```java
@Service
public class DataExportService {
    
    public JSONObject buildExportData(String userId) {
        JSONObject export = new JSONObject();
        
        // 用戶信息
        export.put("user", getUserData(userId));
        
        // 個人採購記錄
        export.put("purchases", getPurchaseData(userId));
        
        // 個人活動日誌
        export.put("activities", getActivityLog(userId));
        
        // 同意記錄
        export.put("consents", getConsentHistory(userId));
        
        return export;
    }
}
```

#### 3. 安全考慮

```
導出文件要求:
✓ 加密傳輸 (HTTPS only)
✓ 時限下載 (24 小時後過期)
✓ 日誌記錄 (誰在何時下載)
✓ 一次性下載連結
```

---

## 第 6 部分：數據刪除 (被遺忘權)

### NFR-3.5 設計

**目標**: 支持完全刪除用戶數據

### 實現方案

#### 1. 刪除請求流程

```
用戶提出刪除請求
    ↓
驗證身份 (2-FA / email 確認)
    ↓
冷卻期 (30 天反思期)
    ↓
組織審核 (法務/安全)
    ↓
執行刪除 (清理所有個人數據)
    ↓
刪除確認
```

#### 2. 刪除實現

```java
@Service
public class DataDeletionService {
    
    @Transactional
    public void scheduleUserDeletion(String userId) {
        DeletionRequest request = new DeletionRequest();
        request.setUserId(userId);
        request.setRequestedAt(LocalDateTime.now());
        request.setScheduledDeletionDate(LocalDateTime.now().plusDays(30));
        request.setStatus("PENDING");
        
        deletionRequestRepository.save(request);
    }
    
    @Scheduled(cron = "0 0 2 * * *") // 每日 02:00 執行
    @Transactional
    public void executePendingDeletions() {
        List<DeletionRequest> requests = deletionRequestRepository
            .findByStatusAndScheduledDeletionDateBefore("PENDING", LocalDateTime.now());
        
        for (DeletionRequest request : requests) {
            deleteUserData(request.getUserId());
            request.setStatus("COMPLETED");
            request.setCompletedAt(LocalDateTime.now());
        }
    }
    
    @Transactional
    private void deleteUserData(String userId) {
        // 1. 刪除用戶賬戶
        userRepository.deleteById(userId);
        
        // 2. 刪除個人採購記錄
        purchaseRepository.deleteByUserId(userId);
        
        // 3. 清空個人備註和評論
        commentRepository.deleteByUserId(userId);
        
        // 4. 匿名化審計日誌
        auditLogRepository.anonymizeByUserId(userId);
        
        // 5. 記錄刪除操作
        deletionAuditRepository.save(
            new DeletionAudit(userId, LocalDateTime.now(), "COMPLETED")
        );
    }
}
```

#### 3. 匿名化而非刪除

```
某些數據無法刪除 (法律要求保留):
✓ 採購歷史 (財務記錄)
✓ 審計日誌 (內部控制)

解決方案: 匿名化
✓ 移除個人身份信息
✓ 替換為匿名 ID
✓ 保留必要的業務數據
```

---

## 第 7 部分：法務合同管理

### NFR-3.6 設計

**目標**: 管理數據處理協議和 ToS

### 實現方案

#### 1. 文檔管理

```java
@Entity
@Table(name = "legal_document")
public class LegalDocument {
    
    @Id
    private UUID id;
    
    @Enumerated(EnumType.STRING)
    private DocumentType type; // DPA, ToS, PRIVACY_POLICY
    
    private String version;
    private LocalDate effectiveDate;
    private LocalDate expirationDate;
    
    @Column(columnDefinition = "TEXT")
    private String content;
    
    private String lastReviewedBy;
    private LocalDate lastReviewedDate;
}

public enum DocumentType {
    DATA_PROCESSING_AGREEMENT,
    TERMS_OF_SERVICE,
    PRIVACY_POLICY,
    SERVICE_LEVEL_AGREEMENT
}
```

#### 2. 文檔版本控制

```java
@Service
public class LegalDocumentService {
    
    public void updateDocument(UUID documentId, String newContent) {
        LegalDocument existing = legalDocumentRepository.findById(documentId)
            .orElseThrow();
        
        // 1. 創建新版本
        LegalDocument newVersion = new LegalDocument();
        newVersion.setType(existing.getType());
        newVersion.setVersion(incrementVersion(existing.getVersion()));
        newVersion.setContent(newContent);
        newVersion.setEffectiveDate(LocalDate.now().plusDays(30)); // 30天后生效
        
        legalDocumentRepository.save(newVersion);
        
        // 2. 通知所有用戶
        notificationService.notifyDocumentUpdate(existing.getType(), newVersion.getVersion());
    }
}
```

---

## ✅ 驗證清單

- [ ] GDPR 合規清單已完成
- [ ] 隱私影響評估已進行
- [ ] 用戶同意機制已部署
- [ ] 數據導出功能已實施
- [ ] 數據刪除流程已建立
- [ ] 法務文檔已版本控制

---

## 🔄 實施順序

1. **第 1 週**: 數據分類 + 同意管理
2. **第 2 週**: 導出 + 刪除功能
3. **第 3 週**: 法務文檔管理
4. **第 4 週**: 合規審計 + 測試

---

## 📝 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0 | 2026-05-08 | 初版：合規設計完整方案 |

# 帳號權限管理設計文檔 (FR-R)

**設計編碼**: FR-R  
**模塊名稱**: LinkWise 帳號和權限管理 (RBAC)  
**文檔版本**: 1.0  
**編寫日期**: 2026-05-08  
**支持的需求**: FR-R1.1 ~ FR-R4.2 (13 個需求)  
**優先級**: P0 (MVP 必須)  
**複雜度**: ⭐⭐⭐⭐ (高)  

---

## 📋 目錄

1. [概述](#概述)
2. [認證系統設計](#認證系統設計)
3. [用戶管理](#用戶管理)
4. [角色和權限系統](#角色和權限系統)
5. [部門管理](#部門管理)
6. [安全設計](#安全設計)
7. [設計決策](#設計決策)
8. [與其他模塊的交互](#與其他模塊的交互)

---

## 概述

### 模塊定位

RBAC (Role-Based Access Control) 是 LinkWise 的安全基礎，負責身份驗證、用戶管理、角色定義和細粒度權限控制。

### 支持的需求

| 需求編碼 | 功能分組 | 優先級 | 複雜度 |
|---------|--------|-------|-------|
| **FR-R1.1 ~ FR-R1.4** | 認證系統 (OAuth, Keycloak, 本地帳號, 會話) | P0 | ⭐⭐⭐ |
| **FR-R2.1 ~ FR-R2.4** | 用戶管理 (列表、創建、編輯、刪除) | P0 | ⭐ |
| **FR-R3.1 ~ FR-R3.3** | 角色和權限 (內置角色、權限矩陣、部門隔離) | P0 | ⭐⭐⭐⭐ |
| **FR-R4.1 ~ FR-R4.2** | 部門管理 (新增編輯、組織可視化) | P0 | ⭐⭐ |

### 業務價值

- 🔐 **安全認證**: 支持企業級 SSO (Keycloak) + 社交登錄 (Google OAuth)
- 👥 **精細權限**: 按模塊、功能、數據、操作細粒度控制
- 🏢 **多組織隔離**: 完全的租戶隔離 + 部門維度隔離
- ⚡ **快速決策**: 角色和權限支持動態配置，無需改代碼

---

## 認證系統設計 (FR-R1.1 ~ FR-R1.4)

### FR-R1.1: Google OAuth 2.0 登錄流程

**需求描述**: 支持 Google OAuth 2.0 登錄流程

**應用場景**:
```
初期用戶: 個人用戶、小企業快速試用
方式: 使用個人 Google 帳號登錄
優勢: 零成本、快速入門
```

**實現流程**:
```
1. 前端 (React)
   → 用戶點擊 "Use Google Login"
   → 重定向到 Google OAuth 授權頁
   
2. Google
   → 用戶授權
   → 返回 authorization_code
   
3. 後端 (Spring Boot)
   → 接收 code
   → 用 client_id + client_secret + code 交換 access_token
   → 調用 Google 的 /userinfo 獲取用戶信息
   → 在本地 user 表創建 / 更新用戶
   → 生成 JWT token 返回前端
   
4. 前端
   → 存儲 JWT token
   → 後續請求帶上 Authorization: Bearer {token}
```

**代碼流程**:
```java
@PostMapping("/auth/oauth/google")
public ResponseEntity<LoginResponse> loginWithGoogle(
    @RequestBody OAuthCodeRequest request
) {
    // 1. 用 code 交換 access_token
    String accessToken = googleOAuthService.exchangeCodeForToken(request.getCode());
    
    // 2. 獲取用戶信息
    GoogleUserInfo userInfo = googleOAuthService.getUserInfo(accessToken);
    
    // 3. 查找或創建本地用戶
    User user = userService.findOrCreateUserByEmail(userInfo.getEmail());
    
    // 4. 生成 JWT
    String jwtToken = jwtService.generateToken(user);
    
    return ResponseEntity.ok(new LoginResponse(jwtToken));
}
```

---

### FR-R1.2: Keycloak 企業帳號集成

**需求描述**: 支持 Keycloak 企業帳號集成

**應用場景**:
```
企業用戶: 大型企業客戶
方式: 企業 SSO (Single Sign-On)
優勢: 企業統一身份管理，安全性最高
```

**架構**:
```
企業內部 Keycloak 實例
        ↓
LinkWise OAuth 客戶端 (在 Keycloak 中配置)
        ↓
LinkWise 後端 (驗證 JWT)
```

**實現流程**:
```
1. 企業配置
   → 在企業的 Keycloak 實例中創建 OAuth 客戶端
   → 配置 LinkWise 的 callback URL
   → 獲得 client_id 和 client_secret
   
2. 用戶登錄
   → 前端重定向到企業 Keycloak
   → 用戶輸入企業帳號密碼
   → Keycloak 驗證並返回 JWT
   
3. LinkWise 驗證
   → 後端驗證 JWT 簽名 (使用 Keycloak 的公鑰)
   → 驗證 claims (iss, aud, exp)
   → 從 JWT 中提取用戶信息並在本地創建用戶
```

**代碼**:
```java
@PostMapping("/auth/oidc/keycloak")
public ResponseEntity<LoginResponse> loginWithKeycloak(
    @RequestBody KeycloakTokenRequest request
) {
    // 1. 驗證 JWT 簽名
    Claims claims = keycloakService.validateAndParsJWT(request.getToken());
    
    // 2. 創建或更新本地用戶
    User user = userService.findOrCreateUserBySub(claims.getSubject());
    
    // 3. 生成 LinkWise 的 JWT
    String linkwiseToken = jwtService.generateToken(user);
    
    return ResponseEntity.ok(new LoginResponse(linkwiseToken));
}
```

---

### FR-R1.3: 本地帳號創建

**需求描述**: 支持本地帳號創建（備用方案）

**應用場景**:
```
備用方案: 用戶無法使用 OAuth / Keycloak
支持: 用戶名 + 密碼登錄
安全性: 使用 BCrypt 加密密碼
```

**註冊流程**:
```
1. 用戶填寫表單
   - 郵箱 (作為 username)
   - 密碼 (最少 12 字符)
   
2. 驗證
   - 郵箱格式檢查
   - 郵箱未被使用
   - 密碼強度檢查
   
3. 創建帳號
   - 用 BCrypt 加密密碼
   - 生成 email_verification_token
   - 發送驗證郵件
   
4. 郵件驗證
   - 用戶點擊驗證鏈接
   - 驗證 token
   - 激活帳號
```

**登錄流程**:
```java
@PostMapping("/auth/login")
public ResponseEntity<LoginResponse> login(
    @RequestBody LoginRequest request
) {
    // 1. 查找用戶
    User user = userRepository.findByEmail(request.getEmail());
    if (user == null) {
        throw new UnauthorizedException("Invalid credentials");
    }
    
    // 2. 驗證密碼
    if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
        throw new UnauthorizedException("Invalid credentials");
    }
    
    // 3. 生成 JWT
    String token = jwtService.generateToken(user);
    
    return ResponseEntity.ok(new LoginResponse(token));
}
```

---

### FR-R1.4: 會話管理

**需求描述**: 會話管理 (Token, 超時, 單點登出)

**Token 設計**:
```json
{
  "sub": "user_id_123",
  "org": "organization_id_456",
  "email": "user@example.com",
  "roles": ["BUYER", "APPROVER"],
  "permissions": ["PR_CREATE", "PR_APPROVE", "VENDOR_VIEW"],
  "dept": "department_id_789",
  "iat": 1651234567,
  "exp": 1651238167,  // 1 小時後過期
  "refresh_exp": 1651494567,  // Refresh Token 7 天後過期
  "iss": "linkwise"
}
```

**超時機制**:
```
- Access Token TTL: 1 小時
- Refresh Token TTL: 7 天
- 用戶長期未活動 (>30分鐘): 強制重新認證
```

**單點登出 (Logout)**:
```java
@PostMapping("/auth/logout")
public ResponseEntity<Void> logout(
    @RequestHeader("Authorization") String token
) {
    // 1. 提取 token
    String jwtToken = token.substring(7); // "Bearer " prefix
    
    // 2. 將 token 加入黑名單
    tokenBlacklistService.addToBlacklist(jwtToken);
    
    // 3. 清除用戶的所有會話
    sessionService.clearUserSessions(SecurityUtil.getCurrentUserId());
    
    return ResponseEntity.ok().build();
}
```

**Token 黑名單** (防止被盜用):
```
使用 Redis 存儲被登出的 Token
Key: token_blacklist:{token_hash}
TTL: 與 token 過期時間相同

檢查 Token 時:
if (redisService.exists("token_blacklist:" + tokenHash)) {
    throw new UnauthorizedException("Token has been revoked");
}
```

---

## 用戶管理 (FR-R2.1 ~ FR-R2.4)

### FR-R2.1: 用戶列表頁面

**需求描述**: 用戶列表頁面 (搜索、篩選、批量操作)

**顯示內容**:
```
| 用戶名 | 郵箱 | 角色 | 部門 | 狀態 | 操作 |
|--------|------|------|------|------|------|
| John | john@example.com | Buyer, Approver | 採購部 | 活躍 | 編輯 禁用 |
| Jane | jane@example.com | Admin | - | 活躍 | 編輯 禁用 |
```

**搜索功能**:
```
搜索字段:
- 用戶名
- 郵箱
- 部門名稱
```

**篩選條件**:
```
- 角色: Admin, Approver, Buyer, Requester
- 部門: 選擇特定部門
- 狀態: 活躍, 禁用, 待激活
```

**批量操作**:
```
- 批量停用用戶
- 批量分配角色
- 批量導出
```

---

### FR-R2.2: 創建用戶

**需求描述**: 創建用戶

**創建方式**:
```
1. 手動創建
   - Admin 在後台手動創建
   - 設定郵箱、初始密碼、角色、部門

2. 邀請用戶
   - 發送邀請郵件
   - 用戶點擊鏈接激活帳號
```

**流程**:
```java
@PostMapping("/users")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<UserDTO> createUser(
    @RequestBody CreateUserRequest request
) {
    // 1. 驗證郵箱未被使用
    if (userRepository.existsByEmail(request.getEmail())) {
        throw new BusinessException("Email already in use");
    }
    
    // 2. 創建用戶
    User user = new User();
    user.setEmail(request.getEmail());
    user.setName(request.getName());
    user.setOrganizationId(SecurityUtil.getCurrentOrganizationId());
    user.setDepartmentId(request.getDepartmentId());
    user.setStatus(UserStatus.ACTIVE);
    
    // 3. 設置密碼或生成臨時密碼
    if (request.getPassword() != null) {
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
    } else {
        String tempPassword = generateTemporaryPassword();
        user.setPasswordHash(passwordEncoder.encode(tempPassword));
        // 發送帶有臨時密碼的郵件
        emailService.sendTemporaryPasswordEmail(user.getEmail(), tempPassword);
    }
    
    // 4. 保存用戶
    User savedUser = userRepository.save(user);
    
    // 5. 分配角色
    if (request.getRoleIds() != null) {
        request.getRoleIds().forEach(roleId -> {
            userRoleRepository.save(new UserRole(savedUser.getId(), roleId));
        });
    }
    
    return ResponseEntity.ok(new UserDTO(savedUser));
}
```

---

### FR-R2.3: 編輯用戶

**需求描述**: 編輯用戶

**可編輯字段**:
```
- 用戶名
- 角色分配
- 部門分配
- 狀態 (活躍/禁用)
- 密碼 (管理員可重置)
```

**權限檢查**:
```
- Admin 可以編輯任何用戶
- Approver 可以編輯自己部門的用戶
- 用戶自己可以修改密碼
```

---

### FR-R2.4: 禁用 / 刪除用戶

**需求描述**: 禁用 / 刪除用戶

**禁用** (邏輯刪除):
```
用途: 臨時停用用戶帳號
效果:
- 用戶無法登錄
- 所有 Token 無效
- 審計日誌保留用戶操作記錄

實現:
UPDATE user SET status = 'DISABLED', disabled_at = NOW();
```

**刪除** (物理刪除):
```
用途: 完全移除用戶
限制: 
- 只有 Admin 可以操作
- 只能刪除沒有關聯數據的用戶 (如 PR 作者)
- 保留審計日誌中的用戶操作記錄

實現:
DELETE FROM user WHERE id = ? AND organization_id = ?;
```

---

## 角色和權限系統 (FR-R3.1 ~ FR-R3.3)

### FR-R3.1: 角色管理 (內置 + 自定義)

**需求描述**: 角色管理 (內置角色 + 自定義角色)

**內置角色** (4 個):
```
1. Admin (系統管理員)
   - 全系統管理權限
   - 用戶管理、角色配置、系統設置

2. Approver (審批人)
   - PR 審批權限
   - 部門及下屬數據查看

3. Buyer (採購員)
   - PR 創建、編輯、刪除
   - 供應商查詢

4. Requester (請求者)
   - 創建採購請求
   - 查詢自己的請求狀態
```

**自定義角色**:
```
用途: 滿足企業特殊需求
示例:
- "VMS Manager": 只能管理供應商
- "Finance Reviewer": 只能審核高金額 PR
```

---

### FR-R3.2: 權限矩陣

**需求描述**: 權限矩陣 (模塊、功能、數據、操作)

**四維權限模型**:
```
1. 模塊級 (Module)
   ├─ Dashboard
   ├─ RBAC
   ├─ VMS
   └─ Procurement

2. 功能級 (Feature)
   ├─ Dashboard: 摘要卡片、圖表、供應商評分
   ├─ VMS: 供應商列表、風險評級、Onboarding
   ├─ Procurement: PR 創建、審批、PO 生成
   └─ ...

3. 數據級 (Data)
   ├─ 企業數據 (全公司)
   ├─ 部門數據 (自己部門及下屬)
   ├─ 個人數據 (自己的請求)
   └─ 受限數據 (供應商隱私信息)

4. 操作級 (Operation)
   ├─ Create (創建)
   ├─ Read (讀取)
   ├─ Update (編輯)
   └─ Delete (刪除)
```

**權限檢查規則**:
```java
// 角色 - 權限對應
Admin:     所有權限
Approver:  
  - MODULE: Dashboard, VMS, Procurement
  - FEATURE: 所有
  - DATA: 自己部門及下屬
  - OPERATION: 讀取、審批

Buyer:
  - MODULE: Dashboard, VMS, Procurement
  - FEATURE: PR 創建、VMS 查詢
  - DATA: 自己的 PR/PO、全公司的供應商
  - OPERATION: 創建、讀取、編輯

Requester:
  - MODULE: Procurement
  - FEATURE: PR 創建
  - DATA: 自己的 PR
  - OPERATION: 創建、讀取
```

**實現**:
```java
@PostMapping("/purchase-requests")
@PreAuthorize("hasPermission('PR_CREATE')")
public ResponseEntity<PrDTO> createPr(
    @RequestBody CreatePrRequest request
) {
    // 權限檢查通過才能執行
    PurchaseRequest pr = purchaseRequestService.create(request);
    return ResponseEntity.ok(new PrDTO(pr));
}
```

---

### FR-R3.3: 部門維度權限 (部門隔離、跨部門查看)

**需求描述**: 部門維度權限 (部門隔離、跨部門查看)

**部門隔離**:
```
原則: 每個部門的用戶只能看到自己部門的數據
實現: 在查詢時自動過濾 department_id

示例:
Approver (部門 A) 登錄
→ 只能看到部門 A 的 PR/PO
→ 看不到部門 B 的數據
```

**跨部門查看** (Admin 和 Manager):
```
Admin:
- 可以看到全公司所有部門的數據

Department Manager (部門經理):
- 可以看到自己部門的數據
- 可以看到下屬部門的數據

示例:
Part Management > Operations
        ├─ Operations
        ├─ Procurement
        └─ Finance

Operations Manager 可以看:
- Operations 部門數據
- Procurement 部門數據 (下屬)
- Finance 部門數據 (下屬)
```

**SQL 實現**:
```sql
-- 查詢 Approver 能看到的 PR
SELECT pr.* FROM purchase_request pr
JOIN department d ON pr.department_id = d.id
WHERE pr.organization_id = CURRENT_ORG
  AND d.id IN (
    SELECT id FROM department
    WHERE id = CURRENT_DEPT_ID  -- 自己部門
       OR parent_id = CURRENT_DEPT_ID  -- 下屬部門
       OR id IN (SELECT id FROM department WHERE path LIKE CURRENT_DEPT_PATH || '%')  -- 遞迴下屬
  )
```

---

## 部門管理 (FR-R4.1 ~ FR-R4.2)

### FR-R4.1: 部門管理

**需求描述**: 部門管理 (新增、編輯、刪除)

**部門結構**:
```
公司
├─ 採購部
│  ├─ 採購核心
│  └─ VMS 團隊
├─ 財務部
│  ├─ 應付
│  └─ 對賬
└─ IT 部
```

**操作**:
```
創建部門:
- 輸入部門名稱、編碼
- 選擇上級部門 (可選，不選則為一級)
- 指定部門經理

編輯部門:
- 修改部門名稱、編碼
- 變更上級部門 (限制: 不能造成循環)
- 更換部門經理

刪除部門:
- 部門為空時可刪除
- 非空部門需要先遷移成員到其他部門
```

---

### FR-R4.2: 組織結構可視化 (P1, 初期可選)

**需求描述**: 組織結構可視化 (樹狀圖、交互操作)

**展示方式**:
```
樹狀圖:
公司
├─ 採購部 (5 人)
│  ├─ 採購核心 (3 人)
│  └─ VMS 團隊 (2 人)
├─ 財務部 (4 人)
└─ IT 部 (2 人)

點擊部門 → 展開/收縮
點擊人名 → 查看用戶詳情
拖拽人名 → 調整部門
```

**前端技術**:
```
- React Tree Component
- D3.js 或 Vis.js 進行可視化
```

---

## 安全設計

### 多租戶隔離

**隔離點**:
```
1. 用戶表
   ✓ organization_id 字段確保多租戶隔離
   ✓ RLS 政策: users 只能看同 organization 的用戶

2. 角色表
   ✓ organization_id 字段
   ✓ 內置角色: organization_id = NULL (全局)
   ✓ 自定義角色: organization_id = 特定組織

3. 權限表
   ✓ 权限是全局的 (organization_id = NULL)
   ✓ 角色 - 權限映射遵守多租戶隔離

4. 部門表
   ✓ organization_id 字段
   ✓ 每個組織有獨立的部門樹
```

### 密碼安全

**密碼策略**:
```
- 最少 12 字符
- 必須包含大小寫字母、數字、特殊字符
- 不能重複最近 5 次密碼
- 密碼有效期 90 天 (建議)
```

**加密**:
```
使用 BCrypt:
- Work factor: 12 (耗時 ~100ms)
- Salt: 自動生成

密碼存儲:
INSERT INTO user (password_hash) VALUES ('$2a$12$...');
驗證: passwordEncoder.matches(rawPassword, storedHash)
```

### Token 安全

**XSS 防護**:
```
Token 存儲: LocalStorage (適合 SPA)
備選: HttpOnly Cookie (更安全)
```

**CSRF 防護**:
```
- 同源請求使用 SameSite Cookie
- 跨域請求需要 CSRF Token
```

---

## 設計決策

### 決策 1: 為什麼支持 3 種認證方式而不是只用 OAuth？

**背景**:
- OAuth 適合社交登錄，但不適合企業 SSO
- 企業 SSO (Keycloak) 最安全，但需要企業配置
- 本地帳號是備用方案

**決策理由**:
```
Google OAuth    → 吸引個人用戶和小企業
Keycloak OIDC   → 支持大型企業客戶
本地帳號        → 備用方案
三管齊下 → 最大化市場覆蓋，零成本獲取用戶
```

---

### 決策 2: 為什麼使用 JWT 而不是 Session？

**對比**:
```
Session:
  - 優點: 傳統、可靠
  - 問題: 無法水平擴展（需要共享 Session 存儲）
  
JWT:
  - 優點: 無狀態、易於擴展、適合微服務
  - 問題: 無法即時刪除（使用黑名單緩解）

決策: JWT (為 Phase 2 微服務做準備)
```

---

### 決策 3: 為什麼部門隔離使用樹狀結構而不是平層？

**理由**:
```
企業組織通常是樹狀的：
CEO
├─ COO
│  ├─ VP Sales
│  └─ VP Operations
│     ├─ VP Procurement
│     └─ VP Finance
└─ CTO

樹狀結構支持:
- 遞迴查詢下屬部門
- 跨部門查看權限（上級可看下級）
- 自然映射企業組織
```

---

## 與其他模塊的交互

### 依賴關係

```
RBAC Service
  ├── 被依賴者
  │   ├─ Dashboard Service (使用 RBAC 進行權限檢查)
  │   ├─ VMS Service (使用 RBAC 進行權限檢查)
  │   ├─ Procurement Service (使用 RBAC 進行權限檢查)
  │   └─ 所有服務 (使用 JWT 認證)
  │
  └── 依賴者
      └─ 認證系統 (Keycloak, Google OAuth)
```

### API 集成點

```
Dashboard 調用 RBAC:
GET /api/v1/auth/me  → 獲取當前用戶權限
GET /api/v1/departments/{id}  → 獲取部門信息

VMS 調用 RBAC:
@PreAuthorize("hasPermission('VENDOR_EDIT')")  → 權限檢查

Procurement 調用 RBAC:
@PreAuthorize("hasPermission('PR_APPROVE')")  → 權限檢查
```

---

## 後續設計文件

✅ 完成: FR-R_design.md (本文件)  
⏳ 關聯:
- [FR-R_data-model.md](FR-R_data-model.md) - 數據模型設計
- [FR-R_components.md](FR-R_components.md) - 前後端組件設計
- [FR-R_api-spec.md](FR-R_api-spec.md) - REST API 規範

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0 | 2026-05-08 | 初版：13 個需求的完整設計 |

**最後更新**: 2026-05-08  
**責任人**: System Architect

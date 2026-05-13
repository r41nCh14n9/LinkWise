# 實現計劃: FR-R 帳號權限管理 (RBAC) v1

**計劃編碼**: IMPL-PLAN-FR-R-RBAC-v1  
**功能模塊**: FR-R 帳號和權限管理 (RBAC)  
**版本**: v1.0  
**編寫日期**: 2026-05-12  
**目標完成日期**: 2026-05-15  
**優先級**: P0 (MVP 必須)  
**複雜度**: ⭐⭐⭐⭐ (高)  

---

## 📋 目錄

1. [概述](#概述)
2. [實現方法](#實現方法)
3. [實現步驟](#實現步驟)
4. [檔案結構](#檔案結構)
5. [依賴關係](#依賴關係)
6. [技術要點](#技術要點)
7. [進度追蹤](#進度追蹤)

---

## 概述

### 支持的需求
- **FR-R1.1**: 支持 Google OAuth 2.0 登錄流程
- **FR-R1.2**: 支持 Keycloak 企業帳號集成
- **FR-R1.3**: 支持本地帳號創建（備用方案）
- **FR-R1.4**: 會話管理 (Token, 超時, 單點登出)
- **FR-R2.1**: 用戶列表頁面 (搜索、篩選、批量操作)
- **FR-R2.2**: 創建用戶
- **FR-R2.3**: 編輯用戶
- **FR-R2.4**: 禁用 / 刪除用戶
- **FR-R3.1**: 角色管理 (內置 + 自定義)
- **FR-R3.2**: 權限矩陣 (模塊、功能、數據、操作)
- **FR-R3.3**: 部門維度權限 (部門隔離、跨部門查看)
- **FR-R4.1**: 部門管理 (新增、編輯、刪除)
- **FR-R4.2**: 組織結構可視化 (樹狀圖、交互操作)

### 業務價值
- 🔐 企業級安全認證 (OAuth + Keycloak + 本地帳號)
- 👥 精細的權限控制 (4 維權限模型)
- 🏢 多租戶隔離 + 部門維度隔離
- ⚡ 動態權限配置，無需改代碼

---

## 實現方法

### Phase 1: 後端基礎設施 (2.5 天)
1. ✅ 數據模型 (User, Role, Permission, Department)
2. ✅ 認證服務 (JWT, OAuth, Keycloak)
3. ✅ 權限檢查機制 (@PreAuthorize, 自定義攔截器)
4. ✅ 用戶管理 API (CRUD + 搜索篩選)
5. ✅ 角色管理 API
6. ✅ 部門管理 API

### Phase 2: 前端界面 (1.5 天)
1. ✅ 用戶列表頁面 (表格、搜索、篩選、批量操作)
2. ✅ 用戶創建/編輯表單
3. ✅ 角色管理界面
4. ✅ 部門管理界面 (樹狀圖)
5. ✅ 權限矩陣可視化

### Phase 3: 集成測試 (1 天)
1. ✅ 端到端集成測試
2. ✅ 權限驗證測試
3. ✅ 多租戶隔離測試
4. ✅ 性能測試

### Phase 4: 修復和優化 (0.5 天)
1. ✅ Bug 修復
2. ✅ 性能優化
3. ✅ 安全審計

---

## 實現步驟

### 後端實現步驟

#### 1. 創建數據模型

**User Entity**:
```
- id (PK)
- organization_id (FK)
- email (unique within org)
- username
- password_hash
- first_name
- last_name
- department_id (FK)
- status (ACTIVE, DISABLED, PENDING_ACTIVATION)
- created_at
- updated_at
- deleted_at (soft delete)
```

**Role Entity**:
```
- id (PK)
- organization_id (可為 NULL，表示內置角色)
- name (Admin, Approver, Buyer, Requester)
- description
- is_builtin (true for Admin/Approver/Buyer/Requester)
- created_at
```

**Permission Entity**:
```
- id (PK)
- code (PR_CREATE, PR_APPROVE, VENDOR_VIEW, etc.)
- module (Dashboard, RBAC, VMS, Procurement)
- feature (詳細功能)
- description
- data_level (ENTERPRISE, DEPARTMENT, PERSONAL, RESTRICTED)
- operation (CREATE, READ, UPDATE, DELETE)
```

**RolePermission Entity** (多對多):
```
- role_id (FK)
- permission_id (FK)
```

**Department Entity**:
```
- id (PK)
- organization_id (FK)
- name
- code
- parent_id (FK, self-referencing)
- manager_id (FK to User)
- path (hierarchical path, e.g., "1/2/3")
- level (depth in tree)
- created_at
- updated_at
```

#### 2. 創建認證服務

**JWT Service**:
- 生成 JWT token (access + refresh)
- 驗證 JWT 簽名
- 解析 JWT claims
- Token 黑名單管理 (Redis)

**Google OAuth Service**:
- 交換 authorization code 為 access_token
- 獲取用戶信息
- 創建或更新本地用戶

**Keycloak Service**:
- 驗證 Keycloak JWT
- 從 JWT 提取用戶信息
- 創建或更新本地用戶

**Password Service**:
- BCrypt 加密密碼
- 驗證密碼
- 生成臨時密碼

#### 3. 創建 API 端點

**認證相關**:
```
POST   /api/v1/auth/oauth/google         - Google OAuth 登錄
POST   /api/v1/auth/oidc/keycloak        - Keycloak 登錄
POST   /api/v1/auth/login                - 本地帳號登錄
POST   /api/v1/auth/register             - 本地帳號註冊
POST   /api/v1/auth/logout               - 登出
POST   /api/v1/auth/refresh              - 刷新 Token
GET    /api/v1/auth/me                   - 獲取當前用戶信息
```

**用戶管理**:
```
GET    /api/v1/users                     - 獲取用戶列表 (搜索、篩選、分頁)
POST   /api/v1/users                     - 創建用戶
GET    /api/v1/users/{id}                - 獲取用戶詳情
PUT    /api/v1/users/{id}                - 編輯用戶
DELETE /api/v1/users/{id}                - 刪除用戶
PATCH  /api/v1/users/{id}/disable        - 禁用用戶
```

**角色管理**:
```
GET    /api/v1/roles                     - 獲取角色列表
POST   /api/v1/roles                     - 創建自定義角色
GET    /api/v1/roles/{id}                - 獲取角色詳情
PUT    /api/v1/roles/{id}                - 編輯角色
DELETE /api/v1/roles/{id}                - 刪除自定義角色
POST   /api/v1/roles/{id}/permissions    - 分配權限
```

**部門管理**:
```
GET    /api/v1/departments               - 獲取部門樹
POST   /api/v1/departments               - 創建部門
GET    /api/v1/departments/{id}          - 獲取部門詳情
PUT    /api/v1/departments/{id}          - 編輯部門
DELETE /api/v1/departments/{id}          - 刪除部門
GET    /api/v1/departments/{id}/users    - 獲取部門用戶
```

### 前端實現步驟

#### 1. 創建 API 服務層

**authService.ts**: 認證相關 API 調用
```typescript
- loginWithGoogle(code)
- loginWithKeycloak(token)
- loginWithLocal(email, password)
- register(data)
- logout()
- getCurrentUser()
- refreshToken()
```

**userService.ts**: 用戶管理 API 調用
```typescript
- getUsers(params: SearchParams)
- getUserById(id)
- createUser(data)
- updateUser(id, data)
- deleteUser(id)
- disableUser(id)
```

**roleService.ts**: 角色管理 API 調用
```typescript
- getRoles()
- getRoleById(id)
- createRole(data)
- updateRole(id, data)
- deleteRole(id)
- assignPermissions(roleId, permissionIds)
```

**departmentService.ts**: 部門管理 API 調用
```typescript
- getDepartmentTree()
- getDepartmentById(id)
- createDepartment(data)
- updateDepartment(id, data)
- deleteDepartment(id)
```

#### 2. 創建 React 組件

**User Management Pages**:
- `UserListPage.tsx` - 用戶列表 (表格、搜索、篩選、批量操作)
- `UserCreateModal.tsx` - 創建用戶表單
- `UserEditModal.tsx` - 編輯用戶表單
- `UserDetailPage.tsx` - 用戶詳情頁

**Role Management Pages**:
- `RoleListPage.tsx` - 角色列表
- `RoleCreateModal.tsx` - 創建角色
- `RolePermissionMatrix.tsx` - 權限矩陣編輯

**Department Management Pages**:
- `DepartmentTreePage.tsx` - 部門樹結構
- `DepartmentFormModal.tsx` - 創建/編輯部門

#### 3. 創建狀態管理 (Redux/Zustand)

**authSlice**: 認證狀態 (currentUser, token, isLoading)
**userSlice**: 用戶列表狀態 (users, selectedUsers, filters)
**roleSlice**: 角色狀態 (roles, permissions)
**departmentSlice**: 部門狀態 (departmentTree, selectedDept)

---

## 檔案結構

### 後端文件結構

```
src/linkwise-core/src/main/java/com/linkwise/
├── entity/
│   ├── User.java
│   ├── Role.java
│   ├── Permission.java
│   ├── RolePermission.java
│   ├── UserRole.java
│   ├── Department.java
│   └── Organization.java
│
├── dto/
│   ├── UserDTO.java
│   ├── RoleDTO.java
│   ├── PermissionDTO.java
│   ├── DepartmentDTO.java
│   ├── LoginResponse.java
│   ├── CreateUserRequest.java
│   └── ...
│
├── service/
│   ├── AuthService.java
│   ├── UserService.java
│   ├── RoleService.java
│   ├── PermissionService.java
│   ├── DepartmentService.java
│   ├── JwtService.java
│   ├── GoogleOAuthService.java
│   ├── KeycloakService.java
│   └── TokenBlacklistService.java
│
├── controller/
│   ├── AuthController.java
│   ├── UserController.java
│   ├── RoleController.java
│   ├── DepartmentController.java
│   └── PermissionController.java
│
├── repository/
│   ├── UserRepository.java
│   ├── RoleRepository.java
│   ├── PermissionRepository.java
│   ├── DepartmentRepository.java
│   └── ...
│
├── security/
│   ├── JwtAuthenticationFilter.java
│   ├── SecurityConfig.java
│   ├── CustomAccessDecisionVoter.java
│   └── SecurityUtil.java
│
├── exception/
│   ├── UnauthorizedException.java
│   ├── ForbiddenException.java
│   └── BusinessException.java
│
└── util/
    ├── JwtUtil.java
    ├── PasswordUtil.java
    └── SecurityUtil.java
```

### 前端文件結構

```
src/linkwise-front/src/
├── services/
│   ├── authService.ts
│   ├── userService.ts
│   ├── roleService.ts
│   ├── departmentService.ts
│   └── permissionService.ts
│
├── store/
│   ├── authSlice.ts
│   ├── userSlice.ts
│   ├── roleSlice.ts
│   ├── departmentSlice.ts
│   └── store.ts
│
├── components/
│   ├── user/
│   │   ├── UserListPage.tsx
│   │   ├── UserTable.tsx
│   │   ├── UserSearchForm.tsx
│   │   ├── UserCreateModal.tsx
│   │   ├── UserEditModal.tsx
│   │   └── UserDetailModal.tsx
│   │
│   ├── role/
│   │   ├── RoleListPage.tsx
│   │   ├── RoleCreateModal.tsx
│   │   ├── RolePermissionMatrix.tsx
│   │   └── PermissionSelect.tsx
│   │
│   ├── department/
│   │   ├── DepartmentTreePage.tsx
│   │   ├── DepartmentTree.tsx
│   │   ├── DepartmentFormModal.tsx
│   │   └── DepartmentNodeItem.tsx
│   │
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   ├── GoogleLoginButton.tsx
│   │   ├── KeycloakLoginButton.tsx
│   │   ├── LocalLoginForm.tsx
│   │   └── PrivateRoute.tsx
│   │
│   └── common/
│       ├── ConfirmDialog.tsx
│       ├── Loading.tsx
│       └── ErrorAlert.tsx
│
├── hooks/
│   ├── useAuth.ts
│   ├── useUser.ts
│   ├── useRole.ts
│   └── useDepartment.ts
│
├── types/
│   ├── auth.ts
│   ├── user.ts
│   ├── role.ts
│   ├── department.ts
│   └── permission.ts
│
└── pages/
    ├── AdminDashboard.tsx
    └── RBACManagement.tsx
```

---

## 依賴關係

### 後端依賴

```xml
<!-- JWT -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.11.5</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.11.5</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.11.5</version>
</dependency>

<!-- Password Encoding -->
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-crypto</artifactId>
</dependency>

<!-- OAuth & Keycloak -->
<dependency>
    <groupId>org.keycloak</groupId>
    <artifactId>keycloak-spring-boot-starter</artifactId>
    <version>22.0.0</version>
</dependency>

<!-- Redis (for token blacklist) -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

### 前端依賴

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "react-router-dom": "^6.0.0",
    "axios": "^1.4.0",
    "zustand": "^4.3.0",  // 或 Redux Toolkit
    "react-table": "^8.0.0",
    "antd": "^5.0.0",  // UI Library
    "@react-aria/tree": "^3.0.0",  // Tree component
    "jsonwebtoken": "^9.0.0"
  }
}
```

---

## 技術要點

### 後端安全實現

1. **JWT Token 設計**:
   - Access Token TTL: 1 小時
   - Refresh Token TTL: 7 天
   - Claims 包含: sub (user_id), org (organization_id), roles, permissions, dept (department_id)

2. **密碼安全**:
   - 使用 BCrypt Work Factor 12
   - 密碼強度檢查 (12+ 字符，大小寫字母、數字、特殊字符)

3. **多租戶隔離**:
   - 所有查詢自動加入 organization_id 過濾
   - 使用 SecurityUtil 獲取當前用戶和組織

4. **權限檢查**:
   - @PreAuthorize("hasPermission('PR_CREATE')")
   - 自定義 PermissionEvaluator 實現 4 維權限模型

### 前端集成要點

1. **API 調用拦截**:
   - 自動添加 Authorization header
   - 處理 401 錯誤 (token 過期) → 刷新 token
   - 處理 403 錯誤 (無權限) → 提示用戶

2. **狀態管理**:
   - Redux Slice 進行狀態管理
   - 異步 thunk 調用後端 API
   - 乐观更新 UI

3. **表格數據展示**:
   - 使用 React Table 進行表格渲染
   - 支持排序、分頁、搜索篩選
   - 單選 / 多選行選擇

4. **表單驗證**:
   - 前端驗證 (required, email format, password strength)
   - 後端驗證 (商業邏輯)

---

## 進度追蹤

### 完成情況

| 任務 | 狀態 | 進度 | 預計完成 |
|------|------|------|---------|
| 後端數據模型 | ⏳ | 0% | 2026-05-12 |
| 認證服務 | ⏳ | 0% | 2026-05-13 |
| 用戶管理 API | ⏳ | 0% | 2026-05-13 |
| 角色權限 API | ⏳ | 0% | 2026-05-13 |
| 部門管理 API | ⏳ | 0% | 2026-05-14 |
| 前端用戶界面 | ⏳ | 0% | 2026-05-14 |
| 前端角色界面 | ⏳ | 0% | 2026-05-14 |
| 前端部門界面 | ⏳ | 0% | 2026-05-15 |
| 集成測試 | ⏳ | 0% | 2026-05-15 |
| Bug 修復 | ⏳ | 0% | 2026-05-15 |

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| v1.0 | 2026-05-12 | 初版：完整的實現計劃 |

**責任人**: Development Agent  
**最後更新**: 2026-05-12

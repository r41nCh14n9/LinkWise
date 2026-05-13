# 代碼紀錄: FR-R 帳號權限管理實現 v1

**文檔編碼**: CODE-FR-R-RBAC-v1  
**功能模塊**: FR-R 帳號和權限管理 (RBAC)  
**版本**: v1.0  
**編寫日期**: 2026-05-12  
**狀態**: 實現中

---

## 📋 實現進度

### ✅ 已完成

#### 後端實體和DTO
- ✅ User Entity (enhancing existing entity)
- ✅ UserStatus Enumeration
- ✅ UserRole Enumeration  
- ✅ Role Entity
- ✅ Permission Entity
- ✅ RolePermission Entity (M-M relationship)
- ✅ UserRoleAssignment Entity (M-M relationship)
- ✅ Department Entity
- ✅ Organization Entity
- ✅ UserDTO, RoleDTO, DepartmentDTO, PermissionDTO
- ✅ Request DTOs (CreateUserRequest, LoginRequest, etc.)
- ✅ Response DTOs (LoginResponse)

#### 後端Repository
- ✅ UserRepository (with enhanced queries)
- ✅ RoleRepository
- ✅ PermissionRepository
- ✅ RolePermissionRepository
- ✅ UserRoleAssignmentRepository
- ✅ DepartmentRepository

#### 後端Service
- ✅ UserService (enhanced with RBAC operations)
- ✅ RoleService (role management + permission assignment)
- ✅ DepartmentService (org structure management)
- ✅ PermissionService (permission lookup)
- ✅ RbacInitializer (data initialization)

#### 後端Controller
- ✅ UserController (enhanced with RBAC endpoints)
- ✅ RoleController (創建但尚未在容器中識別)
- ✅ DepartmentController (創建但尚未在容器中識別)

#### 前端Service層
- ✅ api.ts (axios interceptor configuration)
- ✅ userService.ts (user API client)
- ✅ roleService.ts (role API client)
- ✅ departmentService.ts (department API client)

#### 前端UI組件
- ✅ UserListPage.tsx (user table with search/filter/batch ops)
- ✅ DepartmentTreePage.tsx (organization structure visualization)

### ⏳ 進行中
- ⏳ Controller bean registration issue (RoleController, DepartmentController)
- ⏳ Frontend integration with backend APIs
- ⏳ End-to-end testing

### ❌ 待實現
- ❌ Auth Controller (login/logout/token refresh)
- ❌ JWT token service
- ❌ Role-based access control (authorization)
- ❌ Multi-tenant isolation enforcing
- ❌ User role assignment UI components
- ❌ Role permission matrix UI
- ❌ Comprehensive error handling
- ❌ Security configuration (CORS, CSRF, etc.)

---

## 🔍 已實現的功能

### FR-R2: 用戶管理

#### FR-R2.1: 用戶列表頁面
**API Endpoint**: `GET /api/v1/users?org_id=1&search=email&department_id=1`

**Response Format**:
```json
{
  "code": "SUCCESS",
  "data": [
    {
      "id": 1,
      "email": "user@example.com",
      "username": "john_doe",
      "firstName": "John",
      "lastName": "Doe",
      "status": "ACTIVE",
      "organizationId": 1,
      "departmentId": 1,
      "createdAt": "2026-05-12T07:40:00Z",
      "updatedAt": "2026-05-12T07:40:00Z"
    }
  ]
}
```

**查詢參數支持**:
- `org_id` (required): 組織ID，確保多租戶隔離
- `search` (optional): 按email搜索
- `department_id` (optional): 按部門篩選

**前端實現**: UserListPage.tsx
- 表格顯示用戶列表
- 搜索框 (by email)
- 單選/多選用戶
- 批量操作 (disable, delete)
- 分頁支持

#### FR-R2.2: 創建用戶
**API Endpoint**: `POST /api/v1/users?org_id=1`

**Request Body**:
```json
{
  "email": "newuser@example.com",
  "username": "new_user",
  "firstName": "New",
  "lastName": "User",
  "password": "SecurePassword123!",
  "departmentId": 1,
  "roleIds": [1, 2]
}
```

**Response**:
```json
{
  "code": "CREATED",
  "data": { /* User object */ }
}
```

**後端實現**:
- UserService.createUser() - 創建用戶並分配角色
- PasswordEncoder - BCrypt密碼加密
- 郵箱重複檢查 (per organization)

#### FR-R2.3: 編輯用戶
**API Endpoint**: `PUT /api/v1/users/{id}`

**FR-R2.4: 禁用/刪除用戶
**API Endpoints**:
- `PATCH /api/v1/users/{id}/disable` - 軟刪除
- `DELETE /api/v1/users/{id}` - 硬刪除

---

### FR-R3: 角色和權限系統

#### FR-R3.1: 角色管理
**API Endpoints**:
- `GET /api/v1/roles/builtin` - 獲取內置角色
- `GET /api/v1/roles?org_id=1` - 獲取組織角色
- `GET /api/v1/roles/{id}` - 獲取角色詳情

**內置角色** (在 RbacInitializer 中初始化):
```
1. ADMIN - 全系統管理員 (所有權限)
2. APPROVER - 審批人 (審批權限)
3. BUYER - 採購員 (創建和編輯PR)
4. REQUESTER - 請求者 (基本權限)
```

**後端實現**:
- RoleService - 角色CRUD操作
- RolePermissionRepository - 角色-權限映射
- RbacInitializer - 啟動時初始化4個內置角色和30+個權限

#### FR-R3.2: 權限矩陣
**API Endpoint**: `GET /api/v1/roles/system/permissions`

**Permission Model** (4維):
```
1. Module: Dashboard, RBAC, VMS, Procurement
2. Feature: User Management, Role Management, Dashboard, PR, Vendor, etc.
3. DataLevel: ENTERPRISE, DEPARTMENT, PERSONAL, RESTRICTED
4. Operation: CREATE, READ, UPDATE, DELETE
```

**已定義的權限** (30+ 個):
- USER_CREATE, USER_READ, USER_UPDATE, USER_DELETE
- ROLE_CREATE, ROLE_READ, ROLE_UPDATE, ROLE_DELETE
- DEPT_CREATE, DEPT_READ, DEPT_UPDATE, DEPT_DELETE
- DASHBOARD_VIEW, DASHBOARD_EXPORT
- PR_CREATE, PR_READ, PR_APPROVE, PR_DELETE
- VENDOR_CREATE, VENDOR_READ, VENDOR_UPDATE, VENDOR_DELETE
- 等等

---

### FR-R4: 部門管理

#### FR-R4.1: 部門管理
**API Endpoints**:
- `GET /api/v1/departments?org_id=1` - 獲取所有部門
- `GET /api/v1/departments/tree?org_id=1` - 獲取部門樹
- `POST /api/v1/departments` - 創建部門
- `PUT /api/v1/departments/{id}` - 更新部門
- `DELETE /api/v1/departments/{id}` - 刪除部門

**後端實現**:
- DepartmentService - 部門管理邏輯
- 樹形結構支持 (parent_id, path, level)
- Department Entity 存儲組織結構

#### FR-R4.2: 組織結構可視化
**前端實現**: DepartmentTreePage.tsx
- 樹狀展示部門結構
- 可展開/收縮節點
- 懸停高亮

---

## 🧪 集成測試結果

### 已驗證功能

#### 1. 用戶API
```bash
# 獲取用戶列表
curl http://localhost:8080/api/v1/users?org_id=1
Response: 200 OK - 返回用戶數組

# 創建用戶
POST /api/v1/users?org_id=1
Response: 201 CREATED - 用戶創建成功
```

#### 2. 角色API (待驗證)
- RoleController 編譯但未在Spring容器中註冊
- 需要修復bean掃描問題

#### 3. 部門API (待驗證)
- DepartmentController 編譯但未在Spring容器中註冊
- 需要修復bean掃描問題

### 已知問題

#### Issue #1: Controller Bean Registration
**問題**: RoleController 和 DepartmentController 未被Spring容器掃描
**原因**: 可能的類路徑/編譯問題
**狀態**: 需要調查

**解決步驟**:
1. 檢查 Spring boot logger 是否報告掃描錯誤
2. 驗證 @RestController 和 @RequestMapping 註解
3. 檢查 spring-boot-starter-web 依賴

#### Issue #2: UserService 依賴注入
**問題**: UserService 需要 PasswordEncoder bean
**原因**: Spring Security 未配置
**狀態**: 需要配置 SecurityConfig

---

## 📁 檔案清單

### 後端文件
```
src/linkwise-core/src/main/java/com/linkwise/
├── entity/
│   ├── User.java (enhanced)
│   ├── UserStatus.java ✅
│   ├── UserRole.java ✅
│   ├── Role.java ✅
│   ├── Permission.java ✅
│   ├── RolePermission.java ✅
│   ├── UserRoleAssignment.java ✅
│   ├── Department.java ✅
│   └── Organization.java ✅
│
├── dto/
│   ├── UserDTO.java ✅
│   ├── CreateUserRequest.java ✅
│   ├── LoginRequest.java ✅
│   ├── LoginResponse.java ✅
│   ├── RoleDTO.java ✅
│   ├── DepartmentDTO.java ✅
│   └── PermissionDTO.java ✅
│
├── repository/
│   ├── UserRepository.java (enhanced) ✅
│   ├── RoleRepository.java ✅
│   ├── PermissionRepository.java ✅
│   ├── RolePermissionRepository.java ✅
│   ├── UserRoleAssignmentRepository.java ✅
│   └── DepartmentRepository.java ✅
│
├── service/
│   ├── UserService.java (enhanced) ✅
│   ├── RoleService.java ✅
│   ├── DepartmentService.java ✅
│   ├── PermissionService.java ✅
│   └── RbacInitializer.java ✅
│
├── controller/
│   ├── UserController.java (enhanced) ✅
│   ├── RoleController.java ✅ (not registered)
│   └── DepartmentController.java ✅ (not registered)
└── ...
```

### 前端文件
```
src/linkwise-front/src/
├── services/
│   ├── api.ts ✅
│   ├── userService.ts ✅
│   ├── roleService.ts ✅
│   └── departmentService.ts ✅
│
└── components/
    ├── user/
    │   └── UserListPage.tsx ✅
    │
    └── department/
        └── DepartmentTreePage.tsx ✅
```

---

## 🔄 下一步行動

### 優先級 1: 修復控制器註冊問題
1. 調查 RoleController/DepartmentController 為何未被掃描
2. 檢查 Spring boot classpath scanning
3. 驗證 @Component/@RestController 註解
4. 確認 Maven/Gradle build 包含所有類

### 優先級 2: 完成測試
1. 測試所有 RBAC API 端點
2. 驗證多租戶隔離
3. 端到端集成測試

### 優先級 3: 完成剩餘功能
1. 實現 AuthController (登錄/登出)
2. 配置 Spring Security
3. 實現 JWT 驗證
4. 前端認證流程集成

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| v1.0 | 2026-05-12 | 初版：實現計劃階段 |

**責任人**: Development Agent  
**最後更新**: 2026-05-12

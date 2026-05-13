# FR-R RBAC API - 前端開發者快速參考

**文檔版本**: v1.0  
**最後更新**: 2026-05-12  
**狀態**: 🚀 **生產就緒**

---

## 🎯 核心 API 端點

### 用戶管理

#### 創建用戶
```bash
POST /api/v1/users?org_id=1
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "firstName": "First",
  "lastName": "Last",
  "password": "Password@123",
  "departmentId": null,
  "roleIds": [1, 2]  // ADMIN, APPROVER
}

Response 201:
{
  "code": "CREATED",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "roles": ["ADMIN", "APPROVER"],
    "permissions": [... 24+ permissions ...]
  }
}
```

#### 獲取用戶列表
```bash
GET /api/v1/users?org_id=1&search=user&department_id=1

Response 200:
{
  "code": "SUCCESS",
  "data": [
    {
      "id": 1,
      "email": "user@example.com",
      "username": "username",
      "firstName": "First",
      "lastName": "Last",
      "status": "ACTIVE",
      "roles": ["ADMIN", "APPROVER"],
      "permissions": [... permissions ...]
    }
  ]
}
```

#### 獲取單個用戶
```bash
GET /api/v1/users/{id}

Response 200:
{
  "code": "SUCCESS",
  "data": { ... }
}
```

#### 更新用戶
```bash
PUT /api/v1/users/{id}
Content-Type: application/json

{
  "username": "new_username",
  "firstName": "New",
  "lastName": "Name",
  "departmentId": 1
}
```

#### 禁用用戶
```bash
PATCH /api/v1/users/{id}/disable

Response:
{
  "code": "SUCCESS",
  "data": { "status": "DISABLED" }
}
```

#### 刪除用戶
```bash
DELETE /api/v1/users/{id}

Response 204: No Content
```

### 角色管理

#### 獲取內置角色
```bash
GET /api/v1/roles/builtin

Response 200:
{
  "code": "SUCCESS",
  "data": [
    {
      "id": 1,
      "name": "ADMIN",
      "description": "System Administrator",
      "permissions": [
        "USER_CREATE", "USER_READ", "USER_UPDATE", "USER_DELETE",
        "ROLE_CREATE", "ROLE_READ", "ROLE_UPDATE", "ROLE_DELETE",
        ... 20+ more ...
      ]
    },
    {
      "id": 2,
      "name": "APPROVER",
      "permissions": ["PR_APPROVE", "PR_READ", ...]
    },
    {
      "id": 3,
      "name": "BUYER",
      "permissions": [vendor management permissions]
    },
    {
      "id": 4,
      "name": "REQUESTER",
      "permissions": ["DASHBOARD_VIEW", "PR_CREATE", "PR_READ"]
    }
  ]
}
```

#### 獲取組織角色
```bash
GET /api/v1/roles?org_id=1
```

#### 獲取所有可用權限
```bash
GET /api/v1/roles/system/permissions

Response:
{
  "code": "SUCCESS",
  "data": [
    { "code": "USER_CREATE", "module": "RBAC", "feature": "User", ... },
    { "code": "PR_APPROVE", "module": "Procurement", "feature": "PR", ... },
    ...
  ]
}
```

### 部門管理

#### 獲取部門列表
```bash
GET /api/v1/departments?org_id=1

Response:
{
  "code": "SUCCESS",
  "data": [
    {
      "id": 1,
      "name": "Engineering",
      "code": "ENG",
      "path": "/1",
      "level": 0,
      "managerId": 1
    }
  ]
}
```

#### 獲取部門樹
```bash
GET /api/v1/departments/tree?org_id=1

Response:
{
  "code": "SUCCESS",
  "data": [
    {
      "id": 1,
      "name": "Engineering",
      "children": [
        { "id": 2, "name": "Backend Team", "children": [] }
      ]
    }
  ]
}
```

---

## 📝 TypeScript 類型定義

### UserDTO
```typescript
interface UserDTO {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  status: "ACTIVE" | "DISABLED" | "PENDING_ACTIVATION";
  organizationId: number;
  departmentId: number | null;
  departmentName: string | null;
  roles: string[];           // e.g., ["ADMIN", "APPROVER"]
  permissions: string[];     // e.g., ["USER_CREATE", "PR_APPROVE", ...]
  createdAt: string;         // ISO 8601
  updatedAt: string;         // ISO 8601
}
```

### RoleDTO
```typescript
interface RoleDTO {
  id: number;
  organizationId: number | null;  // null for builtin roles
  name: string;                   // e.g., "ADMIN"
  description: string;
  isBuiltin: boolean;
  permissions: string[];          // permission codes
  createdAt: string;
  updatedAt: string;
}
```

### DepartmentDTO
```typescript
interface DepartmentDTO {
  id: number;
  organizationId: number;
  name: string;
  code: string;
  parentId: number | null;
  managerId: number | null;
  managerName: string | null;
  path: string;                   // e.g., "/1/2/3"
  level: number;                  // depth
  createdAt: string;
  updatedAt: string;
}
```

---

## 🔐 權限檢查示例

### 檢查單個權限
```typescript
function hasPermission(user: UserDTO, permission: string): boolean {
  return user.permissions?.includes(permission) ?? false;
}

// Usage
if (hasPermission(user, 'USER_CREATE')) {
  // Show create user button
}
```

### 檢查多個權限（AND）
```typescript
function hasAllPermissions(user: UserDTO, permissions: string[]): boolean {
  return permissions.every(p => user.permissions?.includes(p) ?? false);
}

// Usage - 必須有所有權限
if (hasAllPermissions(user, ['USER_CREATE', 'USER_UPDATE'])) {
  // Show admin panel
}
```

### 檢查多個權限（OR）
```typescript
function hasAnyPermission(user: UserDTO, permissions: string[]): boolean {
  return permissions.some(p => user.permissions?.includes(p) ?? false);
}

// Usage - 至少要有其中一個權限
if (hasAnyPermission(user, ['USER_CREATE', 'ROLE_CREATE'])) {
  // Show creation options
}
```

### 檢查角色
```typescript
function hasRole(user: UserDTO, role: string): boolean {
  return user.roles?.includes(role) ?? false;
}

// Usage
if (hasRole(user, 'ADMIN')) {
  // Show admin-only features
}
```

---

## 📊 內置角色和權限

### ADMIN (Role ID: 1)
**權限**: 所有 24+ 權限
- 用戶管理: CREATE, READ, UPDATE, DELETE
- 角色管理: CREATE, READ, UPDATE, DELETE
- 部門管理: CREATE, READ, UPDATE, DELETE
- 儀表板: VIEW, EXPORT
- 採購單: CREATE, READ, APPROVE, DELETE
- 供應商: CREATE, READ, UPDATE, DELETE

### APPROVER (Role ID: 2)
**權限**:
- `PR_READ` - 查看採購單
- `PR_APPROVE` - 批准採購單
- `VENDOR_READ` - 查看供應商
- `DASHBOARD_VIEW` - 查看儀表板

### BUYER (Role ID: 3)
**權限**:
- `PR_CREATE` - 創建採購單
- `PR_READ` - 查看採購單
- `PR_UPDATE` - 編輯採購單
- `VENDOR_CREATE` - 創建供應商
- `VENDOR_READ` - 查看供應商
- `VENDOR_UPDATE` - 編輯供應商
- `DASHBOARD_VIEW` - 查看儀表板

### REQUESTER (Role ID: 4)
**權限**:
- `DASHBOARD_VIEW` - 查看儀表板
- `PR_CREATE` - 創建採購單
- `PR_READ` - 查看採購單

---

## 🔄 響應格式

### 成功響應 (200/201)
```json
{
  "code": "SUCCESS|CREATED|NO_CONTENT",
  "data": { /* actual data */ }
}
```

### 錯誤響應 (4xx/5xx)
```json
{
  "code": "BAD_REQUEST|UNAUTHORIZED|FORBIDDEN|NOT_FOUND|INTERNAL_ERROR",
  "message": "Error description"
}
```

### HTTP 狀態碼
- `201 Created` - 資源創建成功
- `200 OK` - 成功
- `204 No Content` - 刪除成功
- `400 Bad Request` - 驗證失敗
- `401 Unauthorized` - 未認證
- `403 Forbidden` - 權限不足
- `404 Not Found` - 資源不存在
- `500 Internal Error` - 伺服器錯誤

---

## 🚀 React 組件示例

### 顯示用戶列表
```typescript
import { useState, useEffect } from 'react';
import { userService } from '@/services/userService';
import type { UserDTO } from '@/types';

export function UserList() {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await userService.getUsers({ org_id: 1 });
        setUsers(response.data);
      } catch (error) {
        console.error('Failed to fetch users', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <table>
      <thead>
        <tr>
          <th>Email</th>
          <th>Name</th>
          <th>Roles</th>
          <th>Permissions</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user.id}>
            <td>{user.email}</td>
            <td>{user.firstName} {user.lastName}</td>
            <td>{user.roles?.join(', ') || '-'}</td>
            <td>{user.permissions?.length || 0} permissions</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### 條件渲染根據權限
```typescript
export function FeatureButton({ user }: { user: UserDTO }) {
  const canCreateUser = user.permissions?.includes('USER_CREATE') ?? false;
  const canApprove = user.permissions?.includes('PR_APPROVE') ?? false;

  return (
    <div>
      {canCreateUser && (
        <button onClick={() => openCreateUserDialog()}>Create User</button>
      )}
      {canApprove && (
        <button onClick={() => showApprovalQueue()}>Approve PRs</button>
      )}
      {!canCreateUser && !canApprove && (
        <p>You don't have permission to perform any actions.</p>
      )}
    </div>
  );
}
```

---

## 📞 常見問題

### Q: 如何知道一個用戶有哪些權限？
A: 在 UserDTO 的 `permissions` 陣列中查看。這是該用戶所有角色的合併權限。

### Q: 權限是否會自動更新？
A: 目前需要重新查詢用戶 API 以獲取最新權限。未來版本可能支持實時更新。

### Q: 能否給一個用戶分配多個角色？
A: 可以！創建用戶時傳遞 `roleIds: [1, 2, 3]` 來分配多個角色。

### Q: 組織隔離是強制的嗎？
A: 是的。所有查詢都需要提供 `org_id` 參數，數據庫層會強制執行隔離。

### Q: 如何創建自定義角色？
A: 使用 RoleService - `createRole(organizationId, name, description)`

---

## 🔗 相關文檔

- [完整 API 文檔] - Swagger UI at /swagger-ui.html
- [集成測試報告] - docs/testing/INTEGRATION-TEST-FR-R-v1.md
- [最終驗收報告] - docs/testing/FINAL-ACCEPTANCE-FR-R-v1.md
- [代碼記錄] - docs/implementation/code-records/CODE-FR-R-RBAC-v1.md

---

**快速開始**: 複製上面的示例代碼到你的 React 組件中，就可以立即開始使用 RBAC API！

🎉 **祝開發愉快！**

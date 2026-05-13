import { axiosInstance as api } from './api';

export interface Role {
  id: number;
  organizationId?: number;
  name: string;
  description?: string;
  isBuiltin: boolean;
  permissions: string[];
  permissionCodes?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: number;
  code: string;
  module: string;
  feature: string;
  description?: string;
  dataLevel: string;
  operation: string;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  organizationId: number;
}

export const roleService = {
  /**
   * Get all builtin roles
   */
  getBuiltinRoles() {
    return api.get<{ code: string; data: Role[] }>('/roles/builtin');
  },

  /**
   * Get roles for organization
   */
  getRoles(params: { org_id: number }) {
    return api.get<{ code: string; data: Role[] }>('/roles', { params });
  },

  /**
   * Get role by ID
   */
  getRoleById(id: number) {
    return api.get<{ code: string; data: Role }>(`/roles/${id}`);
  },

  /**
   * Create role
   */
  createRole(request: CreateRoleRequest) {
    return api.post<{ code: string; data: Role }>('/roles', request);
  },

  /**
   * Delete role
   */
  deleteRole(roleId: number) {
    return api.delete<{ code: string }>(`/roles/${roleId}`);
  },

  /**
   * Get permissions for role
   */
  getRolePermissions(roleId: number) {
    return api.get<{ code: string; data: Permission[] }>(`/roles/${roleId}/permissions`);
  },

  /**
   * Assign permissions to role
   */
  assignPermissions(roleId: number, permissionCodes: string[]) {
    return api.post<{ code: string }>(`/roles/${roleId}/permissions`, { permissionCodes });
  },

  /**
   * Get all permissions
   */
  getPermissions() {
    return api.get<{ code: string; data: Permission[] }>('/permissions');
  },
};

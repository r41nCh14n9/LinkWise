import { axiosInstance as api } from './api';

export interface Permission {
  id: number;
  code: string;
  module: string;
  feature: string;
  description?: string;
  dataLevel: string;
  operation: string;
  createdAt: string;
  updatedAt: string;
}

export const permissionService = {
  /**
   * Get all permissions
   */
  getPermissions() {
    return api.get<{ code: string; data: Permission[] }>('/permissions');
  },

  /**
   * Get permission by ID
   */
  getPermissionById(id: number) {
    return api.get<{ code: string; data: Permission }>(`/permissions/${id}`);
  },

  /**
   * Get permissions by module
   */
  getPermissionsByModule(module: string) {
    return api.get<{ code: string; data: Permission[] }>('/permissions', {
      params: { module },
    });
  },
};

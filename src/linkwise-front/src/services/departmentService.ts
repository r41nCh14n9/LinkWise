import { axiosInstance as api } from './api';

export interface Department {
  id: number;
  organizationId: number;
  name: string;
  code: string;
  parentId?: number;
  managerId?: number;
  managerName?: string;
  path?: string;
  level: number;
  createdAt: string;
  updatedAt: string;
}

export const departmentService = {
  /**
   * Get all departments
   */
  getAllDepartments(organizationId: number) {
    return api.get<{ code: string; data: Department[] }>('/departments', {
      params: { org_id: organizationId },
    });
  },

  /**
   * Get department tree
   */
  getDepartmentTree(organizationId: number) {
    return api.get<{ code: string; data: Department[] }>('/departments/tree', {
      params: { org_id: organizationId },
    });
  },

  /**
   * Get department by ID
   */
  getDepartmentById(id: number, organizationId: number) {
    return api.get<{ code: string; data: Department }>(`/departments/${id}`, {
      params: { org_id: organizationId },
    });
  },

  /**
   * Create department
   */
  createDepartment(
    organizationId: number,
    name: string,
    code: string,
    parentId?: number,
    managerId?: number
  ) {
    return api.post<{ code: string; data: Department }>('/departments', {
      org_id: organizationId,
      name,
      code,
      parent_id: parentId,
      manager_id: managerId,
    });
  },

  /**
   * Update department
   */
  updateDepartment(
    id: number,
    name: string,
    code: string,
    managerId?: number
  ) {
    return api.put<{ code: string; data: Department }>(`/departments/${id}`, {
      name,
      code,
      manager_id: managerId,
    });
  },

  /**
   * Delete department
   */
  deleteDepartment(id: number) {
    return api.delete<{ code: string }>(`/departments/${id}`);
  },
};

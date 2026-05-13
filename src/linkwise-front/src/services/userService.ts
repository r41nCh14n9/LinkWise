import { axiosInstance as api } from './api';

export interface User {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  status: string;
  organizationId: number;
  departmentId?: number;
  roleIds?: number[];
  createdAt: string;
  updatedAt: string;
}

export interface UserSearchParams {
  org_id: number;
  department_id?: number;
  search?: string;
}

export interface CreateUserRequest {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  status: 'ACTIVE' | 'DISABLED' | 'PENDING_ACTIVATION';
  organizationId: number;
  departmentId?: number;
  roleIds?: number[];
}

export const userService = {
  /**
   * Get all users in organization
   */
  getUsers(params: UserSearchParams) {
    return api.get<{ code: string; data: User[] }>('/users', { params });
  },

  /**
   * Get user by ID
   */
  getUserById(id: number) {
    return api.get<{ code: string; data: User }>(`/users/${id}`);
  },

  /**
   * Create user
   */
  createUser(request: CreateUserRequest) {
    return api.post<{ code: string; data: User }>('/users', request);
  },

  /**
   * Update user
   */
  updateUser(id: number, data: Partial<User>) {
    return api.put<{ code: string; data: User }>(`/users/${id}`, data);
  },

  /**
   * Assign roles to user
   */
  assignRoles(userId: number, roleIds: number[]) {
    return api.post<{ code: string }>(`/users/${userId}/roles`, { roleIds });
  },

  /**
   * Disable user
   */
  disableUser(id: number) {
    return api.patch<{ code: string; data: User }>(`/users/${id}/disable`);
  },

  /**
   * Delete user
   */
  deleteUser(id: number) {
    return api.delete<{ code: string }>(`/users/${id}`);
  },
};

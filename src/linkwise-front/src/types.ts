/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'ADMIN' | 'BUYER' | 'APPROVER' | 'REQUESTER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  contactPerson: string;
  email: string;
  status: 'ACTIVE' | 'ONBOARDING' | 'BLACKLISTED' | 'INACTIVE';
  rating: number;
}

export type DocumentStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'CONVERTED_TO_PO' | 'COMPLETED';

export interface PurchaseRequest {
  id: string;
  title: string;
  requesterId: string;
  department: string;
  totalAmount: number;
  currency: string;
  status: DocumentStatus;
  createdAt: string;
  items: PurchaseItem[];
}

export interface PurchaseItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface PurchaseOrder extends PurchaseRequest {
  vendorId: string;
  poNumber: string;
  issueDate: string;
}

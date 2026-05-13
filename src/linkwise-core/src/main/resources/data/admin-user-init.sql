-- Admin User Initialization Script
-- Updated with new role structure: Admin, User, Supervisor, Agent, AP
-- Password: AdminPass@2024 (hashed with BCrypt, cost factor 10)
-- All users share the same password for demo purposes

-- Insert default organization if not exists
INSERT INTO organizations (id, name, description, active, created_at, updated_at) 
VALUES (1, 'Default Organization', 'Default organization for development', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ========== ADMIN ROLE ==========
-- Admin User (系统管理员)
INSERT INTO users (id, email, username, password, first_name, last_name, status, organization_id, department_id, active, created_at, updated_at)
VALUES (
  1,
  'admin@linkwise.com',
  'admin',
  '$2a$10$3VwuA7EJ5F8cL2N9M4K7UuH6QpZ1BxW2CvR8TsD3FgE9LpM0JqY3u',
  'System',
  'Administrator',
  'ACTIVE',
  1,
  NULL,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email, organization_id) DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT 1, 1
WHERE NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = 1 AND role_id = 1);

-- ========== USER ROLE ==========
-- General User (一般用户 - 需求申请者 + 验收者)
INSERT INTO users (id, email, username, password, first_name, last_name, status, organization_id, department_id, active, created_at, updated_at)
VALUES (
  2,
  'user@linkwise.com',
  'user',
  '$2a$10$3VwuA7EJ5F8cL2N9M4K7UuH6QpZ1BxW2CvR8TsD3FgE9LpM0JqY3u',
  'John',
  'User',
  'ACTIVE',
  1,
  NULL,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email, organization_id) DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT 2, 3
WHERE NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = 2 AND role_id = 3);

-- ========== SUPERVISOR ROLE ==========
-- Supervisor (部门主管)
INSERT INTO users (id, email, username, password, first_name, last_name, status, organization_id, department_id, active, created_at, updated_at)
VALUES (
  3,
  'supervisor@linkwise.com',
  'supervisor',
  '$2a$10$3VwuA7EJ5F8cL2N9M4K7UuH6QpZ1BxW2CvR8TsD3FgE9LpM0JqY3u',
  'Manager',
  'Supervisor',
  'ACTIVE',
  1,
  NULL,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email, organization_id) DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT 3, 4
WHERE NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = 3 AND role_id = 4);

-- ========== AGENT ROLE ==========
-- Purchasing Agent (采购专员)
INSERT INTO users (id, email, username, password, first_name, last_name, status, organization_id, department_id, active, created_at, updated_at)
VALUES (
  4,
  'agent@linkwise.com',
  'agent',
  '$2a$10$3VwuA7EJ5F8cL2N9M4K7UuH6QpZ1BxW2CvR8TsD3FgE9LpM0JqY3u',
  'Peter',
  'Agent',
  'ACTIVE',
  1,
  NULL,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email, organization_id) DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT 4, 5
WHERE NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = 4 AND role_id = 5);

-- ========== AP ROLE ==========
-- Accounts Payable (财务会计)
INSERT INTO users (id, email, username, password, first_name, last_name, status, organization_id, department_id, active, created_at, updated_at)
VALUES (
  5,
  'ap@linkwise.com',
  'ap',
  '$2a$10$3VwuA7EJ5F8cL2N9M4K7UuH6QpZ1BxW2CvR8TsD3FgE9LpM0JqY3u',
  'Alice',
  'Finance',
  'ACTIVE',
  1,
  NULL,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email, organization_id) DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT 5, 6
WHERE NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = 5 AND role_id = 6);

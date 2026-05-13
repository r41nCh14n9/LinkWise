-- Admin User Initialization Script
-- This script creates a default admin user for development/staging environments
-- Default Admin Credentials:
--   Email: admin@linkwise.com
--   Username: admin
--   Password: AdminPass@2024 (hashed with BCrypt)
--   Role: ADMIN (all permissions)
--   Organization: 1 (default org)

-- Note: The password hash below is for "AdminPass@2024"
-- Generated via BCrypt with cost factor 10
-- To generate new hash: https://bcrypt-generator.com/ or use Spring's BCryptPasswordEncoder

-- Insert default organization if not exists
INSERT INTO organizations (id, name, description, active, created_at, updated_at) 
VALUES (1, 'Default Organization', 'Default organization for development', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert admin user if not exists
INSERT INTO users (id, email, username, password, first_name, last_name, status, organization_id, department_id, active, created_at, updated_at)
VALUES (
  1,
  'admin@linkwise.com',
  'admin',
  '$2a$10$3VwuA7EJ5F8cL2N9M4K7UuH6QpZ1BxW2CvR8TsD3FgE9LpM0JqY3u', -- AdminPass@2024
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

-- Assign ADMIN role to the admin user
INSERT INTO user_role_assignments (user_id, role_id, created_at)
VALUES (1, 1, NOW())
ON CONFLICT DO NOTHING;

-- Optional: Create demo accounts for testing different roles
-- Demo APPROVER
INSERT INTO users (id, email, username, password, first_name, last_name, status, organization_id, department_id, active, created_at, updated_at)
VALUES (
  2,
  'approver@linkwise.com',
  'approver',
  '$2a$10$3VwuA7EJ5F8cL2N9M4K7UuH6QpZ1BxW2CvR8TsD3FgE9LpM0JqY3u', -- AdminPass@2024
  'Finance',
  'Approver',
  'ACTIVE',
  1,
  NULL,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email, organization_id) DO NOTHING;

INSERT INTO user_role_assignments (user_id, role_id, created_at)
VALUES (2, 2, NOW())
ON CONFLICT DO NOTHING;

-- Demo BUYER
INSERT INTO users (id, email, username, password, first_name, last_name, status, organization_id, department_id, active, created_at, updated_at)
VALUES (
  3,
  'buyer@linkwise.com',
  'buyer',
  '$2a$10$3VwuA7EJ5F8cL2N9M4K7UuH6QpZ1BxW2CvR8TsD3FgE9LpM0JqY3u', -- AdminPass@2024
  'Procurement',
  'Buyer',
  'ACTIVE',
  1,
  NULL,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email, organization_id) DO NOTHING;

INSERT INTO user_role_assignments (user_id, role_id, created_at)
VALUES (3, 3, NOW())
ON CONFLICT DO NOTHING;

-- Demo REQUESTER
INSERT INTO users (id, email, username, password, first_name, last_name, status, organization_id, department_id, active, created_at, updated_at)
VALUES (
  4,
  'requester@linkwise.com',
  'requester',
  '$2a$10$3VwuA7EJ5F8cL2N9M4K7UuH6QpZ1BxW2CvR8TsD3FgE9LpM0JqY3u', -- AdminPass@2024
  'Operations',
  'Requester',
  'ACTIVE',
  1,
  NULL,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email, organization_id) DO NOTHING;

INSERT INTO user_role_assignments (user_id, role_id, created_at)
VALUES (4, 4, NOW())
ON CONFLICT DO NOTHING;

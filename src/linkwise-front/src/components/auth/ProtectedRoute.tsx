import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoginPage } from '@/components/auth/LoginPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requiredRole,
}) => {
  const { user } = useAuth();

  // Not logged in
  if (!user) {
    return <LoginPage />;
  }

  // Check required permission
  if (requiredPermission && !user.permissions?.includes(requiredPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">
            You don't have the required permission: <code className="bg-gray-200 px-2 py-1 rounded">{requiredPermission}</code>
          </p>
        </div>
      </div>
    );
  }

  // Check required role
  if (requiredRole && !user.roles?.includes(requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">
            You don't have the required role: <code className="bg-gray-200 px-2 py-1 rounded">{requiredRole}</code>
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

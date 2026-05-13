import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  LogOut, 
  Menu, 
  X, 
  LayoutDashboard, 
  Users, 
  Store, 
  FileText,
  ChevronDown,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import UserManagementPage from '@/components/user/UserManagementPage';
import RoleManagementPage from '@/components/role/RoleManagementPage';

type View = 'dashboard' | 'vms' | 'prpo' | 'users' | 'roles';

export const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isUserMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const navigationItems = [
    { id: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'vms' as View, label: 'Vendor Mgmt', icon: Store },
    { id: 'prpo' as View, label: 'Procurement', icon: FileText },
    { id: 'users' as View, label: 'User Management', icon: Users },
    { id: 'roles' as View, label: 'Role Management', icon: Shield },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        className="bg-white border-r border-gray-200 flex flex-col z-20 transition-all"
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200 flex-shrink-0">
          <div className="bg-blue-600 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield className="text-white w-5 h-5" />
          </div>
          {isSidebarOpen && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="ml-3 font-bold text-lg text-gray-900"
            >
              LinkWise
            </motion.span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-2">
          {navigationItems.map((item) => {
            const isActive = activeView === item.id;
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {isSidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="p-3 border-t border-gray-200">
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!isUserMenuOpen)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </div>
              {isSidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 text-left min-w-0"
                >
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {user?.roles?.[0] || 'User'}
                  </div>
                </motion.div>
              )}
              {isSidebarOpen && (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {/* User Menu Dropdown */}
            <AnimatePresence>
              {isUserMenuOpen && isSidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute bottom-full left-0 right-0 mb-1 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-10"
                >
                  <div className="p-3 border-b border-gray-100">
                    <p className="text-xs font-medium text-gray-500 mb-2">SIGNED IN AS</p>
                    <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 transition-all text-sm font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10">
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isSidebarOpen ? (
              <X className="w-5 h-5 text-gray-600" />
            ) : (
              <Menu className="w-5 h-5 text-gray-600" />
            )}
          </button>

          <div className="flex items-center gap-4">
            <div className="text-sm">
              <p className="text-gray-600">Organization ID:</p>
              <p className="font-medium text-gray-900">{user?.organizationId}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">User Permissions:</p>
              <p className="text-sm font-medium text-gray-900">{user?.permissions?.length || 0} permissions</p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {activeView === 'dashboard' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-2">Dashboard content coming soon...</p>
              </div>
            )}

            {activeView === 'vms' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold text-gray-900">Vendor Management</h1>
                <p className="text-gray-600 mt-2">Vendor management content coming soon...</p>
              </div>
            )}

            {activeView === 'prpo' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold text-gray-900">Procurement</h1>
                <p className="text-gray-600 mt-2">Procurement content coming soon...</p>
              </div>
            )}

            {activeView === 'users' && (
              <UserManagementPage />
            )}

            {activeView === 'roles' && (
              <RoleManagementPage />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { roleService, Role } from '@/services/roleService';
import { permissionService, Permission } from '@/services/permissionService';
import { Search, Plus, Trash2, Lock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RoleFormData {
  name: string;
  description: string;
}

interface PermissionGroup {
  module: string;
  permissions: Permission[];
}

/**
 * Role Management Page
 * Allows admins to manage roles and assign permissions
 */
const RoleManagementPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [formData, setFormData] = useState<RoleFormData>({
    name: '',
    description: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (currentUser?.organizationId) {
        const rolesRes = await roleService.getRoles({ org_id: currentUser.organizationId });
        
        if (rolesRes.data.code === 'SUCCESS') {
          setRoles(rolesRes.data.data);
        }

        // Extract permissions from all roles for the permission assignment modal
        const allPermissions: { [key: string]: Permission } = {};
        rolesRes.data.data.forEach((role: any) => {
          if (role.permissions && Array.isArray(role.permissions)) {
            role.permissions.forEach((perm: string) => {
              if (!allPermissions[perm]) {
                allPermissions[perm] = {
                  id: Object.keys(allPermissions).length + 1,
                  code: perm,
                  module: perm.split('_')[0],
                  feature: perm,
                  description: perm,
                  dataLevel: 'ALL',
                  operation: 'ALL',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };
              }
            });
          }
        });
        setPermissions(Object.values(allPermissions));
      }
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const groupPermissionsByModule = (): PermissionGroup[] => {
    const groups: { [key: string]: Permission[] } = {};
    
    permissions.forEach((perm) => {
      const module = perm.module || 'Other';
      if (!groups[module]) {
        groups[module] = [];
      }
      groups[module].push(perm);
    });

    return Object.entries(groups).map(([module, perms]) => ({
      module,
      permissions: perms.sort((a, b) => (a.code || '').localeCompare(b.code || '')),
    }));
  };

  const filteredRoles = roles.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenPermissionModal = (role: Role) => {
    setSelectedRole(role);
    setSelectedPermissions(role.permissionCodes || []);
    setShowPermissionModal(true);
  };

  const handleAssignPermissions = async () => {
    if (!selectedRole) return;
    try {
      await roleService.assignPermissions(selectedRole.id, selectedPermissions);
      await fetchData();
      setShowPermissionModal(false);
    } catch (err) {
      setError('Failed to assign permissions');
    }
  };

  const handleDeleteRole = async (roleId: number) => {
    try {
      await roleService.deleteRole(roleId);
      await fetchData();
    } catch (err) {
      setError('Failed to delete role');
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await roleService.createRole({
        ...formData,
        organizationId: currentUser?.organizationId || 1,
      });
      setShowCreateModal(false);
      setFormData({
        name: '',
        description: '',
      });
      await fetchData();
    } catch (err) {
      setError('Failed to create role');
    }
  };

  const permissionGroups = groupPermissionsByModule();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Role Management</h1>
        <p className="text-gray-600">Manage roles and assign permissions</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Search and Actions */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search roles by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Role
        </button>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="mt-2 text-gray-600">Loading roles...</p>
          </div>
        ) : filteredRoles.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Lock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No roles found</p>
          </div>
        ) : (
          filteredRoles.map((role) => (
            <div key={role.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{role.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{role.description}</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-xs text-gray-500 mb-2">Permissions:</div>
                <div className="flex flex-wrap gap-1">
                  {role.permissionCodes && role.permissionCodes.length > 0 ? (
                    role.permissionCodes.slice(0, 3).map((code) => (
                      <span key={code} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                        {code}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 text-xs">No permissions</span>
                  )}
                  {role.permissionCodes && role.permissionCodes.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      +{role.permissionCodes.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenPermissionModal(role)}
                  className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                >
                  Assign Permissions
                </button>
                <button
                  onClick={() => handleDeleteRole(role.id)}
                  className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Role Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New Role</h2>
              <form onSubmit={handleCreateRole} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Permission Assignment Modal */}
      <AnimatePresence>
        {showPermissionModal && selectedRole && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
            onClick={() => setShowPermissionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-2 sticky top-0 bg-white">Assign Permissions</h2>
              <p className="text-gray-600 text-sm mb-4 sticky top-10 bg-white">Role: {selectedRole.name}</p>
              
              <div className="space-y-4 mb-4">
                {permissionGroups.map((group) => (
                  <div key={group.module} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">{group.module}</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {group.permissions.map((perm) => (
                        <label key={perm.code} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedPermissions.includes(perm.code)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPermissions([...selectedPermissions, perm.code]);
                              } else {
                                setSelectedPermissions(selectedPermissions.filter(code => code !== perm.code));
                              }
                            }}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span className="text-sm text-gray-700">{perm.code}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 sticky bottom-0 bg-white pt-4 border-t">
                <button
                  onClick={() => setShowPermissionModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignPermissions}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Assign Permissions
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoleManagementPage;

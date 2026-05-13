import React, { useEffect, useState } from 'react';
import { userService, User, UserSearchParams } from '@/services/userService';

/**
 * User List Page
 * Displays list of users with search, filter, and batch operations
 */
export const UserListPage: React.FC<{ organizationId: number }> = ({ organizationId }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchUsers();
  }, [organizationId]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: UserSearchParams = {
        org_id: organizationId,
      };
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      const response = await userService.getUsers(params);
      if (response.data.code === 'SUCCESS') {
        setUsers(response.data.data);
      }
    } catch (err) {
      setError('Failed to fetch users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleSelectUser = (userId: number, selected: boolean) => {
    const newSelected = new Set(selectedUsers);
    if (selected) {
      newSelected.add(userId);
    } else {
      newSelected.delete(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedUsers(new Set(users.map(u => u.id)));
    } else {
      setSelectedUsers(new Set());
    }
  };

  const handleDisableUser = async (userId: number) => {
    try {
      await userService.disableUser(userId);
      fetchUsers();
    } catch (err) {
      setError('Failed to disable user');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.deleteUser(userId);
        fetchUsers();
      } catch (err) {
        setError('Failed to delete user');
      }
    }
  };

  return (
    <div className="user-list-container">
      <h1>User Management</h1>
      
      {error && <div className="error-alert">{error}</div>}
      
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by email..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <button onClick={fetchUsers}>Search</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedUsers.size === users.length && users.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
              <th>Email</th>
              <th>Username</th>
              <th>Name</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6}>Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6}>No users found</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user.id)}
                      onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                    />
                  </td>
                  <td>{user.email}</td>
                  <td>{user.username}</td>
                  <td>{`${user.firstName} ${user.lastName}`}</td>
                  <td>{user.status}</td>
                  <td>
                    <button onClick={() => handleDisableUser(user.id)}>Disable</button>
                    <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="actions-bar">
        <button 
          disabled={selectedUsers.size === 0}
          onClick={() => {
            // Batch disable implementation
            console.log('Batch disable:', Array.from(selectedUsers));
          }}
        >
          Batch Disable ({selectedUsers.size})
        </button>
      </div>

      <style>{`
        .user-list-container {
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        
        .search-bar {
          margin-bottom: 20px;
        }
        
        .search-bar input {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin-right: 10px;
          width: 300px;
        }
        
        .search-bar button {
          padding: 8px 16px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .table-container {
          margin-bottom: 20px;
          border: 1px solid #ddd;
          border-radius: 4px;
          overflow: hidden;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
        }
        
        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        
        th {
          background-color: #f5f5f5;
          font-weight: bold;
        }
        
        tr:hover {
          background-color: #f9f9f9;
        }
        
        button {
          padding: 6px 12px;
          margin-right: 8px;
          background-color: #dc3545;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        button:hover {
          background-color: #c82333;
        }
        
        button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
        
        .error-alert {
          padding: 12px;
          background-color: #f8d7da;
          color: #721c24;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        
        .actions-bar {
          margin-top: 20px;
        }
      `}</style>
    </div>
  );
};

export default UserListPage;

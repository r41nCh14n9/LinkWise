import React, { useEffect, useState } from 'react';
import { departmentService, Department } from '../services/departmentService';

/**
 * Department Tree Page
 * Displays organizational structure in tree format
 */
export const DepartmentTreePage: React.FC<{ organizationId: number }> = ({ organizationId }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchDepartments();
  }, [organizationId]);

  const fetchDepartments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await departmentService.getDepartmentTree(organizationId);
      if (response.data.code === 'SUCCESS') {
        setDepartments(response.data.data);
      }
    } catch (err) {
      setError('Failed to fetch departments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (deptId: number) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(deptId)) {
      newExpanded.delete(deptId);
    } else {
      newExpanded.add(deptId);
    }
    setExpandedNodes(newExpanded);
  };

  const renderTreeNode = (dept: Department, level: number = 0) => {
    const isExpanded = expandedNodes.has(dept.id);
    const hasChildren = false; // TODO: Check if department has children
    
    return (
      <div key={dept.id} style={{ marginLeft: `${level * 20}px` }} className="tree-node">
        <div className="tree-node-content">
          {hasChildren && (
            <button onClick={() => toggleExpand(dept.id)} className="expand-button">
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          <span className="dept-name">{dept.name}</span>
          <span className="dept-code">({dept.code})</span>
        </div>
        {isExpanded && (
          <div className="children">
            {/* Children nodes would be rendered here */}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="department-tree-container">
      <h1>Organization Structure</h1>
      
      {error && <div className="error-alert">{error}</div>}
      
      <div className="tree-container">
        {loading ? (
          <div>Loading...</div>
        ) : departments.length === 0 ? (
          <div>No departments found</div>
        ) : (
          departments.map((dept) => renderTreeNode(dept))
        )}
      </div>

      <style>{`
        .department-tree-container {
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        
        .tree-container {
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 15px;
          background-color: #fafafa;
        }
        
        .tree-node {
          margin: 5px 0;
        }
        
        .tree-node-content {
          display: flex;
          align-items: center;
          padding: 8px;
          border-radius: 4px;
        }
        
        .tree-node-content:hover {
          background-color: #f0f0f0;
        }
        
        .expand-button {
          background: none;
          border: none;
          cursor: pointer;
          margin-right: 8px;
          padding: 0;
          width: 20px;
        }
        
        .dept-name {
          font-weight: bold;
          margin-right: 10px;
        }
        
        .dept-code {
          color: #666;
          font-size: 0.9em;
        }
        
        .children {
          margin-left: 10px;
        }
        
        .error-alert {
          padding: 12px;
          background-color: #f8d7da;
          color: #721c24;
          border-radius: 4px;
          margin-bottom: 20px;
        }
      `}</style>
    </div>
  );
};

export default DepartmentTreePage;

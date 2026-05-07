/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Store, 
  FileText, 
  Plus, 
  ChevronRight, 
  Search, 
  Bell, 
  Settings, 
  ShieldCheck, 
  TrendingUp,
  Package,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Vendor, PurchaseRequest, UserRole, DocumentStatus } from './types.ts';

// Mock Data
const MOCK_USERS: User[] = [
  { id: '1', name: 'Alex Chen', email: 'alex@procure.hub', role: 'ADMIN', department: 'Operations' },
  { id: '2', name: 'Sarah Wu', email: 'sarah@procure.hub', role: 'BUYER', department: 'Procurement' },
  { id: '3', name: 'David Lin', email: 'david@procure.hub', role: 'APPROVER', department: 'Finance' },
  { id: '4', name: 'Emily Wong', email: 'emily@procure.hub', role: 'REQUESTER', department: 'Marketing' },
];

const MOCK_VENDORS: Vendor[] = [
  { id: 'V1', name: 'TechSolutions Inc.', category: 'Hardware', contactPerson: 'John Smith', email: 'sales@techsol.com', status: 'ACTIVE', rating: 4.8 },
  { id: 'V2', name: 'Global LogisticsCo', category: 'Services', contactPerson: 'Maria Garcia', email: 'ops@globallog.com', status: 'ACTIVE', rating: 4.5 },
  { id: 'V3', name: 'Prime Office Supplies', category: 'Stationery', contactPerson: 'Robert Brown', email: 'orders@primeoffice.com', status: 'ONBOARDING', rating: 0 },
  { id: 'V4', name: 'Elite Security Systems', category: 'Security', contactPerson: 'Kevin Lee', email: 'kevin@elitesec.com', status: 'BLACKLISTED', rating: 3.2 },
];

const MOCK_PRs: PurchaseRequest[] = [
  { 
    id: 'PR-2024-001', 
    title: 'New MacBooks for Design Team', 
    requesterId: '4', 
    department: 'Marketing', 
    totalAmount: 12500, 
    currency: 'USD', 
    status: 'PENDING_APPROVAL', 
    createdAt: '2024-05-01',
    items: [] 
  },
  { 
    id: 'PR-2024-002', 
    title: 'Q3 Office Refreshment', 
    requesterId: '4', 
    department: 'Marketing', 
    totalAmount: 1500, 
    currency: 'USD', 
    status: 'APPROVED', 
    createdAt: '2024-05-03',
    items: [] 
  },
  { 
    id: 'PR-2024-003', 
    title: 'Cloud Service Subscription', 
    requesterId: '2', 
    department: 'Procurement', 
    totalAmount: 45000, 
    currency: 'USD', 
    status: 'COMPLETED', 
    createdAt: '2024-04-15',
    items: [] 
  },
];

type View = 'dashboard' | 'rbac' | 'vms' | 'prpo';

export default function App() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [prs, setPrs] = useState<PurchaseRequest[]>(MOCK_PRs);
  const [isCreatePanelOpen, setCreatePanelOpen] = useState(false);

  const handleAddPR = (newPR: PurchaseRequest) => {
    setPrs([newPR, ...prs]);
    setCreatePanelOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        className="bg-white border-r border-slate-200 flex flex-col z-20"
      >
        <div className="h-16 flex items-center px-6 border-bottom border-slate-100 flex-shrink-0">
          <div className="bg-indigo-600 w-8 h-8 rounded flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="text-white w-5 h-5" />
          </div>
          {isSidebarOpen && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="ml-3 font-bold text-xl tracking-tight text-indigo-900"
            >
              LinkWise
            </motion.span>
          )}
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            active={activeView === 'dashboard'} 
            collapsed={!isSidebarOpen}
            onClick={() => setActiveView('dashboard')} 
          />
          <NavItem 
            icon={<Users size={20} />} 
            label="User & Roles" 
            active={activeView === 'rbac'} 
            collapsed={!isSidebarOpen}
            onClick={() => setActiveView('rbac')} 
          />
          <NavItem 
            icon={<Store size={20} />} 
            label="Suppliers" 
            active={activeView === 'vms'} 
            collapsed={!isSidebarOpen}
            onClick={() => setActiveView('vms')} 
          />
          <NavItem 
            icon={<FileText size={20} />} 
            label="PR / PO" 
            active={activeView === 'prpo'} 
            collapsed={!isSidebarOpen}
            onClick={() => setActiveView('prpo')} 
          />
        </nav>

        <div className="p-4 border-t border-slate-100 italic font-mono text-[10px] text-slate-400">
          {isSidebarOpen ? 'V1.0.4-STABLE' : 'V1.0'}
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors"
            >
              <ChevronRight className={isSidebarOpen ? "rotate-180 transition-transform" : "transition-transform"} />
            </button>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-indigo-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search orders, vendors..." 
                className="pl-10 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:border-indigo-300 rounded-lg outline-none w-64 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Bell className="text-slate-500 hover:text-indigo-600 cursor-pointer" size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </div>
            <div className="flex items-center gap-3 border-l border-slate-200 pl-6 cursor-pointer group">
              <div className="text-right">
                <p className="text-sm font-semibold group-hover:text-indigo-600 transition-colors">Alex Chen</p>
                <p className="text-[10px] font-mono uppercase text-slate-500">Administrator</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold border-2 border-transparent group-hover:border-indigo-200 transition-all">
                AC
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            {activeView === 'dashboard' && <DashboardView key="dashboard" prs={prs} onCreateClick={() => setCreatePanelOpen(true)} />}
            {activeView === 'rbac' && <RBACView key="rbac" />}
            {activeView === 'vms' && <VMSView key="vms" />}
            {activeView === 'prpo' && <PRPOView key="prpo" prs={prs} onCreateClick={() => setCreatePanelOpen(true)} />}
          </AnimatePresence>
        </div>

        {/* Create PR Slide-over Panel */}
        <AnimatePresence>
          {isCreatePanelOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setCreatePanelOpen(false)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] z-30"
              />
              <CreatePRPanel 
                onClose={() => setCreatePanelOpen(false)} 
                onSubmit={handleAddPR}
              />
            </>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, collapsed, onClick }: { icon: React.ReactNode, label: string, active: boolean, collapsed: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
        active 
          ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <div className={`${active ? 'text-indigo-600' : 'text-slate-400'}`}>{icon}</div>
      {!collapsed && <span className="font-medium text-sm">{label}</span>}
      {active && !collapsed && <div className="ml-auto w-1.5 h-1.5 bg-indigo-600 rounded-full" />}
    </button>
  );
}

// Views
function DashboardView({ prs, onCreateClick }: { prs: PurchaseRequest[], onCreateClick: () => void, key?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Enterprise Overview</h1>
          <p className="text-slate-500 text-sm">Real-time procurement health and supplier matrix.</p>
        </div>
        <button 
          onClick={onCreateClick}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-100"
        >
          <Plus size={18} />
          Create PR
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Spending" value="$1.2M" subValue="+12% vs last month" icon={<TrendingUp className="text-emerald-500" />} />
        <StatCard title="Active Vendors" value="48" subValue="3 onboarding" icon={<Building2 className="text-indigo-500" />} />
        <StatCard title="Pending PRs" value={prs.filter(p => p.status === 'PENDING_APPROVAL').length.toString()} subValue="Avg. 2.4 days approval" icon={<Clock className="text-amber-500" />} />
        <StatCard title="Inventory Items" value="1,204" subValue="8 items low stock" icon={<Package className="text-blue-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-6 font-mono text-xs uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
            Recent Activity
          </h3>
          <div className="space-y-6">
            {prs.slice(0, 5).map(pr => (
              <div key={pr.id} className="flex items-start justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                <div className="flex gap-4">
                  <div className={`p-2 rounded-lg ${
                    pr.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' :
                    pr.status === 'PENDING_APPROVAL' ? 'bg-amber-50 text-amber-600' :
                    'bg-slate-50 text-slate-600'
                  }`}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{pr.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase">{pr.id}</span>
                      <span className="text-xs text-slate-500">{pr.department}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm tracking-tight text-slate-900">${pr.totalAmount.toLocaleString()}</p>
                  <StatusBadge status={pr.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-900 mb-6 font-mono text-xs uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.5)] animate-pulse"></span>
            Supplier Risk Matrix
          </h3>
          <div className="flex-1 space-y-4">
            {MOCK_VENDORS.slice(0, 4).map(v => (
              <div key={v.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                    {v.name.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-slate-800 line-clamp-1">{v.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <div key={s} className={`w-1 h-3 rounded-full ${s <= v.rating ? 'bg-indigo-500' : 'bg-slate-200'}`}></div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-6 w-full text-center text-xs font-semibold text-indigo-600 hover:text-indigo-700 underline underline-offset-4">
            View All Performance Logs
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function RBACView() {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <ShieldCheck className="text-indigo-600" />
            Roles & Permissions
          </h1>
          <p className="text-slate-500 text-sm mt-1">Configure hierarchical access control for your organization.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-sm font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Audit Logs</button>
          <button className="px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-sm">Add User</button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-wider text-slate-500 italic">Identity</th>
              <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-wider text-slate-500 italic">Department</th>
              <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-wider text-slate-500 italic">Assigned Role</th>
              <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-wider text-slate-500 italic">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MOCK_USERS.map(user => (
              <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold ring-2 ring-transparent group-hover:ring-slate-200 transition-all">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-400 font-mono italic">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-600">{user.department}</span>
                </td>
                <td className="px-6 py-4">
                  <RoleChip role={user.role} />
                </td>
                <td className="px-6 py-4">
                  <button className="text-indigo-600 text-xs font-bold hover:underline">Edit Permission</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

function VMSView() {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Store className="text-indigo-600" />
            Vendor Ecosystem
          </h1>
          <p className="text-slate-500 text-sm mt-1">Lifecycle management for registered suppliers.</p>
        </div>
        <button className="px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-sm">Onboard New Supplier</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-slate-400">Filter By Status</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" defaultChecked className="accent-indigo-600" />
                <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">Active (42)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="accent-indigo-600" />
                <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">Onboarding (3)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="accent-indigo-600" />
                <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">Blacklisted (2)</span>
              </label>
            </div>
          </div>
          <div className="p-5 bg-indigo-600 rounded-xl text-white py-8 relative overflow-hidden">
            <p className="text-xs opacity-80 uppercase tracking-widest font-mono">System Insight</p>
            <p className="text-xl font-bold mt-2 relative z-10 leading-tight">Supplier diversity increased by 14.2% this quarter.</p>
            <div className="absolute -bottom-4 -right-4 opacity-10">
              <Store size={120} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-wider text-slate-500 italic">Supplier Domain</th>
                <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-wider text-slate-500 italic">Category</th>
                <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-wider text-slate-500 italic">Risk Profile</th>
                <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-wider text-slate-500 italic">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_VENDORS.map(v => (
                <tr key={v.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{v.name}</p>
                    <p className="text-xs text-slate-400 font-mono italic">{v.contactPerson}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">{v.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <VendorStatus status={v.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <span className={`font-mono text-sm font-bold ${v.rating > 4 ? 'text-emerald-600' : 'text-slate-900'}`}>{v.rating || 'N/A'}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

function PRPOView({ prs, onCreateClick }: { prs: PurchaseRequest[], onCreateClick: () => void, key?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <FileText className="text-indigo-600" />
            Request Pipeline
          </h1>
          <p className="text-slate-500 text-sm mt-1">Active Procurement Requisitions and Purchase Orders.</p>
        </div>
        <div className="flex gap-2">
           <button className="px-4 py-2 text-sm font-semibold border border-slate-200 rounded-lg bg-white hover:bg-slate-50">Bulk Export</button>
           <button 
            onClick={onCreateClick}
            className="px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            New Requisition
          </button>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200 mb-6">
        <button className="px-6 py-2 text-sm font-bold text-indigo-600 border-b-2 border-indigo-600">Purchase Requests</button>
        <button className="px-6 py-2 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">Purchase Orders</button>
        <button className="px-6 py-2 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">Archived</button>
      </div>

      <div className="space-y-4">
        {prs.map(pr => (
          <div key={pr.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <Package size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 group-hover:translate-x-1 transition-transform">{pr.title}</h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                    <span className="font-mono bg-slate-100 px-1.5 rounded uppercase text-[10px] text-slate-600">{pr.id}</span>
                    <span className="flex items-center gap-1"><Users size={14} /> {pr.department}</span>
                    <span className="flex items-center gap-1"><Clock size={14} /> Created {pr.createdAt}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">Total Value</p>
                  <p className="text-xl font-bold font-mono tracking-tight text-indigo-900">${pr.totalAmount.toLocaleString()}</p>
                </div>
                <div className="w-px h-10 bg-slate-100"></div>
                <div className="flex flex-col items-end gap-2">
                   <StatusBadge status={pr.status} />
                   <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 uppercase">
                     Details <ChevronRight size={12} />
                   </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// NEW COMPONENT: CreatePRPanel
import { X, Trash2 } from 'lucide-react';
function CreatePRPanel({ onClose, onSubmit }: { onClose: () => void, onSubmit: (pr: PurchaseRequest) => void }) {
  const [formData, setFormData] = useState({
    title: '',
    department: 'Marketing',
    currency: 'USD'
  });
  const [items, setItems] = useState<any[]>([{ id: '1', description: '', quantity: 1, unitPrice: 0 }]);

  const addItem = () => {
    setItems([...items, { id: Math.random().toString(36).substr(2, 9), description: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: string, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPR: PurchaseRequest = {
      id: `PR-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      title: formData.title || 'Untitled Request',
      requesterId: '2', // Current User
      department: formData.department,
      totalAmount,
      currency: formData.currency,
      status: 'PENDING_APPROVAL',
      createdAt: new Date().toISOString().split('T')[0],
      items: items.map(item => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      }))
    };
    onSubmit(newPR);
  };

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl z-40 flex flex-col"
    >
      <div className="h-16 border-b border-slate-100 flex items-center justify-between px-6 flex-shrink-0">
        <h2 className="font-bold text-lg text-slate-900">New Purchase Requisition</h2>
        <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Basic Info */}
        <section className="space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold">General Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Requisition Title</label>
              <input 
                required
                type="text" 
                placeholder="e.g. Annual Software Subscription"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Department</label>
              <select 
                value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 transition-all bg-white"
              >
                <option>Marketing</option>
                <option>Operations</option>
                <option>Finance</option>
                <option>Engineering</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Currency</label>
              <select 
                value={formData.currency}
                onChange={e => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 transition-all bg-white"
              >
                <option>USD</option>
                <option>TWD</option>
                <option>EUR</option>
              </select>
            </div>
          </div>
        </section>

        {/* Line Items */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold">Line Items</h3>
            <button 
              type="button"
              onClick={addItem}
              className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline"
            >
              <Plus size={14} /> Add Item
            </button>
          </div>
          
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={item.id} className="flex gap-3 p-4 bg-slate-50/50 border border-slate-100 rounded-xl group relative">
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-12">
                      <input 
                        required
                        type="text" 
                        placeholder="Description of item or service"
                        value={item.description}
                        onChange={e => updateItem(item.id, 'description', e.target.value)}
                        className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div className="col-span-4">
                      <label className="text-[10px] text-slate-400 uppercase font-mono mb-1 block">Qty</label>
                      <input 
                        type="number" 
                        min="1"
                        value={item.quantity}
                        onChange={e => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div className="col-span-4">
                      <label className="text-[10px] text-slate-400 uppercase font-mono mb-1 block">Unit Price</label>
                      <input 
                        type="number" 
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={e => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div className="col-span-4 text-right">
                       <label className="text-[10px] text-slate-400 uppercase font-mono mb-1 block">Subtotal</label>
                       <p className="py-1.5 text-sm font-bold text-slate-900 font-mono">
                         ${(item.quantity * item.unitPrice).toLocaleString()}
                       </p>
                    </div>
                  </div>
                </div>
                {items.length > 1 && (
                  <button 
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="p-1 h-fit text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      </form>

      {/* Footer */}
      <div className="p-6 border-t border-slate-100 bg-slate-50/50 space-y-4">
        <div className="flex justify-between items-center text-lg font-bold">
          <span className="text-slate-500">Estimated Total</span>
          <span className="font-mono text-indigo-900 text-2xl">${totalAmount.toLocaleString()} <span className="text-xs font-medium">{formData.currency}</span></span>
        </div>
        <div className="flex gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-white transition-all shadow-sm"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-[0.98]"
          >
            Submit Requisition
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Helpers
function StatCard({ title, value, subValue, icon }: { title: string, value: string, subValue: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-4">
        <span className="p-2 rounded-lg bg-slate-50 group-hover:scale-110 transition-transform">{icon}</span>
        <div className="w-1.5 h-1.5 bg-slate-200 rounded-full"></div>
      </div>
      <div>
        <p className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-slate-900 tracking-tight font-mono">{value}</p>
        <p className="text-[10px] text-slate-400 mt-2 italic">{subValue}</p>
      </div>
    </div>
  );
}

function RoleChip({ role }: { role: UserRole }) {
  const styles = {
    ADMIN: 'bg-rose-50 text-rose-700 border-rose-200',
    BUYER: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    APPROVER: 'bg-amber-50 text-amber-700 border-amber-200',
    REQUESTER: 'bg-slate-50 text-slate-700 border-slate-200',
  };

  return (
    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${styles[role]}`}>
      {role}
    </span>
  );
}

function StatusBadge({ status }: { status: DocumentStatus }) {
  const config = {
    DRAFT: { label: 'Draft', color: 'bg-slate-100 text-slate-600', icon: <Plus size={12} /> },
    PENDING_APPROVAL: { label: 'Awaiting Approval', color: 'bg-amber-100 text-amber-700', icon: <Clock size={12} /> },
    APPROVED: { label: 'Approved', color: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 size={12} /> },
    REJECTED: { label: 'Rejected', color: 'bg-rose-100 text-rose-700', icon: <AlertCircle size={12} /> },
    CONVERTED_TO_PO: { label: 'PO Created', color: 'bg-indigo-100 text-indigo-700', icon: <TrendingUp size={12} /> },
    COMPLETED: { label: 'Fulfilled', color: 'bg-blue-100 text-blue-700', icon: <CheckCircle2 size={12} /> },
  };

  const { label, color, icon } = config[status];

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${color}`}>
      {icon}
      {label}
    </div>
  );
}

function VendorStatus({ status }: { status: Vendor['status'] }) {
  const config = {
    ACTIVE: { color: 'bg-emerald-500' },
    ONBOARDING: { color: 'bg-amber-500' },
    BLACKLISTED: { color: 'bg-rose-500' },
    INACTIVE: { color: 'bg-slate-300' },
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${config[status].color}`}></div>
      <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">{status}</span>
    </div>
  );
}

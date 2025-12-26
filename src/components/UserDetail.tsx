import { useState } from 'react';
import { Plus, Trash2, Key, Search, X, Edit, ChevronDown, RefreshCw } from 'lucide-react';
import { formatNumber } from '../utils/format';

type UserRole = 'admin' | 'trader' | 'viewer';
type UserStatus = '启用' | '禁用';

export interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  totalAssets: string;
  createdAt: string;
}

interface UserDetailProps {
  onNavigateToCreate?: () => void;
  onNavigateToEdit?: (user: User) => void;
  onNavigateToResetPassword?: (user: User) => void;
}

export function UserDetail({ onNavigateToCreate, onNavigateToEdit, onNavigateToResetPassword }: UserDetailProps) {
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      username: 'zhangsan',
      email: 'zhangsan@example.com',
      phone: '13800138000',
      role: '管理员',
      status: '启用',
      totalAssets: '1000000.00',
      createdAt: '2024-01-15 10:30:25'
    },
    {
      id: '2',
      username: 'lisi',
      email: 'lisi@example.com',
      phone: '13800138001',
      role: '代理',
      status: '启用',
      totalAssets: '500000.50',
      createdAt: '2024-02-20 14:22:10'
    },
    {
      id: '3',
      username: 'wangwu',
      email: 'wangwu@example.com',
      phone: '13800138002',
      role: '普通用户',
      status: '禁用',
      totalAssets: '0.00',
      createdAt: '2024-03-10 09:15:33'
    },
    {
      id: '4',
      username: 'zhaoliu',
      email: 'zhaoliu@example.com',
      phone: '13800138003',
      role: '普通用户',
      status: '启用',
      totalAssets: '200000.00',
      createdAt: '2024-03-15 16:45:50'
    }
  ]);

  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<UserStatus | 'all'>('all');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  const handleCreateUser = () => {
    if (onNavigateToCreate) {
      onNavigateToCreate();
    }
  };

  const handleEditUser = (user: User) => {
    if (onNavigateToEdit) {
      onNavigateToEdit(user);
    }
  };

  const handleResetPassword = (user: User) => {
    if (onNavigateToResetPassword) {
      onNavigateToResetPassword(user);
    }
  };

  const handleDeleteUser = (userId: string) => {
    setDeletingUserId(userId);
    setShowDeleteConfirmModal(true);
  };

  const handleDeleteConfirm = () => {
    if (deletingUserId) {
      setUsers(users.filter(u => u.id !== deletingUserId));
      setShowDeleteConfirmModal(false);
      alert('用户已删除');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case '管理员':
      case 'admin':
        return 'bg-purple-100 text-purple-600';
      case '代理':
      case 'trader':
        return 'bg-blue-100 text-blue-600';
      case '普通用户':
      case 'viewer':
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusBadgeColor = (status: UserStatus) => {
    return status === '启用' 
      ? 'bg-green-100 text-green-600' 
      : 'bg-red-100 text-red-600';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Fixed Header Section */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-semibold text-gray-900">用户管理</h1>
              <button
                onClick={handleRefresh}
                className={`p-2 text-gray-400 hover:text-gray-600 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
                title="刷新"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500">管理系统用户账户和权限</p>
          </div>
          <button
            onClick={handleCreateUser}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            创建用户
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6">
          {/* Search */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="搜索用户名、邮箱..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              />
            </div>
            
            {/* Search Button */}
            <button
              onClick={() => {}}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors whitespace-nowrap"
            >
              &nbsp;&nbsp;搜索&nbsp;&nbsp;
            </button>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="mb-6">
          <div className="flex items-center gap-6">
            {/* Role Filter */}
            <div className="relative">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center gap-1.5 py-2 text-base text-gray-700 hover:text-gray-900 transition-colors"
              >
                <span>{filterRole === 'all' ? '角色' : filterRole === 'admin' ? '管理员' : filterRole === 'trader' ? '代理' : '普通用户'}</span>
                <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor" className="text-gray-500">
                  <path d="M5 6L0 0h10L5 6z" />
                </svg>
              </button>

              {showRoleDropdown && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-20 min-w-[120px]">
                  <button
                    onClick={() => {
                      setFilterRole('all');
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-base hover:bg-gray-50 transition-colors ${
                      filterRole === 'all' ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                    }`}
                  >
                    全部
                  </button>
                  <button
                    onClick={() => {
                      setFilterRole('admin');
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-base hover:bg-gray-50 transition-colors ${
                      filterRole === 'admin' ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                    }`}
                  >
                    管理员
                  </button>
                  <button
                    onClick={() => {
                      setFilterRole('trader');
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-base hover:bg-gray-50 transition-colors ${
                      filterRole === 'trader' ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                    }`}
                  >
                    代理
                  </button>
                  <button
                    onClick={() => {
                      setFilterRole('viewer');
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-base hover:bg-gray-50 transition-colors ${
                      filterRole === 'viewer' ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                    }`}
                  >
                    普通用户
                  </button>
                </div>
              )}
            </div>

            {/* Status Filter */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowStatusDropdown(!showStatusDropdown);
                  setShowRoleDropdown(false);
                }}
                className="flex items-center gap-1.5 py-2 text-base text-gray-700 hover:text-gray-900 transition-colors"
              >
                <span>{filterStatus === 'all' ? '状态' : filterStatus}</span>
                <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor" className="text-gray-500">
                  <path d="M5 6L0 0h10L5 6z" />
                </svg>
              </button>

              {showStatusDropdown && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-20 min-w-[120px]">
                  <button
                    onClick={() => {
                      setFilterStatus('all');
                      setShowStatusDropdown(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-base hover:bg-gray-50 transition-colors ${
                      filterStatus === 'all' ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                    }`}
                  >
                    全部
                  </button>
                  <button
                    onClick={() => {
                      setFilterStatus('激活');
                      setShowStatusDropdown(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-base hover:bg-gray-50 transition-colors ${
                      filterStatus === '激活' ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                    }`}
                  >
                    激活
                  </button>
                  <button
                    onClick={() => {
                      setFilterStatus('停用');
                      setShowStatusDropdown(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-base hover:bg-gray-50 transition-colors ${
                      filterStatus === '停用' ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                    }`}
                  >
                    停用
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Users List */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <div key={user.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4">
              {/* User Name with Role, Status and Total Net Value */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg text-gray-900">{user.username}</h3>
                  <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
                    {user.role}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusBadgeColor(user.status)}`}>
                    {user.status}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 mb-1">总净值</div>
                  <div className="text-lg text-green-600 font-semibold">{formatNumber(parseFloat(user.totalAssets))}</div>
                </div>
              </div>
              
              {/* User Info Grid - Label above value */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">邮箱</div>
                  <div className="text-gray-900 truncate">{user.email}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">手机</div>
                  <div className="text-gray-900">{user.phone}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">创建时间</div>
                  <div className="text-gray-900">{user.createdAt}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => handleEditUser(user)}
                  className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  编辑
                </button>
                <button
                  onClick={() => handleResetPassword(user)}
                  className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  重置密码
                </button>
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  删除
                </button>
              </div>
            </div>
          ))}

          {filteredUsers.length === 0 && (
            <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
              没有找到匹配的用户
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirm Modal */}
      {showDeleteConfirmModal && deletingUserId && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/30 flex items-end justify-center z-50">
          <div 
            className="bg-white rounded-t-3xl shadow-xl p-6 w-full max-w-4xl h-[85vh] flex flex-col animate-slide-up"
            style={{
              animation: 'slideUp 0.3s ease-out'
            }}
          >
            {/* Modal Header */}
            <div className="mb-6 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  确认删除
                </h2>
                <button
                  onClick={() => setShowDeleteConfirmModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              {/* Divider */}
              <div className="border-t border-gray-200"></div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto mb-6">
              <div className="text-gray-600">
                确定要删除用户 "{users.find(u => u.id === deletingUserId)?.username}" 吗？此操作不可撤销。
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowDeleteConfirmModal(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                删除
              </button>
            </div>
          </div>
          
          <style>{`
            @keyframes slideUp {
              from {
                transform: translateY(100%);
                opacity: 0;
              }
              to {
                transform: translateY(0);
                opacity: 1;
              }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
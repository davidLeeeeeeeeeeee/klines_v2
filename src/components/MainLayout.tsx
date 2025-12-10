import { useState } from 'react';
import { LayoutDashboard, Target, Users, TrendingUp, Wallet, Monitor, Menu, X, User, ChevronDown, LogOut, Moon, Sun, KeyRound, Activity, Shield } from 'lucide-react';
import { Dashboard } from './Dashboard';
import { StrategyList } from './StrategyList';
import { StrategyDetail } from './StrategyDetail';
import { StrategyConfigPage } from './StrategyConfigPage';
import { ProfilePage } from './ProfilePage';
import { ChangePasswordPage } from './ChangePasswordPage';
import { UserDetail } from './UserDetail';
import { TradingAccounts } from './TradingAccounts';
import { TradingMonitor } from './TradingMonitor';
import { StrategyMonitor } from './StrategyMonitor';
import { AccountMonitor } from './AccountMonitor';
import { CreateUserPage } from './CreateUserPage';
import { EditUserPage } from './EditUserPage';
import { ResetUserPasswordPage } from './ResetUserPasswordPage';
import { CreateTradingAccountPage } from './CreateTradingAccountPage';
import { EditTradingAccountPage } from './EditTradingAccountPage';
import { RiskManagement } from './RiskManagement';

interface MainLayoutProps {
  onLogout: () => void;
}

type MenuItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  children?: MenuItem[];
};

export function MainLayout({ onLogout }: MainLayoutProps) {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<any | null>(null);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['trading-monitor']);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isUserManagementInSecondaryView, setIsUserManagementInSecondaryView] = useState(false);
  const [isTradingAccountsInSecondaryView, setIsTradingAccountsInSecondaryView] = useState(false);

  // User management state
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Trading account state
  const [selectedTradingAccount, setSelectedTradingAccount] = useState<any>(null);

  // User management navigation
  const handleNavigateToCreateUser = () => {
    setSelectedUser(null);
    setCurrentPage('user-create');
  };

  const handleNavigateToEditUser = (user: any) => {
    setSelectedUser(user);
    setCurrentPage('user-edit');
  };

  const handleNavigateToResetPassword = (user: any) => {
    setSelectedUser(user);
    setCurrentPage('user-reset-password');
  };

  const handleBackToUserList = () => {
    setSelectedUser(null);
    setCurrentPage('user-management');
  };

  // Trading account navigation
  const handleNavigateToCreateTradingAccount = () => {
    setSelectedTradingAccount(null);
    setCurrentPage('trading-account-create');
  };

  const handleNavigateToEditTradingAccount = (account: any) => {
    setSelectedTradingAccount(account);
    setCurrentPage('trading-account-edit');
  };

  const handleBackToTradingAccountList = () => {
    setSelectedTradingAccount(null);
    setCurrentPage('account-management');
  };

  // Strategy management state
  const [strategies, setStrategies] = useState([
    {
      id: '1',
      name: '趋势追踪策略',
      description: '基于动量指标和移动平均线的中长期趋势跟踪系统，适合波动性市场',
      returns: 23.5,
      totalReturn: '+156,890',
      followers: 48,
      winRate: 68.5,
      maxDrawdown: 12.3,
      sharpeRatio: 2.1,
      createDate: '2024-01-15',
      status: 'active' as 'active' | 'paused',
      tags: ['趋势策略'],
      riskLevel: 'medium' as 'low' | 'medium' | 'high',
      totalFollowingCapital: '¥2,450,000'
    },
    {
      id: '2',
      name: '网格交易策略',
      description: '在区间震荡市场中利用价格波动获利，自动化网格设置',
      returns: 18.2,
      totalReturn: '+98,450',
      followers: 35,
      winRate: 72.3,
      maxDrawdown: 8.5,
      sharpeRatio: 1.8,
      createDate: '2024-02-10',
      status: 'active' as 'active' | 'paused',
      tags: ['网格交易'],
      riskLevel: 'low' as 'low' | 'medium' | 'high',
      totalFollowingCapital: '¥1,850,000'
    },
    {
      id: '3',
      name: '套利策略',
      description: '跨交易所价差套利，低风险稳定收益',
      returns: 12.8,
      totalReturn: '+52,300',
      followers: 62,
      winRate: 85.2,
      maxDrawdown: 5.2,
      sharpeRatio: 2.5,
      createDate: '2024-01-20',
      status: 'active' as 'active' | 'paused',
      tags: ['套利'],
      riskLevel: 'low' as 'low' | 'medium' | 'high',
      totalFollowingCapital: '¥3,120,000'
    },
    {
      id: '4',
      name: '高频做市策略',
      description: '基于订单流和市场深度的高频交易策略',
      returns: 31.4,
      totalReturn: '+215,600',
      followers: 28,
      winRate: 64.8,
      maxDrawdown: 15.6,
      sharpeRatio: 1.9,
      createDate: '2023-12-05',
      status: 'active' as 'active' | 'paused',
      tags: ['做市策略', '高频交易'],
      riskLevel: 'high' as 'low' | 'medium' | 'high',
      totalFollowingCapital: '¥1,680,000'
    },
    {
      id: '5',
      name: '均值回归策略',
      description: '利用价格偏离均值后的回归特性进行交易',
      returns: 15.6,
      totalReturn: '+78,920',
      followers: 41,
      winRate: 70.5,
      maxDrawdown: 9.8,
      sharpeRatio: 2.0,
      createDate: '2024-03-01',
      status: 'paused' as 'active' | 'paused',
      tags: ['均值回归'],
      riskLevel: 'medium' as 'low' | 'medium' | 'high',
      totalFollowingCapital: '¥2,050,000'
    },
    {
      id: '6',
      name: '量化对冲策略',
      description: '多空对冲，市场中性策略，降低系统性风险',
      returns: 9.8,
      totalReturn: '+45,230',
      followers: 55,
      winRate: 78.9,
      maxDrawdown: 4.5,
      sharpeRatio: 2.3,
      createDate: '2024-02-15',
      status: 'active' as 'active' | 'paused',
      tags: ['对冲策略', '市场中性'],
      riskLevel: 'low' as 'low' | 'medium' | 'high',
      totalFollowingCapital: '¥2,750,000'
    }
  ]);

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: '仪表盘',
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      id: 'strategy-list',
      label: '策略中心',
      icon: <Target className="w-5 h-5" />
    },
    {
      id: 'user-management',
      label: '用户管理',
      icon: <Users className="w-5 h-5" />
    },
    {
      id: 'account-management',
      label: '账户管理',
      icon: <Wallet className="w-5 h-5" />
    },
    {
      id: 'account-monitor',
      label: '交易监控',
      icon: <Monitor className="w-5 h-5" />
    },
    {
      id: 'strategy-monitor',
      label: '策略监控',
      icon: <Activity className="w-5 h-5" />
    },
    {
      id: 'risk-management',
      label: '风险管理',
      icon: <Shield className="w-5 h-5" />
    }
  ];

  const toggleMenu = (menuId: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menuId) ? prev.filter((id) => id !== menuId) : [...prev, menuId]
    );
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus.includes(item.id);
    const isActive = currentPage === item.id;

    return (
      <div key={item.id}>
        <button
          onClick={() => {
            if (hasChildren) {
              toggleMenu(item.id);
            } else {
              setCurrentPage(item.id);
            }
          }}
          className={`w-full flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'} px-4 py-3 rounded-lg transition-all duration-200 ${
            level === 0 ? 'mb-1' : 'mb-0.5'
          } ${
            isActive
              ? 'bg-blue-500 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          } ${level > 0 ? 'ml-4' : ''}`}
        >
          <div className="flex items-center gap-3">
            {item.icon}
            {isSidebarOpen && <span>{item.label}</span>}
          </div>
          {hasChildren && isSidebarOpen && (
            <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}>
              <ChevronDown className="w-4 h-4" />
            </div>
          )}
        </button>

        {hasChildren && isExpanded && isSidebarOpen && (
          <div className="mt-1 space-y-0.5">
            {item.children!.map((child) => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Strategy navigation
  const handleViewStrategyDetail = (strategyId: string) => {
    setSelectedStrategyId(strategyId);
    setCurrentPage('strategy-detail');
  };

  const handleBackToStrategyList = () => {
    setSelectedStrategyId(null);
    setSelectedStrategy(null);
    setCurrentPage('strategy-list');
  };

  const handleNavigateToStrategyConfig = (strategy: any) => {
    setSelectedStrategy(strategy);
    setCurrentPage('strategy-config');
  };

  const handleUpdateStrategy = (strategyId: string, updates: any) => {
    setStrategies(strategies.map(s => 
      s.id === strategyId ? { ...s, ...updates } : s
    ));
  };

  const handleSaveStrategy = (strategyData: any) => {
    if (selectedStrategy) {
      // Update existing strategy
      handleUpdateStrategy(selectedStrategy.id, strategyData);
      alert('策略已更新！');
    } else {
      // Create new strategy
      const newStrategy = {
        id: `${strategies.length + 1}`,
        ...strategyData,
        returns: 0,
        totalReturn: '+0',
        followers: 0,
        winRate: 0,
        maxDrawdown: 0,
        sharpeRatio: 0,
        createDate: new Date().toISOString().split('T')[0],
        status: 'active' as 'active' | 'paused',
        totalFollowingCapital: '¥0'
      };
      setStrategies([...strategies, newStrategy]);
      alert('策略已创建！');
    }
    handleBackToStrategyList();
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'strategy-list':
        return (
          <StrategyList 
            onViewDetail={handleViewStrategyDetail}
            onNavigateToConfig={handleNavigateToStrategyConfig}
            strategies={strategies}
            onUpdateStrategy={handleUpdateStrategy}
          />
        );
      case 'strategy-detail':
        return <StrategyDetail strategyId={selectedStrategyId} onBack={handleBackToStrategyList} />;
      case 'strategy-config':
        return (
          <StrategyConfigPage
            strategy={selectedStrategy}
            onBack={handleBackToStrategyList}
            onSave={handleSaveStrategy}
          />
        );
      case 'profile':
        return <ProfilePage onBack={() => setCurrentPage('dashboard')} />;
      case 'change-password':
        return <ChangePasswordPage onBack={() => setCurrentPage('dashboard')} />;
      case 'user-management':
        return (
          <UserDetail 
            onNavigateToCreate={handleNavigateToCreateUser}
            onNavigateToEdit={handleNavigateToEditUser}
            onNavigateToResetPassword={handleNavigateToResetPassword}
          />
        );
      case 'account-management':
        return (
          <TradingAccounts 
            onNavigateToCreate={handleNavigateToCreateTradingAccount}
            onNavigateToEdit={handleNavigateToEditTradingAccount}
          />
        );
      case 'strategy-monitor':
        return <StrategyMonitor onBack={() => setCurrentPage('dashboard')} />;
      case 'account-monitor':
        return <AccountMonitor onBack={() => setCurrentPage('dashboard')} />;
      case 'user-create':
        return <CreateUserPage onBack={handleBackToUserList} />;
      case 'user-edit':
        return <EditUserPage user={selectedUser} onBack={handleBackToUserList} />;
      case 'user-reset-password':
        return <ResetUserPasswordPage user={selectedUser} onBack={handleBackToUserList} />;
      case 'trading-account-create':
        return <CreateTradingAccountPage onBack={handleBackToTradingAccountList} />;
      case 'trading-account-edit':
        return <EditTradingAccountPage account={selectedTradingAccount} onBack={handleBackToTradingAccountList} />;
      case 'risk-management':
        return <RiskManagement onBack={() => setCurrentPage('dashboard')} />;
      default:
        return <Dashboard />;
    }
  };

  // Hide sidebar and header for secondary pages
  const isSecondaryPage = [
    'strategy-detail', 
    'strategy-config', 
    'profile', 
    'change-password',
    'user-create',
    'user-edit',
    'user-reset-password',
    'trading-account-create',
    'trading-account-edit'
  ].includes(currentPage);

  if (isSecondaryPage) {
    return (
      <div className="min-h-screen bg-gray-50">
        {renderContent()}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-gray-200 transition-all duration-300 flex-shrink-0`}
      >
        <div className="h-full flex flex-col">
          {/* Logo with Toggle Button */}
          <div className="h-16 border-b border-gray-200 flex items-center px-3 sticky top-0 bg-white z-10">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="w-[52px] h-10 flex items-center justify-center hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
            >
              <Menu className="w-6 h-6 text-gray-600" strokeWidth={2.5} />
            </button>
            {isSidebarOpen && (
              <div className="ml-2 flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-gray-900">AI量化</span>
              </div>
            )}
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto p-3">
            {menuItems.map((item) => renderMenuItem(item))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6 sticky top-0 z-10">
          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-gray-400" />
              </div>
            </button>

            {/* Dropdown Menu */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-gray-200">
                  <div className="text-gray-900">张三</div>
                  <div className="text-gray-500 text-sm">user@example.com</div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      setIsDarkMode(!isDarkMode);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between text-gray-900"
                  >
                    <div className="flex items-center gap-3">
                      {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                      切换主题
                    </div>
                    <span className="text-gray-400 text-sm">灰色</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      setCurrentPage('profile');
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-900"
                  >
                    <User className="w-4 h-4" />
                    个人资料
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      setCurrentPage('change-password');
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-900"
                  >
                    <KeyRound className="w-4 h-4" />
                    修改密码
                  </button>
                </div>

                {/* Logout */}
                <div className="border-t border-gray-200 pt-2">
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onLogout();
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    退出登录
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
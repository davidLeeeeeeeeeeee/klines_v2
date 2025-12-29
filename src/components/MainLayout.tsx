import { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, Target, Users, TrendingUp, Wallet, Monitor, Menu, X, User, ChevronDown, LogOut, Moon, Sun, KeyRound, Activity, Shield, Settings, Sliders, Layers } from 'lucide-react';
import { Dashboard } from './Dashboard';
import { StrategyList } from './StrategyList';
import { StrategyConfigList } from './StrategyConfigList';
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
import { InitAccountPage } from './InitAccountPage';
import { RiskManagement } from './RiskManagement';
import { FundTransfer } from './FundTransfer';
import { OperationInstance } from './OperationInstance';
import type { TradingAccount } from './TradingAccounts';
import { getCryptoPrices, getCurrentUserInfo } from '../services/api';
import { getUserInfo, getToken, getUserType } from '../utils/storage';
import { formatNumber } from '../utils/format';

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
  const [selectedStrategyName, setSelectedStrategyName] = useState<string | null>(null);
  const [selectedStrategyAiModel, setSelectedStrategyAiModel] = useState<string | undefined>(undefined);
  const [selectedStrategyRunDays, setSelectedStrategyRunDays] = useState<number | undefined>(undefined);
  const [selectedStrategyDescription, setSelectedStrategyDescription] = useState<string | undefined>(undefined);
  const [selectedStrategy, setSelectedStrategy] = useState<any | null>(null);
  const [strategyConfigSource, setStrategyConfigSource] = useState<'strategy-list' | 'strategy-config-list'>('strategy-list');
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['trading-monitor']);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isUserManagementInSecondaryView, setIsUserManagementInSecondaryView] = useState(false);
  const [isTradingAccountsInSecondaryView, setIsTradingAccountsInSecondaryView] = useState(false);
  const [userInfo, setUserInfo] = useState<ReturnType<typeof getUserInfo>>(null);
  const [isLoadingUserInfo, setIsLoadingUserInfo] = useState(false);

  // User management state
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Operation instance state
  const [operationInstanceData, setOperationInstanceData] = useState<{
    id: number;
    strategyType: string;
    exchange: string;
    accountName: string;
  } | null>(null);

  // Trading account state
  const [selectedTradingAccount, setSelectedTradingAccount] = useState<any>(null);
  const [allTradingAccounts, setAllTradingAccounts] = useState<TradingAccount[]>([
    {
      id: '1',
      exchange: 'Binance',
      uid: '123456789012',
      accountName: '主交易账户',
      apiKey: 'aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890',
      apiSecret: '1234567890aBcDeFgHiJkLmNoPqRsTuVwXyZ',
      initStatus: '已初始化',
      netValue: '10000.00',
      initialNetValue: '10000.00',
      createdAt: '2024-01-15 10:30:25',
      username: 'admin',
      strategyName: '趋势追踪策略',
      accountType: '主账户'
    },
    {
      id: '2',
      exchange: 'OKX',
      uid: '987654321098',
      accountName: '备用账户',
      apiKey: 'ZyXwVuTsRqPoNmLkJiHgFeDcBa0987654321',
      apiSecret: '0987654321ZyXwVuTsRqPoNmLkJiHgFeDcBa',
      initStatus: '已初始化',
      netValue: '5000.00',
      initialNetValue: '5000.00',
      createdAt: '2024-02-20 14:22:10',
      username: 'user1',
      strategyName: '网格交易策略',
      accountType: '子账户',
      parentAccountId: '1'
    },
    {
      id: '3',
      exchange: 'Bybit',
      uid: '112233445566',
      accountName: '测试账户',
      apiKey: 'TeSt1234567890aBcDeFgHiJkLmNoPqRsT',
      apiSecret: 'TeSt0987654321ZyXwVuTsRqPoNmLkJiH',
      initStatus: '未初始化',
      netValue: '0.00',
      initialNetValue: '0.00',
      createdAt: '2024-03-10 09:15:33',
      username: 'test',
      accountType: '子账户',
      parentAccountId: '1'
    },
    {
      id: '4',
      exchange: 'Gate',
      uid: '556677889900',
      accountName: '策略账户A',
      apiKey: 'GaTe1234567890aBcDeFgHiJkLmNoPq',
      apiSecret: 'GaTe0987654321ZyXwVuTsRqPoNmLk',
      initStatus: '已初始化',
      netValue: '8000.00',
      initialNetValue: '8000.00',
      createdAt: '2024-03-15 16:45:50',
      username: 'strategy',
      accountType: '主账户'
    },
    {
      id: '5',
      exchange: 'MEXC',
      uid: '998877665544',
      accountName: '备用账户B',
      apiKey: 'MeXc1234567890aBcDeFgHiJkLmNoPqRsT',
      apiSecret: 'MeXc0987654321ZyXwVuTsRqPoNmLkJiH',
      initStatus: '已初始化',
      netValue: '3500.00',
      initialNetValue: '3500.00',
      createdAt: '2024-04-01 11:20:15',
      username: 'user2',
      strategyName: '套利策略',
      accountType: '子账户',
      parentAccountId: '4'
    }
  ]);

  // Crypto prices state
  const [btcPrice, setBtcPrice] = useState<number | null>(null);
  const [ethPrice, setEthPrice] = useState<number | null>(null);
  const [solPrice, setSolPrice] = useState<number | null>(null);
  const [bnbPrice, setBnbPrice] = useState<number | null>(null);
  const [zecPrice, setZecPrice] = useState<number | null>(null);
  const [hypePrice, setHypePrice] = useState<number | null>(null);
  const [priceChangePercent, setPriceChangePercent] = useState<{ btc: number; eth: number; sol: number; bnb: number; zec: number; hype: number }>({ btc: 0, eth: 0, sol: 0, bnb: 0, zec: 0, hype: 0 });

  // User dropdown ref for click outside detection
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // 获取用户信息的函数 - 每次显示弹出框时都会调用
  const fetchUserInfo = async () => {
    // 如果正在加载中，不重复请求
    if (isLoadingUserInfo) {
      console.log('正在加载用户信息，跳过重复请求');
      return;
    }

    setIsLoadingUserInfo(true);
    try {
      const token = getToken();
      if (!token) {
        console.warn('未找到 token，无法获取用户信息');
        // 如果没有 token，尝试从本地存储获取
        setUserInfo(getUserInfo());
        return;
      }

      console.log('开始获取用户信息...');
      const userInfoData = await getCurrentUserInfo(token);
      console.log('获取到的用户信息:', userInfoData);

      // 只更新用户信息状态，不保存token（保留login时的token）
      setUserInfo(userInfoData);
    } catch (error) {
      console.error('获取用户信息失败:', error);
      // 如果接口失败，尝试从本地存储获取
      const cachedUserInfo = getUserInfo();
      if (cachedUserInfo) {
        setUserInfo(cachedUserInfo);
      }
    } finally {
      setIsLoadingUserInfo(false);
    }
  };

  const displayName = userInfo?.username || 'User';
  const displaySubline = 'userType' in (userInfo || {})
    ? (userInfo as any).userType
    : userInfo?.id !== undefined
      ? `ID: ${userInfo.id}`
      : 'N/A';
  const formattedEquity = typeof userInfo?.equity === 'number'
    ? `${formatNumber(userInfo.equity)}`
    : 'N/A';



  // Fetch crypto prices from Bybit
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        console.log('正在获取 Bybit 价格...');
        const prices = await getCryptoPrices(['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'ZECUSDT', 'HYPEUSDT']);
        console.log('获取到的价格:', prices);

        const btc = prices.find(p => p.symbol === 'BTCUSDT');
        const eth = prices.find(p => p.symbol === 'ETHUSDT');
        const sol = prices.find(p => p.symbol === 'SOLUSDT');
        const bnb = prices.find(p => p.symbol === 'BNBUSDT');
        const zec = prices.find(p => p.symbol === 'ZECUSDT');
        const hype = prices.find(p => p.symbol === 'HYPEUSDT');

        if (btc) {
          const newBtcPrice = parseFloat(btc.price);
          setBtcPrice(prevPrice => {
            if (prevPrice !== null) {
              const change = ((newBtcPrice - prevPrice) / prevPrice) * 100;
              setPriceChangePercent(prev => ({ ...prev, btc: change }));
            }
            return newBtcPrice;
          });
        }

        if (eth) {
          const newEthPrice = parseFloat(eth.price);
          setEthPrice(prevPrice => {
            if (prevPrice !== null) {
              const change = ((newEthPrice - prevPrice) / prevPrice) * 100;
              setPriceChangePercent(prev => ({ ...prev, eth: change }));
            }
            return newEthPrice;
          });
        }

        if (sol) {
          const newSolPrice = parseFloat(sol.price);
          setSolPrice(prevPrice => {
            if (prevPrice !== null) {
              const change = ((newSolPrice - prevPrice) / prevPrice) * 100;
              setPriceChangePercent(prev => ({ ...prev, sol: change }));
            }
            return newSolPrice;
          });
        }

        if (bnb) {
          const newBnbPrice = parseFloat(bnb.price);
          setBnbPrice(prevPrice => {
            if (prevPrice !== null) {
              const change = ((newBnbPrice - prevPrice) / prevPrice) * 100;
              setPriceChangePercent(prev => ({ ...prev, bnb: change }));
            }
            return newBnbPrice;
          });
        }

        if (zec) {
          const newZecPrice = parseFloat(zec.price);
          setZecPrice(prevPrice => {
            if (prevPrice !== null) {
              const change = ((newZecPrice - prevPrice) / prevPrice) * 100;
              setPriceChangePercent(prev => ({ ...prev, zec: change }));
            }
            return newZecPrice;
          });
        }

        if (hype) {
          const newHypePrice = parseFloat(hype.price);
          setHypePrice(prevPrice => {
            if (prevPrice !== null) {
              const change = ((newHypePrice - prevPrice) / prevPrice) * 100;
              setPriceChangePercent(prev => ({ ...prev, hype: change }));
            }
            return newHypePrice;
          });
        }
      } catch (error) {
        console.error('获取 Bybit 价格失败，详细错误:', error);
        // 如果获取失败，使用备用数据
        setBtcPrice(prev => prev === null ? 86000.00 : prev);
        setEthPrice(prev => prev === null ? 2900.00 : prev);
        setSolPrice(prev => prev === null ? 126.00 : prev);
        setBnbPrice(prev => prev === null ? 650.00 : prev);
        setZecPrice(prev => prev === null ? 55.00 : prev);
        setHypePrice(prev => prev === null ? 25.00 : prev);
      }
    };

    // 立即获取一次
    fetchPrices();

    // 每5秒获取一次
    const interval = setInterval(fetchPrices, 5000);

    return () => clearInterval(interval);
  }, []); // 移除依赖项，只在组件挂载时执行一次

  // Handle click outside to close user dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };

    if (showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserDropdown]);

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

  const handleNavigateToInitAccount = (account: any, subAccountCount: number) => {
    setSelectedTradingAccount({ ...account, subAccountCount });
    setCurrentPage('trading-account-init');
  };

  const handleNavigateToTransfer = (account: TradingAccount) => {
    setSelectedTradingAccount(account);
    setCurrentPage('fund-transfer');
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
      totalFollowingCapital: '2,450,000',
      runDays: 345,
      aiModel: 'GPT-4'
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
      totalFollowingCapital: '1,850,000',
      runDays: 318,
      aiModel: 'Claude-3'
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
      totalFollowingCapital: '3,120,000',
      runDays: 340,
      aiModel: 'GPT-4'
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
      totalFollowingCapital: '1,680,000',
      runDays: 385,
      aiModel: 'Gemini Pro'
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
      totalFollowingCapital: '2,050,000',
      runDays: 299,
      aiModel: 'Claude-3'
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
      totalFollowingCapital: '2,750,000',
      runDays: 313,
      aiModel: 'GPT-4'
    }
  ]);

  // 普通用户可见的菜单ID
  const userMenuIds = ['dashboard', 'strategy-list', 'account-management', 'account-monitor'];

  // 获取用户类型
  const currentUserType = getUserType();
  const isAdminUser = currentUserType === 0;

  // 所有菜单项
  const allMenuItems: MenuItem[] = [
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
    },
    {
      id: 'strategy-config-list',
      label: '策略配置',
      icon: <Layers className="w-5 h-5" />
    }
  ];

  // 根据用户类型过滤菜单
  const menuItems: MenuItem[] = isAdminUser
    ? allMenuItems
    : allMenuItems.filter(item => userMenuIds.includes(item.id));

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
          className={`w-full flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'} px-4 py-3 rounded-lg transition-all duration-300 ease-in-out ${
            level === 0 ? 'mb-1' : 'mb-0.5'
          } ${
            isActive
              ? 'bg-blue-500 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          } ${level > 0 && isSidebarOpen ? 'ml-4' : ''}`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0">
              {item.icon}
            </div>
            <span className={`transition-all duration-300 ease-in-out whitespace-nowrap ${
              isSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 w-0 overflow-hidden'
            }`}>
              {item.label}
            </span>
          </div>
          {hasChildren && (
            <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'rotate-0' : '-rotate-90'} ${
              isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'
            }`}>
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
  const handleViewStrategyDetail = (strategyName: string, aiModel?: string, runDays?: number, description?: string) => {
    setSelectedStrategyName(strategyName);
    setSelectedStrategyAiModel(aiModel);
    setSelectedStrategyRunDays(runDays);
    setSelectedStrategyDescription(description);
    setCurrentPage('strategy-detail');
  };

  const handleBackToStrategyList = () => {
    setSelectedStrategyName(null);
    setSelectedStrategyAiModel(undefined);
    setSelectedStrategyRunDays(undefined);
    setSelectedStrategyDescription(undefined);
    setSelectedStrategy(null);
    setCurrentPage('strategy-list');
  };

  const handleBackToStrategyConfigList = () => {
    setSelectedStrategyName(null);
    setSelectedStrategyAiModel(undefined);
    setSelectedStrategyRunDays(undefined);
    setSelectedStrategyDescription(undefined);
    setSelectedStrategy(null);
    setCurrentPage('strategy-config-list');
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
        totalFollowingCapital: '0'
      };
      setStrategies([...strategies, newStrategy]);
      alert('策略已创建！');
    }
    // Return to the source page
    if (strategyConfigSource === 'strategy-config-list') {
      handleBackToStrategyConfigList();
    } else {
      handleBackToStrategyList();
    }
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'strategy-list':
        return (
          <StrategyList
            onNavigateToConfig={handleNavigateToStrategyConfig}
            onUpdateStrategy={handleUpdateStrategy}
            onNavigateToAccounts={() => setCurrentPage('account-management')}
          />
        );
      case 'strategy-config-list':
        return (
          <StrategyConfigList
            onNavigateToConfig={(strategy) => {
              setStrategyConfigSource('strategy-config-list');
              handleNavigateToStrategyConfig(strategy);
            }}
            strategies={strategies}
            onUpdateStrategy={handleUpdateStrategy}
            onNavigateToAccounts={() => setCurrentPage('account-management')}
          />
        );
      case 'strategy-detail':
        return <StrategyDetail strategyName={selectedStrategyName} aiModel={selectedStrategyAiModel} runDays={selectedStrategyRunDays} description={selectedStrategyDescription} onBack={handleBackToStrategyList} />;
      case 'strategy-config':
        return (
          <StrategyConfigPage
            strategy={selectedStrategy}
            onBack={strategyConfigSource === 'strategy-config-list' ? handleBackToStrategyConfigList : handleBackToStrategyList}
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
            onNavigateToEdit={handleNavigateToEditUser}
            onNavigateToResetPassword={handleNavigateToResetPassword}
          />
        );
      case 'account-management':
        return <TradingAccounts />;
      case 'strategy-monitor':
        return <StrategyMonitor onBack={() => setCurrentPage('dashboard')} />;
      case 'account-monitor':
        return (
          <AccountMonitor
            onBack={() => setCurrentPage('dashboard')}
          />
        );
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
      case 'trading-account-init':
        return <InitAccountPage
          account={selectedTradingAccount}
          subAccountCount={selectedTradingAccount?.subAccountCount}
          onBack={handleBackToTradingAccountList}
          onSave={(data) => {
            console.log('Init data:', data);
            alert('账户已初始化');
          }}
        />;
      case 'fund-transfer':
        const parentAccount = selectedTradingAccount?.parentAccountId
          ? allTradingAccounts.find(acc => acc.id === selectedTradingAccount.parentAccountId) || null
          : null;
        return (
          <FundTransfer
            account={selectedTradingAccount}
            parentAccount={parentAccount}
            onBack={handleBackToTradingAccountList}
          />
        );
      case 'risk-management':
        return <RiskManagement onBack={() => setCurrentPage('dashboard')} />;
      case 'operation-instance':
        return operationInstanceData ? (
          <OperationInstance
            onBack={() => {
              setCurrentPage('account-monitor');
              setOperationInstanceData(null);
            }}
            tradeData={operationInstanceData}
          />
        ) : <Dashboard />;
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
    'trading-account-edit',
    'trading-account-init',
    'fund-transfer',
    'operation-instance'
  ].includes(currentPage);

  if (isSecondaryPage) {
    return (
      <div className="h-screen bg-gray-50 overflow-y-auto">
        {renderContent()}
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'w-64' : 'w-16'
        } bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex-shrink-0`}
      >
        <div className="h-full flex flex-col">
          {/* Logo with Toggle Button */}
          <div className="h-16 border-b border-gray-200 flex items-center px-3 sticky top-0 bg-white z-10 overflow-hidden">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="w-10 h-10 flex items-center justify-center hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div className={`ml-3 flex items-center gap-2.5 transition-all duration-300 ease-in-out ${
              isSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'
            }`}>
              {/* Mini ALPHA NOW LOGO - 缩放自登录页面 */}
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Gradient background circle */}
                <circle cx="22" cy="22" r="20.53" fill="url(#miniLogoGradient)"/>

                {/* Simplified "A" with upward trend arrow */}
                <path
                  d="M22 11.73L29.33 32.27M14.67 32.27L22 11.73"
                  stroke="white"
                  strokeWidth="3.67"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Crossbar with upward arrow */}
                <path
                  d="M16.87 24.2L22 24.2L27.13 19.07M27.13 19.07L25.4 20.8M27.13 19.07L29.33 20.8"
                  stroke="white"
                  strokeWidth="2.93"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <defs>
                  <linearGradient id="miniLogoGradient" x1="1.47" y1="1.47" x2="42.53" y2="42.53" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#3b82f6"/>
                    <stop offset="100%" stopColor="#8b5cf6"/>
                  </linearGradient>
                </defs>
              </svg>
              <div className="flex flex-col items-start whitespace-nowrap">
                <span
                  className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight"
                  style={{
                    fontSize: '16px',
                    fontWeight: 800,
                    letterSpacing: '0.02em',
                    fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, system-ui, sans-serif'
                  }}
                >
                  ALPHA
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white leading-tight">NOW</span>
              </div>
            </div>
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
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
          {/* Empty div for layout balance */}
          <div></div>
          
          {/* Crypto Prices & Exchange Links */}
          <div className="flex items-center gap-4">
            {/* BTC Price */}
            <div className="flex items-center gap-2">
              <span className="text-gray-600 text-sm font-semibold">BTC</span>
              {btcPrice !== null ? (
                <span className={priceChangePercent.btc >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatNumber(btcPrice)}
                </span>
              ) : (
                <span className="text-gray-400">加载中...</span>
              )}
            </div>

            {/* ETH Price */}
            <div className="flex items-center gap-2">
              <span className="text-gray-600 text-sm font-semibold">ETH</span>
              {ethPrice !== null ? (
                <span className={priceChangePercent.eth >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatNumber(ethPrice)}
                </span>
              ) : (
                <span className="text-gray-400">加载中...</span>
              )}
            </div>

            {/* SOL Price */}
            <div className="flex items-center gap-2">
              <span className="text-gray-600 text-sm font-semibold">SOL</span>
              {solPrice !== null ? (
                <span className={priceChangePercent.sol >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatNumber(solPrice)}
                </span>
              ) : (
                <span className="text-gray-400">加载中...</span>
              )}
            </div>

            {/* BNB Price */}
            <div className="flex items-center gap-2">
              <span className="text-gray-600 text-sm font-semibold">BNB</span>
              {bnbPrice !== null ? (
                <span className={priceChangePercent.bnb >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatNumber(bnbPrice)}
                </span>
              ) : (
                <span className="text-gray-400">加载中...</span>
              )}
            </div>

            {/* ZEC Price */}
            <div className="flex items-center gap-2">
              <span className="text-gray-600 text-sm font-semibold">ZEC</span>
              {zecPrice !== null ? (
                <span className={priceChangePercent.zec >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatNumber(zecPrice)}
                </span>
              ) : (
                <span className="text-gray-400">加载中...</span>
              )}
            </div>

            {/* HYPE Price */}
            <div className="flex items-center gap-2">
              <span className="text-gray-600 text-sm font-semibold">HYPE</span>
              {hypePrice !== null ? (
                <span className={priceChangePercent.hype >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatNumber(hypePrice)}
                </span>
              ) : (
                <span className="text-gray-400">加载中...</span>
              )}
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-gray-300"></div>

            {/* Exchange Links */}
            <a
              href="https://www.bybit.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-1 py-2 text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              BYBIT
            </a>
            <a
              href="https://www.binance.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-1 py-2 text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              币安
            </a>
            <a
              href="https://www.okx.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-1 py-2 text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              欧易
            </a>
            
            {/* Divider */}
            <div className="h-6 w-px bg-gray-300"></div>
            
            {/* User Dropdown */}
            <div className="relative" ref={userDropdownRef}>
              <button
                onMouseEnter={() => {
                  setShowUserDropdown(true);
                  fetchUserInfo();
                }}>
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
              </button>

              {/* Dropdown Menu */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  {/* User Info Header */}
                  <div className="px-4 py-3 border-b border-gray-200">
                    {isLoadingUserInfo ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      </div>
                    ) : (
                      <>
                        <div className="text-gray-900">{displayName}</div>
                        <div className="text-gray-500 text-sm">{displaySubline}</div>
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <div className="text-sm text-gray-500">总净值</div>
                          <div className="text-green-600 font-semibold">{formattedEquity}</div>
                        </div>
                      </>
                    )}
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
                        // 在新标签页中打开个人资料页面
                        const params = new URLSearchParams({ page: 'profile' });
                        window.open(`${window.location.origin}${window.location.pathname}?${params.toString()}`, '_blank');
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-900"
                    >
                      <User className="w-4 h-4" />
                      个人资料
                    </button>

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        // 在新标签页中打开修改密码页面
                        const params = new URLSearchParams({ page: 'change-password' });
                        window.open(`${window.location.origin}${window.location.pathname}?${params.toString()}`, '_blank');
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
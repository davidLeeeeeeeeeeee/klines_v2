import { useState, useRef, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, X, AlertCircle, Search, ChevronDown, RefreshCw } from 'lucide-react';
import { useClickOutside } from '../hooks/useClickOutside';
import { getAccountList, AccountListReq, AccountRes, getStrategyModelList, StrategyModelListRes, bindAccountStrategy, StrategyModelBindReq } from '../services/api';
import { getToken } from '../utils/storage';

type InitStatus = '已初始化' | '未初始化' | '初始化失败';

// 交易所图标映射
const ExchangeIcon = ({ exchange }: { exchange: string }) => {
  const iconClass = "w-6 h-6 rounded-full flex items-center justify-center text-white text-xs";
  
  const exchangeStyles: { [key: string]: { bg: string; text: string } } = {
    'Binance': { bg: 'bg-yellow-500', text: 'BN' },
    'Bybit': { bg: 'bg-orange-500', text: 'BY' },
    'OKX': { bg: 'bg-gray-800', text: 'OK' },
    'Gate': { bg: 'bg-blue-600', text: 'GT' },
    'MEXC': { bg: 'bg-green-600', text: 'MX' },
    'Bitget': { bg: 'bg-cyan-500', text: 'BG' }
  };
  
  const style = exchangeStyles[exchange] || { bg: 'bg-gray-500', text: '??' };
  
  return (
    <div className={`${iconClass} ${style.bg}`}>
      {style.text}
    </div>
  );
};

export interface TradingAccount {
  id: string;
  exchange: string;
  uid: string;
  accountName: string;
  apiKey: string;
  apiSecret: string;
  initStatus: InitStatus;
  netValue: string;
  initialNetValue: string;
  createdAt: string;
  username: string;
  strategyName?: string;
  accountType: '主账户' | '子账户';
  parentAccountId?: string;
  // 主账户信息（仅子账户有）
  mainAccId?: string;
  mainAccName?: string;
  mainAccUid?: string;
}

interface TradingAccountsProps {
  onNavigateToCreate?: () => void;
  onNavigateToEdit?: (account: TradingAccount) => void;
  onNavigateToInit?: (account: TradingAccount, subAccountCount: number) => void;
  onNavigateToTransfer?: (account: TradingAccount) => void;
}

export function TradingAccounts({ onNavigateToCreate, onNavigateToEdit, onNavigateToInit, onNavigateToTransfer }: TradingAccountsProps) {
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(null);
  const [visibleSecrets, setVisibleSecrets] = useState<{ [key: string]: boolean }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterExchange, setFilterExchange] = useState<string>('all');
  const [filterAccountType, setFilterAccountType] = useState<string>('all');
  const [filterStrategyFollow, setFilterStrategyFollow] = useState<string>('all');
  const [showExchangeDropdown, setShowExchangeDropdown] = useState(false);
  const [showAccountTypeDropdown, setShowAccountTypeDropdown] = useState(false);
  const [showStrategyFollowDropdown, setShowStrategyFollowDropdown] = useState(false);
  const [showStrategyModal, setShowStrategyModal] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [strategies, setStrategies] = useState<StrategyModelListRes[]>([]);
  const [strategiesLoading, setStrategiesLoading] = useState(false);
  const [bindingStrategy, setBindingStrategy] = useState(false);

  // Refs for click outside detection
  const exchangeDropdownRef = useRef<HTMLDivElement>(null);
  const strategyModalRef = useRef<HTMLDivElement>(null);

  // Click outside handlers
  useClickOutside(exchangeDropdownRef, () => setShowExchangeDropdown(false));
  useClickOutside(strategyModalRef, () => {
    if (showStrategyModal) {
      setShowStrategyModal(false);
      setSelectedStrategyId(null);
    }
  });

  // 将API返回的数据转换为组件使用的格式
  const convertApiDataToTradingAccount = (apiAccount: AccountRes): TradingAccount => {
    return {
      id: apiAccount.id.toString(),
      exchange: apiAccount.exchange,
      uid: apiAccount.uid,
      accountName: apiAccount.name,
      apiKey: '', // API不返回敏感信息
      apiSecret: '', // API不返回敏感信息
      initStatus: apiAccount.init ? '已初始化' : '未初始化',
      netValue: apiAccount.equity.toFixed(2),
      initialNetValue: apiAccount.initEquity.toFixed(2),
      createdAt: apiAccount.createTime,
      username: '', // API响应中没有username字段
      strategyName: apiAccount.strategyTypeName || apiAccount.strategyType || undefined,
      accountType: apiAccount.accType === 0 ? '主账户' : '子账户',
      parentAccountId: apiAccount.mainAccId > 0 ? apiAccount.mainAccId.toString() : undefined,
      // 保存主账户信息（仅子账户有）
      mainAccId: apiAccount.mainAccId > 0 ? apiAccount.mainAccId.toString() : undefined,
      mainAccName: apiAccount.mainAccName || undefined,
      mainAccUid: apiAccount.mainAccUid || undefined
    };
  };

  // 获取账户列表
  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) {
        throw new Error('未登录，请先登录');
      }

      // 构建请求参数 - 所有参数都必须传递，使用默认值表示不筛选
      const request: AccountListReq = {
        accType: filterAccountType === 'all' ? 0 : (filterAccountType === '主账户' ? 0 : 1),
        exchange: filterExchange === 'all' ? '' : filterExchange,
        search: searchTerm || '',
        strategyType: (filterStrategyFollow === 'all' || filterStrategyFollow === '已跟随' || filterStrategyFollow === '未跟随')
          ? ''
          : filterStrategyFollow
      };

      const data = await getAccountList(token, request);
      const convertedAccounts = data.map(convertApiDataToTradingAccount);
      setAccounts(convertedAccounts);
    } catch (err: any) {
      setError(err.message || '获取账户列表失败');
      console.error('获取账户列表失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时获取数据
  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchAccounts().finally(() => {
      setIsRefreshing(false);
    });
  };

  // Calculate sub-account count for each main account
  const getSubAccountCount = (mainAccountId: string) => {
    return accounts.filter(acc => acc.parentAccountId === mainAccountId).length;
  };

  // Get parent account name for sub-accounts
  const getParentAccountName = (parentAccountId?: string) => {
    if (!parentAccountId) return '';
    const parentAccount = accounts.find(acc => acc.id === parentAccountId);
    return parentAccount?.accountName || '';
  };

  // 获取策略列表
  const fetchStrategies = async () => {
    setStrategiesLoading(true);
    try {
      const token = getToken();
      if (!token) {
        throw new Error('未登录，请先登录');
      }

      const data = await getStrategyModelList(token);
      setStrategies(data);
    } catch (err: any) {
      console.error('获取策略列表失败:', err);
      alert(err.message || '获取策略列表失败');
    } finally {
      setStrategiesLoading(false);
    }
  };

  // 当打开策略选择弹窗时获取策略列表
  useEffect(() => {
    if (showStrategyModal && strategies.length === 0) {
      fetchStrategies();
    }
  }, [showStrategyModal]);

  const handleCreateAccount = () => {
    if (onNavigateToCreate) {
      onNavigateToCreate();
    }
  };

  const handleEditAccount = (account: TradingAccount) => {
    if (onNavigateToEdit) {
      onNavigateToEdit(account);
    }
  };

  const handleDeleteAccount = (accountId: string) => {
    setDeletingAccountId(accountId);
    setShowDeleteConfirmModal(true);
  };

  const handleDeleteConfirm = () => {
    if (deletingAccountId) {
      setAccounts(accounts.filter(acc => acc.id !== deletingAccountId));
      setShowDeleteConfirmModal(false);
      alert('交易账户已删除');
    }
  };

  const toggleSecretVisibility = (accountId: string) => {
    setVisibleSecrets(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  const maskSecret = (secret: string, visible: boolean) => {
    if (visible) return secret;
    return '••••••••••••••••••••••••••••••••';
  };

  const getStatusBadgeColor = (status: InitStatus) => {
    switch (status) {
      case '已初始化':
        return 'bg-green-100 text-green-600';
      case '未初始化':
        return 'bg-yellow-100 text-yellow-600';
      case '初始化失败':
        return 'bg-red-100 text-red-600';
    }
  };

  // 前端额外筛选（策略跟随状态）
  const filteredAccounts = accounts.filter(account => {
    if (filterStrategyFollow === '已跟随' && !account.strategyName) {
      return false;
    }
    if (filterStrategyFollow === '未跟随' && account.strategyName) {
      return false;
    }
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-semibold text-gray-900">账户管理</h1>
            <button
              onClick={handleRefresh}
              className={`p-2 text-gray-400 hover:text-gray-600 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
              title="刷新"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-500">管理交易所账户和API密钥</p>
        </div>
        <button
          onClick={handleCreateAccount}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          绑定账户
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-700 hover:text-red-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6">
        {/* Search */}
        <div className="relative flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="搜索账户UID、账户名称..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleRefresh();
                }
              }}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            />
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400"
          >
            {loading ? '搜索中...' : '搜索'}
          </button>
        </div>
      </div>

      {/* Exchange, Account Type, and Strategy Follow Filters */}
      <div className="mb-6 flex items-center gap-6">
        {/* Exchange Filter */}
        <div className="relative" ref={exchangeDropdownRef}>
          <button
            onClick={() => {
              setShowExchangeDropdown(!showExchangeDropdown);
              setShowAccountTypeDropdown(false);
              setShowStrategyFollowDropdown(false);
            }}
            className="flex items-center gap-1.5 text-base text-gray-700 hover:text-gray-900 transition-colors"
          >
            <span>{filterExchange === 'all' ? '交易所' : filterExchange}</span>
            <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor" className="text-gray-500">
              <path d="M5 6L0 0h10L5 6z" />
            </svg>
          </button>

          {showExchangeDropdown && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-20 min-w-[140px]">
              <button
                onClick={() => {
                  setFilterExchange('all');
                  setShowExchangeDropdown(false);
                  setTimeout(() => fetchAccounts(), 100);
                }}
                className={`w-full px-4 py-2 text-left text-base hover:bg-gray-50 transition-colors ${
                  filterExchange === 'all' ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                }`}
              >
                全部
              </button>
              <button
                onClick={() => {
                  setFilterExchange('Binance');
                  setShowExchangeDropdown(false);
                  setTimeout(() => fetchAccounts(), 100);
                }}
                className={`w-full px-4 py-2 text-left text-base hover:bg-gray-50 transition-colors ${
                  filterExchange === 'Binance' ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                }`}
              >
                Binance
              </button>
              <button
                onClick={() => {
                  setFilterExchange('Bybit');
                  setShowExchangeDropdown(false);
                  setTimeout(() => fetchAccounts(), 100);
                }}
                className={`w-full px-4 py-2 text-left text-base hover:bg-gray-50 transition-colors ${
                  filterExchange === 'Bybit' ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                }`}
              >
                Bybit
              </button>
              <button
                onClick={() => {
                  setFilterExchange('OKX');
                  setShowExchangeDropdown(false);
                  setTimeout(() => fetchAccounts(), 100);
                }}
                className={`w-full px-4 py-2 text-left text-base hover:bg-gray-50 transition-colors ${
                  filterExchange === 'OKX' ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                }`}
              >
                OKX
              </button>
              <button
                onClick={() => {
                  setFilterExchange('Gate');
                  setShowExchangeDropdown(false);
                  setTimeout(() => fetchAccounts(), 100);
                }}
                className={`w-full px-4 py-2 text-left text-base hover:bg-gray-50 transition-colors ${
                  filterExchange === 'Gate' ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                }`}
              >
                Gate
              </button>
              <button
                onClick={() => {
                  setFilterExchange('MEXC');
                  setShowExchangeDropdown(false);
                  setTimeout(() => fetchAccounts(), 100);
                }}
                className={`w-full px-4 py-2 text-left text-base hover:bg-gray-50 transition-colors ${
                  filterExchange === 'MEXC' ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                }`}
              >
                MEXC
              </button>
            </div>
          )}
        </div>

        {/* Account Type Filter */}
        <div className="relative">
          <button
            onClick={() => {
              setShowAccountTypeDropdown(!showAccountTypeDropdown);
              setShowExchangeDropdown(false);
              setShowStrategyFollowDropdown(false);
            }}
            className="flex items-center gap-1.5 text-base text-gray-700 hover:text-gray-900 transition-colors"
          >
            <span>{filterAccountType === 'all' ? '账户类型' : filterAccountType}</span>
            <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor" className="text-gray-500">
              <path d="M5 6L0 0h10L5 6z" />
            </svg>
          </button>

          {showAccountTypeDropdown && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-20 min-w-[140px]">
              <button
                onClick={() => {
                  setFilterAccountType('all');
                  setShowAccountTypeDropdown(false);
                  setTimeout(() => fetchAccounts(), 100);
                }}
                className={`w-full px-4 py-2 text-left text-base hover:bg-gray-50 transition-colors ${
                  filterAccountType === 'all' ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                }`}
              >
                全部
              </button>
              <button
                onClick={() => {
                  setFilterAccountType('主账户');
                  setShowAccountTypeDropdown(false);
                  setTimeout(() => fetchAccounts(), 100);
                }}
                className={`w-full px-4 py-2 text-left text-base hover:bg-gray-50 transition-colors ${
                  filterAccountType === '主账户' ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                }`}
              >
                主账户
              </button>
              <button
                onClick={() => {
                  setFilterAccountType('子账户');
                  setShowAccountTypeDropdown(false);
                  setTimeout(() => fetchAccounts(), 100);
                }}
                className={`w-full px-4 py-2 text-left text-base hover:bg-gray-50 transition-colors ${
                  filterAccountType === '子账户' ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                }`}
              >
                子账户
              </button>
            </div>
          )}
        </div>

        {/* Strategy Follow Filter */}
        <div className="relative">
          <button
            onClick={() => {
              setShowStrategyFollowDropdown(!showStrategyFollowDropdown);
              setShowExchangeDropdown(false);
              setShowAccountTypeDropdown(false);
            }}
            className="flex items-center gap-1.5 text-base text-gray-700 hover:text-gray-900 transition-colors"
          >
            <span>{filterStrategyFollow === 'all' ? '策略跟随' : filterStrategyFollow === '已跟随' ? '已跟随' : filterStrategyFollow === '未跟随' ? '未跟随' : filterStrategyFollow}</span>
            <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor" className="text-gray-500">
              <path d="M5 6L0 0h10L5 6z" />
            </svg>
          </button>

          {showStrategyFollowDropdown && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-20 min-w-[140px]">
              <button
                onClick={() => {
                  setFilterStrategyFollow('all');
                  setShowStrategyFollowDropdown(false);
                }}
                className={`w-full px-4 py-2 text-left text-base hover:bg-gray-50 transition-colors ${
                  filterStrategyFollow === 'all' ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                }`}
              >
                全部
              </button>
              <button
                onClick={() => {
                  setFilterStrategyFollow('已跟随');
                  setShowStrategyFollowDropdown(false);
                }}
                className={`w-full px-4 py-2 text-left text-base hover:bg-gray-50 transition-colors ${
                  filterStrategyFollow === '已跟随' ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                }`}
              >
                已跟随
              </button>
              <button
                onClick={() => {
                  setFilterStrategyFollow('未跟随');
                  setShowStrategyFollowDropdown(false);
                }}
                className={`w-full px-4 py-2 text-left text-base hover:bg-gray-50 transition-colors ${
                  filterStrategyFollow === '未跟随' ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                }`}
              >
                未跟随
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Accounts List */}
      <div className="space-y-4 flex-1 overflow-y-auto">
        {loading ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-500 mb-4">加载中...</div>
            <div className="flex justify-center">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          </div>
        ) : filteredAccounts.length === 0 && !error ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-500 mb-4">还没有添加任何交易账户</div>
            <button
              onClick={handleCreateAccount}
              className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              添加第一个账户
            </button>
          </div>
        ) : (
          filteredAccounts.map((account) => (
          <div key={account.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 relative">
            {/* Strategy Name - Top Right Corner - Only for Sub Accounts */}
            {account.accountType === '子账户' && (
              <button
                onClick={() => {
                  setSelectedAccountId(account.id);
                  setShowStrategyModal(true);
                }}
                className="absolute top-4 right-4 text-sm hover:opacity-80 transition-opacity flex items-center gap-1"
              >
                {account.strategyName ? (
                  <span className="text-blue-500">{account.strategyName} &gt;</span>
                ) : (
                  <span className="text-red-600">暂未跟随策略 &gt;</span>
                )}
              </button>
            )}

            {/* Account Name with Status */}
            <div className="flex items-center justify-between mb-4 pr-24">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg text-gray-900">{account.accountName}</h3>
                  <span className={`px-3 py-1 rounded-2xl text-sm ${getStatusBadgeColor(account.initStatus)}`}>
                    {account.initStatus}
                  </span>
                  <span className={`px-3 py-1 rounded-2xl text-sm ${
                    account.accountType === '主账户'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    {account.accountType}
                  </span>
                </div>
                <div className="text-sm text-gray-500 mt-0.5">{account.exchange}: {account.uid}</div>
              </div>
            </div>

            {/* Account Info Grid - Label above value */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">当前净值</div>
                <div className="text-green-600">{account.netValue}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">初始净值</div>
                <div className="text-gray-900">{account.initialNetValue}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">创建时间</div>
                <div className="text-gray-900">{account.createdAt}</div>
              </div>
            </div>

            {/* Error Message */}
            {account.initStatus === '初始化失败' && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-700">
                  <div className="mb-1">初始化失败</div>
                  <div className="text-red-600 text-xs">请检查API Key和Secret是否正确，或联系管理员</div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              {account.accountType === '子账户' && (
                <>
                  <div className="flex-1 text-sm text-gray-600">
                    主账户: {getParentAccountName(account.parentAccountId)}
                  </div>
                  <button
                    onClick={() => {
                      if (onNavigateToTransfer) {
                        onNavigateToTransfer(account);
                      }
                    }}
                    className="px-4 py-1.5 text-sm border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    划转
                  </button>
                </>
              )}
              {account.accountType === '主账户' && (
                <>
                  <div className="flex-1 text-sm text-gray-600">
                    子账户数: {getSubAccountCount(account.id)}
                  </div>
                  <button
                    onClick={() => {
                      if (onNavigateToInit) {
                        onNavigateToInit(account, getSubAccountCount(account.id));
                      }
                    }}
                    className="px-4 py-1.5 text-sm border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    子账户
                  </button>
                </>
              )}
              <button
                onClick={() => handleEditAccount(account)}
                className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                编辑
              </button>
              <button
                onClick={() => handleDeleteAccount(account.id)}
                className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                删除
              </button>
            </div>
          </div>
          ))
        )}
      </div>

      {/* Delete Confirm Modal */}
      {showDeleteConfirmModal && deletingAccountId && (
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
                <h2 className="text-xl font-semibold text-gray-900">确认删除</h2>
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
                确定要删除交易账户 "{accounts.find(acc => acc.id === deletingAccountId)?.accountName}" 吗？此操作不可撤销。
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

      {/* Strategy Selection Modal */}
      {showStrategyModal && selectedAccountId && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/30 flex items-end justify-center z-50">
          <div
            ref={strategyModalRef}
            className="bg-white rounded-t-3xl shadow-xl p-6 w-full max-w-4xl h-[85vh] flex flex-col animate-slide-up"
            style={{
              animation: 'slideUp 0.3s ease-out'
            }}
          >
            {/* Modal Header */}
            <div className="mb-6 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">选择策��</h2>
                <button
                  onClick={() => {
                    setShowStrategyModal(false);
                    setSelectedStrategyId(null);
                  }}
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
              {strategiesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-gray-500">加载策略列表中...</div>
                </div>
              ) : strategies.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-gray-500">暂无可用策略</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {strategies.map((strategy) => {
                    const winRate = strategy.winCount && strategy.lossCount
                      ? ((strategy.winCount / (strategy.winCount + strategy.lossCount)) * 100).toFixed(1)
                      : '0.0';
                    const totalPnl = strategy.totalClosePnl || 0;
                    const profitRate = totalPnl >= 0 ? `+${totalPnl.toFixed(2)}` : totalPnl.toFixed(2);

                    return (
                      <div
                        key={strategy.id}
                        onClick={() => setSelectedStrategyId(strategy.id.toString())}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedStrategyId === strategy.id.toString()
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">{strategy.name}</h3>
                          <span className={`px-2 py-1 text-xs rounded ${
                            strategy.status
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {strategy.status ? '运行中' : '已停止'}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">总盈亏</span>
                            <span className={`text-sm font-semibold ${
                              totalPnl >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {profitRate} USDT
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">胜率</span>
                            <span className="text-sm font-semibold text-gray-900">{winRate}%</span>
                          </div>
                          {strategy.maxDrawdownRate !== null && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">最大回撤</span>
                              <span className="text-sm font-semibold text-red-600">
                                {(strategy.maxDrawdownRate * 100).toFixed(2)}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowStrategyModal(false);
                  setSelectedStrategyId(null);
                }}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!selectedStrategyId || !selectedAccountId) return;

                  setBindingStrategy(true);
                  try {
                    const token = getToken();
                    if (!token) {
                      throw new Error('未登录，请先登录');
                    }

                    const strategy = strategies.find(s => s.id.toString() === selectedStrategyId);
                    if (!strategy) {
                      throw new Error('未找到选中的策略');
                    }

                    // 调用绑定接口
                    const request: StrategyModelBindReq = {
                      accountId: parseInt(selectedAccountId),
                      strategyModelName: strategy.name
                    };

                    await bindAccountStrategy(token, request);

                    // 更新本地账户数据
                    setAccounts(accounts.map(acc =>
                      acc.id === selectedAccountId
                        ? { ...acc, strategyName: strategy.name }
                        : acc
                    ));

                    alert(`已成功绑定策略: ${strategy.name}`);
                    setShowStrategyModal(false);
                    setSelectedStrategyId(null);

                    // 刷新账户列表以获取最新数据
                    fetchAccounts();
                  } catch (err: any) {
                    console.error('绑定策略失败:', err);
                    alert(err.message || '绑定策略失败');
                  } finally {
                    setBindingStrategy(false);
                  }
                }}
                disabled={!selectedStrategyId || bindingStrategy}
                className={`flex-1 px-6 py-3 rounded-lg transition-colors ${
                  selectedStrategyId && !bindingStrategy
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {bindingStrategy ? '绑定中...' : '立即跟随'}
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
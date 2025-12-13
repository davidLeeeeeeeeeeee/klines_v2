import { useState, useRef } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, X, AlertCircle, Search, ChevronDown, RefreshCw } from 'lucide-react';
import { useClickOutside } from '../hooks/useClickOutside';

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
  createdAt: string;
  username: string;
  strategyName?: string;
}

interface TradingAccountsProps {
  onNavigateToCreate?: () => void;
  onNavigateToEdit?: (account: TradingAccount) => void;
}

export function TradingAccounts({ onNavigateToCreate, onNavigateToEdit }: TradingAccountsProps) {
  const [accounts, setAccounts] = useState<TradingAccount[]>([
    {
      id: '1',
      exchange: 'Binance',
      uid: 'BN12345678',
      accountName: '主交易账户',
      apiKey: 'aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890',
      apiSecret: '1234567890aBcDeFgHiJkLmNoPqRsTuVwXyZ',
      initStatus: '已初始化',
      netValue: '10000.00',
      createdAt: '2024-01-15 10:30:25',
      username: 'admin',
      strategyName: '趋势追踪策略'
    },
    {
      id: '2',
      exchange: 'OKX',
      uid: 'OKX98765432',
      accountName: '备用账户',
      apiKey: 'ZyXwVuTsRqPoNmLkJiHgFeDcBa0987654321',
      apiSecret: '0987654321ZyXwVuTsRqPoNmLkJiHgFeDcBa',
      initStatus: '已初始化',
      netValue: '5000.00',
      createdAt: '2024-02-20 14:22:10',
      username: 'user1',
      strategyName: '网格交易策略'
    },
    {
      id: '3',
      exchange: 'Bybit',
      uid: 'BYB11223344',
      accountName: '测试账户',
      apiKey: 'TeSt1234567890aBcDeFgHiJkLmNoPqRsT',
      apiSecret: 'TeSt0987654321ZyXwVuTsRqPoNmLkJiH',
      initStatus: '未初始化',
      netValue: '0.00',
      createdAt: '2024-03-10 09:15:33',
      username: 'test'
    },
    {
      id: '4',
      exchange: 'Gate',
      uid: 'GT55667788',
      accountName: '策略账户A',
      apiKey: 'GaTe1234567890aBcDeFgHiJkLmNoPq',
      apiSecret: 'GaTe0987654321ZyXwVuTsRqPoNmLk',
      initStatus: '已初始化',
      netValue: '8000.00',
      createdAt: '2024-03-15 16:45:50',
      username: 'strategy'
    },
    {
      id: '5',
      exchange: 'MEXC',
      uid: 'MX11223344',
      accountName: '备用账户B',
      apiKey: 'MeXc1234567890aBcDeFgHiJkLmNoPqRsT',
      apiSecret: 'MeXc0987654321ZyXwVuTsRqPoNmLkJiH',
      initStatus: '已初始化',
      netValue: '3500.00',
      createdAt: '2024-04-01 11:20:15',
      username: 'user2',
      strategyName: '套利策略'
    }
  ]);

  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(null);
  const [visibleSecrets, setVisibleSecrets] = useState<{ [key: string]: boolean }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterExchange, setFilterExchange] = useState<string>('all');
  const [showExchangeDropdown, setShowExchangeDropdown] = useState(false);
  const [showStrategyModal, setShowStrategyModal] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  // Mock strategies data
  const strategies = [
    {
      id: '1',
      name: '趋势追踪策略',
      profitRate: '+25.8%',
      winRate: '68%'
    },
    {
      id: '2',
      name: '网格交易策略',
      profitRate: '+18.3%',
      winRate: '72%'
    },
    {
      id: '3',
      name: '套利策略',
      profitRate: '+12.5%',
      winRate: '85%'
    },
    {
      id: '4',
      name: '高频交易策略',
      profitRate: '+32.1%',
      winRate: '61%'
    },
    {
      id: '5',
      name: '波段交易策略',
      profitRate: '+15.7%',
      winRate: '65%'
    },
    {
      id: '6',
      name: '动量交易策略',
      profitRate: '+22.4%',
      winRate: '70%'
    }
  ];

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

  const filteredAccounts = accounts.filter(account => {
    if (filterExchange !== 'all' && account.exchange !== filterExchange) {
      return false;
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchesUsername = account.username.toLowerCase().includes(term);
      const matchesUid = account.uid.toLowerCase().includes(term);
      const matchesAccountName = account.accountName.toLowerCase().includes(term);
      if (!matchesUsername && !matchesUid && !matchesAccountName) {
        return false;
      }
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

      {/* Filters */}
      <div className="mb-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="搜索用户名、账户UID、账户名称..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          />
        </div>
      </div>

      {/* Exchange Filter */}
      <div className="mb-6">
        <div className="relative" ref={exchangeDropdownRef}>
          <button
            onClick={() => setShowExchangeDropdown(!showExchangeDropdown)}
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
      </div>

      {/* Accounts List */}
      <div className="space-y-4">
        {filteredAccounts.map((account) => (
          <div key={account.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 relative">
            {/* Strategy Name - Top Right Corner */}
            <div className="absolute top-4 right-4 text-sm">
              {account.strategyName ? (
                <span className="text-gray-500">{account.strategyName}</span>
              ) : (
                <span className="text-red-500">未跟随</span>
              )}
            </div>

            {/* Account Name with Status */}
            <div className="flex items-center justify-between mb-4 pr-24">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <ExchangeIcon exchange={account.exchange} />
                  <h3 className="text-lg text-gray-900">{account.accountName}</h3>
                  <span className={`px-3 py-1 rounded-2xl text-sm ${getStatusBadgeColor(account.initStatus)}`}>
                    {account.initStatus}
                  </span>
                </div>
                <div className="text-sm text-gray-500 mt-0.5">{account.uid}</div>
              </div>
            </div>
            
            {/* Account Info Grid - Label above value */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">净值</div>
                <div className="text-green-600">¥{account.netValue}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">API Key</div>
                <div className="text-gray-900">{account.apiKey.substring(0, 3)}......{account.apiKey.substring(account.apiKey.length - 3)}</div>
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
              <button
                onClick={() => {
                  setSelectedAccountId(account.id);
                  setShowStrategyModal(true);
                }}
                className="px-4 py-1.5 text-sm border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors"
              >
                跟随策略
              </button>
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
        ))}

        {filteredAccounts.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-500 mb-4">还没有添加任何交易账户</div>
            <button
              onClick={handleCreateAccount}
              className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              加第一个账户
            </button>
          </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {strategies.map((strategy) => (
                  <div
                    key={strategy.id}
                    onClick={() => setSelectedStrategyId(strategy.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedStrategyId === strategy.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{strategy.name}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">收益率(30日)</span>
                        <span className="text-sm font-semibold text-green-600">{strategy.profitRate}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">胜率(30日)</span>
                        <span className="text-sm font-semibold text-gray-900">{strategy.winRate}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                onClick={() => {
                  if (selectedStrategyId) {
                    const strategy = strategies.find(s => s.id === selectedStrategyId);
                    if (strategy) {
                      setAccounts(accounts.map(acc => 
                        acc.id === selectedAccountId 
                          ? { ...acc, strategyName: strategy.name }
                          : acc
                      ));
                      alert(`已设置跟随策略: ${strategy.name}`);
                    }
                  }
                  setShowStrategyModal(false);
                  setSelectedStrategyId(null);
                }}
                disabled={!selectedStrategyId}
                className={`flex-1 px-6 py-3 rounded-lg transition-colors ${
                  selectedStrategyId
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                立即跟随
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
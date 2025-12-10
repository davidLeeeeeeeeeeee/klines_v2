import { useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, X, AlertCircle, Search, ChevronDown } from 'lucide-react';

type InitStatus = '已初始化' | '未初始化' | '初始化失败';

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
      username: 'admin'
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
      username: 'user1'
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
      exchange: 'Bitget',
      uid: 'BG55667788',
      accountName: '策略账户',
      apiKey: 'BiTgEt1234567890aBcDeFgHiJkLmNoPq',
      apiSecret: 'BiTgEt0987654321ZyXwVuTsRqPoNmLk',
      initStatus: '初始化失败',
      netValue: '0.00',
      createdAt: '2024-03-15 16:45:50',
      username: 'strategy'
    }
  ]);

  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(null);
  const [visibleSecrets, setVisibleSecrets] = useState<{ [key: string]: boolean }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterExchange, setFilterExchange] = useState<string>('all');
  const [showExchangeDropdown, setShowExchangeDropdown] = useState(false);

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
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">账户管理</h1>
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
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="搜索用户名、账户UID、账户名称..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      {/* Exchange Filter */}
      <div className="mb-6">
        <div className="relative">
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
                  setFilterExchange('Huobi');
                  setShowExchangeDropdown(false);
                }}
                className={`w-full px-4 py-2 text-left text-base hover:bg-gray-50 transition-colors ${
                  filterExchange === 'Huobi' ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                }`}
              >
                Huobi
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Accounts List */}
      <div className="space-y-4">
        {filteredAccounts.map((account) => (
          <div key={account.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4">
            {/* Account Name with Status and Net Value */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg text-gray-900">{account.accountName}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusBadgeColor(account.initStatus)}`}>
                    {account.initStatus}
                  </span>
                </div>
                <div className="text-sm text-gray-500 mt-0.5">{account.exchange}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">净值</div>
                <div className="text-lg text-green-600 font-semibold">¥{account.netValue}</div>
              </div>
            </div>
            
            {/* Account Info Grid - Label above value */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">UID</div>
                <div className="text-gray-900">{account.uid}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">API Key</div>
                <div className="text-gray-900">{account.apiKey.substring(0, 3)}......{account.apiKey.substring(account.apiKey.length - 3)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1 text-right">创建时间</div>
                <div className="text-gray-900 text-right">{account.createdAt}</div>
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
        <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-gray-900">确认删除</h2>
              <button
                onClick={() => setShowDeleteConfirmModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 text-gray-600">
              确定要删除交易账户 "{accounts.find(acc => acc.id === deletingAccountId)?.accountName}" 吗？此操作不可撤销。
            </div>

            <div className="flex gap-3 px-6 pb-6">
              <button
                type="button"
                onClick={() => setShowDeleteConfirmModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
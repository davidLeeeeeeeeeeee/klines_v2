import { useState, useEffect } from 'react';
import { getAccountList, AccountListReq, AccountRes } from '../services/api';
import { getToken } from '../utils/storage';

/**
 * 账户列表使用示例组件
 * 
 * 这个组件展示了如何使用 getAccountList API
 */
export function AccountListExample() {
  const [accounts, setAccounts] = useState<AccountRes[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 筛选条件 - 使用默认值
  const [accountTypeFilter, setAccountTypeFilter] = useState<'all' | '0' | '1'>('all');
  const [filters, setFilters] = useState<AccountListReq>({
    accType: 0, // 0=主账号，1=子账号，传0表示不筛选
    exchange: '', // 交易所类型，如 'BYBIT'，空字符串表示不筛选
    search: '', // 搜索关键字，空字符串表示不搜索
    strategyType: '', // 策略类型，空字符串表示不筛选
  });

  // 获取账户列表
  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) {
        throw new Error('未登录，请先登录');
      }

      // 调用API获取账户列表
      const data = await getAccountList(token, filters);
      setAccounts(data);
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">账户列表示例</h1>

      {/* 筛选条件 */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">筛选条件</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 账号类型 */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">账号类型</label>
            <select
              value={accountTypeFilter}
              onChange={(e) => {
                const value = e.target.value as 'all' | '0' | '1';
                setAccountTypeFilter(value);
                setFilters({
                  ...filters,
                  accType: value === 'all' ? 0 : Number(value)
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">全部</option>
              <option value="0">主账号</option>
              <option value="1">子账号</option>
            </select>
          </div>

          {/* 交易所 */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">交易所</label>
            <input
              type="text"
              value={filters.exchange}
              onChange={(e) => setFilters({ ...filters, exchange: e.target.value })}
              placeholder="如: BYBIT"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          {/* 搜索 */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">搜索</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="搜索账户名或UID"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          {/* 策略类型 */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">策略类型</label>
            <input
              type="text"
              value={filters.strategyType}
              onChange={(e) => setFilters({ ...filters, strategyType: e.target.value })}
              placeholder="策略类型"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <button
          onClick={fetchAccounts}
          disabled={loading}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? '加载中...' : '查询'}
        </button>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* 账户列表 */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">账户名</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">UID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">类型</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">交易所</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">净值</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">初始净值</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">策略</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">状态</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                  加载中...
                </td>
              </tr>
            ) : accounts.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                  暂无数据
                </td>
              </tr>
            ) : (
              accounts.map((account) => (
                <tr key={account.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{account.id}</td>
                  <td className="px-4 py-3 text-sm">{account.name}</td>
                  <td className="px-4 py-3 text-sm font-mono">{account.uid}</td>
                  <td className="px-4 py-3 text-sm">
                    {account.accType === 0 ? '主账号' : '子账号'}
                    {account.accType === 0 && account.subAccCount > 0 && (
                      <span className="ml-2 text-xs text-gray-500">({account.subAccCount}个子账户)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">{account.exchange}</td>
                  <td className="px-4 py-3 text-sm">{account.equity.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm">{account.initEquity.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm">{account.strategyTypeName || account.strategyType}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${account.init ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {account.init ? '已初始化' : '未初始化'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


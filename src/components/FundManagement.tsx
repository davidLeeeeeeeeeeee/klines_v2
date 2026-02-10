import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, DollarSign, TrendingUp } from 'lucide-react';
import { getFundDetail, FundRes, FundAccountRes } from '../services/api';
import { getToken } from '../utils/storage';

export function FundManagement() {
  const [fundData, setFundData] = useState<FundRes | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 获取资金数据
  const fetchFundData = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) {
        setError('未登录，请先登录');
        setIsLoading(false);
        return;
      }

      const data = await getFundDetail(token);
      setFundData(data);
      setError(null);
    } catch (err) {
      console.error('获取资金详情失败:', err);
      setError(err instanceof Error ? err.message : '获取资金详情失败');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // 初始加载
  useEffect(() => {
    fetchFundData();
  }, [fetchFundData]);

  // 刷新
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchFundData();
  };

  // 使用API返回的汇总数据
  const totalNetValue = fundData?.totalEquity || 0;
  const totalInitialNetValue = fundData?.totalInitEquity || 0;
  const totalProfitAmount = fundData?.totalProfit || 0;
  const totalProfitRate = fundData?.totalProfitRate || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={handleRefresh}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Fixed Header Section */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-semibold text-gray-900">资金管理</h1>
              <button
                onClick={handleRefresh}
                className={`p-2 text-gray-400 hover:text-gray-600 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
                title="刷新"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500">查看和管理所有账户的资金情况</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Total Net Value */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-gray-600 text-sm mb-2">总净值</div>
                  <div className="text-green-600 text-2xl mb-1">
                    {totalNetValue.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-900">
                    初始净值：{totalInitialNetValue.toFixed(2)}
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Total Profit */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-gray-600 text-sm mb-2">总收益</div>
                  <div className={`text-2xl mb-1 ${totalProfitAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {totalProfitAmount >= 0 ? '' : '-'}{Math.abs(totalProfitAmount).toFixed(2)}
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${totalProfitAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{totalProfitRate >= 0 ? '' : '-'}{Math.abs(totalProfitRate * 100).toFixed(2)}%</span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${totalProfitAmount >= 0 ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                  <TrendingUp className={`w-6 h-6 ${totalProfitAmount >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accounts List */}
      <div className="space-y-4 flex-1 overflow-y-auto">
        {(fundData?.accountList || []).map((account: FundAccountRes, index: number) => (
          <div key={account.uid || index} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 relative">
            {/* Account Name */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h3 className="text-lg text-gray-900">{account.name}</h3>
                <span className="text-sm text-gray-500">交易所：{account.uid}</span>
              </div>
            </div>

            {/* Account Info Grid - Label above value */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">总净值</div>
                <div className="text-lg text-green-600">{account.totalEquity.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">初始净值</div>
                <div className="text-lg text-gray-900">{account.totalInitEquity.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">总收益</div>
                <div className={`text-lg ${account.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {account.totalProfit >= 0 ? '' : '-'}{Math.abs(account.totalProfit).toFixed(2)} <span className="text-sm">({account.totalProfitRate >= 0 ? '' : '-'}{Math.abs(account.totalProfitRate * 100).toFixed(2)}%)</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {(fundData?.accountList || []).length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-500 mb-4">暂无数据</div>
          </div>
        )}
      </div>
    </div>
  );
}
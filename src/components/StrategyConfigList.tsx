import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, DollarSign, Users, ArrowRight, Plus, Play, Pause, Settings, X, RefreshCw } from 'lucide-react';
import { getStrategyModelList, switchStrategyModelStatus, getSystemDict, StrategyModelListRes, DictItem } from '../services/api';
import { getToken } from '../utils/storage';

interface Strategy {
  id: string;
  name: string;
  description: string;
  returns: number;
  totalReturn: string;
  followers: number;
  winRate: number;
  maxDrawdown: number;
  sharpeRatio: number;
  createDate: string;
  status: string; // 使用字符串类型，存储 API 返回的 status 值（-1, 0, 1）
  tags: string[];
  riskLevel: 'low' | 'medium' | 'high';
  totalFollowingCapital: string;
  runDays: number;
  aiModel: string;
  systemPrompt?: string;
  userPrompt?: string;
  requestFrequency?: number;
  requestFrequencyUnit?: 'seconds' | 'minutes' | 'hours';
}

interface StrategyConfigListProps {
  onViewDetail: (strategyName: string, aiModel?: string, runDays?: number, description?: string) => void;
  onNavigateToConfig: (strategy: Strategy | null) => void;
  strategies: Strategy[];
  onUpdateStrategy: (strategyId: string, updates: Partial<Strategy>) => void;
  onNavigateToAccounts?: () => void;
}

// 将API数据转换为组件数据
function convertApiToStrategy(apiData: StrategyModelListRes): Strategy {
  // 安全地处理可能为null的数值
  const overview = apiData.overview;
  const totalClosePnl = overview?.totalClosePnl ?? 0;
  const totalFund = overview?.totalFund ?? 0;
  const winCount = overview?.winCount ?? 0;
  const lossCount = overview?.lossCount ?? 0;
  const winAmount = overview?.winAmount ?? 0;
  const lossAmount = overview?.lossAmount ?? 0;
  const runDays = apiData.runDays ?? 0;

  // 胜率 = winCount / (winCount + lossCount)
  const winRate = (winCount + lossCount) > 0
    ? Number(((winCount / (winCount + lossCount)) * 100).toFixed(1))
    : 0;

  // 盈亏比 = winAmount / |lossAmount|
  const profitLossRatio = lossAmount !== 0
    ? Number((winAmount / Math.abs(lossAmount)).toFixed(1))
    : 0;

  return {
    id: apiData.id.toString(),
    name: apiData.name,
    description: apiData.description,
    returns: 0, // 总收益率先写0
    totalReturn: totalClosePnl >= 0 ? `+${totalClosePnl.toFixed(2)}` : totalClosePnl.toFixed(2),
    followers: overview?.followAccountNum ?? 0,
    winRate: winRate,
    maxDrawdown: 0, // 最大回撤先写0
    sharpeRatio: profitLossRatio, // 盈亏比
    createDate: new Date().toISOString().split('T')[0],
    status: String(apiData.status ?? 0), // 将状态值转为字符串："-1"=停止, "0"=暂停, "1"=运行中
    tags: apiData.tag ? apiData.tag.split(',').filter(t => t.trim()) : [],
    riskLevel: apiData.riskLevel?.toLowerCase() as 'low' | 'medium' | 'high',
    totalFollowingCapital: totalFund ? `¥${totalFund.toFixed(2)}` : '¥0',
    runDays: runDays,
    aiModel: apiData.aiModel ?? '',
  };
}

export function StrategyConfigList({ onViewDetail, onNavigateToConfig, strategies, onUpdateStrategy, onNavigateToAccounts }: StrategyConfigListProps) {
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [apiStrategies, setApiStrategies] = useState<Strategy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoadedApi, setHasLoadedApi] = useState(false); // 标记是否已经加载过API
  const [activeTab, setActiveTab] = useState<string>('1'); // Tab状态，默认显示运行中（code="1"）
  const [strategyStatusList, setStrategyStatusList] = useState<DictItem[]>([]); // 策略状态字典

  // 加载系统字典
  const loadSystemDict = async () => {
    try {
      const dictData = await getSystemDict();
      if (dictData.StrategyStatus && dictData.StrategyStatus.length > 0) {
        setStrategyStatusList(dictData.StrategyStatus);
        // 默认选中第一个状态
        setActiveTab(dictData.StrategyStatus[0].code);
      }
    } catch (err) {
      console.error('加载系统字典失败:', err);
      // 使用默认值
      setStrategyStatusList([
        { name: 'STOP', code: '-1', message: '停止' },
        { name: 'PAUSE', code: '0', message: '暂停' },
        { name: 'RUNNING', code: '1', message: '运行中' }
      ]);
    }
  };

  // 加载策略列表
  const loadStrategies = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) {
        throw new Error('未找到认证令牌，请重新登录');
      }

      const apiData = await getStrategyModelList(token);
      console.log('📊 API返回的策略列表数据:', apiData);
      const convertedStrategies = apiData.map(convertApiToStrategy);
      console.log('✅ 转换后的策略数据:', convertedStrategies);
      setApiStrategies(convertedStrategies);
      setHasLoadedApi(true); // 标记已经加载过API
    } catch (err) {
      console.error('加载策略列表失败:', err);
      setError(err instanceof Error ? err.message : '加载策略列表失败');
      setHasLoadedApi(true); // 即使失败也标记为已加载
    } finally {
      setIsLoading(false);
    }
  };

  // 组件挂载时加载数据
  useEffect(() => {
    loadSystemDict();
    loadStrategies();
  }, []);

  // 如果已经加载过API，就使用API数据（即使是空数组）；否则使用props传入的默认数据
  const allStrategies = hasLoadedApi ? apiStrategies : strategies;

  // 根据当前Tab过滤策略
  const displayStrategies = allStrategies.filter(strategy => strategy.status === activeTab);

  // 计算每个状态的数量
  const getStatusCount = (statusCode: string) => {
    return allStrategies.filter(s => s.status === statusCode).length;
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadStrategies();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  const handleToggleStatus = async (strategyId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    // 先乐观更新UI（立即更新本地状态）
    const currentStrategy = apiStrategies.find(s => s.id === strategyId);
    if (currentStrategy) {
      // 状态切换逻辑：运行中(1) <-> 暂停(0)
      const newStatus = currentStrategy.status === '1' ? '0' : '1';

      // 立即更新本地状态
      setApiStrategies(prev =>
        prev.map(s => s.id === strategyId ? { ...s, status: newStatus } : s)
      );
    }

    try {
      const token = getToken();
      if (!token) {
        throw new Error('未找到认证令牌，请重新登录');
      }

      // 调用API切换状态
      const result = await switchStrategyModelStatus(token, parseInt(strategyId));
      console.log('切换状态API返回:', result);

      // 刷新列表以确保数据同步
      await loadStrategies();
    } catch (err) {
      console.error('切换策略状态失败:', err);
      alert(err instanceof Error ? err.message : '切换策略状态失败');

      // 如果失败，重新加载列表恢复正确状态
      await loadStrategies();
    }
  };

  const handleSettings = (strategyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const strategy = displayStrategies.find(s => s.id === strategyId);
    if (strategy) {
      onNavigateToConfig(strategy);
    }
  };

  const handleCreateStrategy = () => {
    onNavigateToConfig(null);
  };

  const handleSaveStrategy = (strategyData: Partial<Strategy>) => {
    if (strategyData.id) {
      // Update existing strategy
      onUpdateStrategy(strategyData.id, strategyData);
    } else {
      // Create new strategy
      const newStrategy: Strategy = {
        id: `${strategies.length + 1}`,
        name: strategyData.name || '',
        description: strategyData.description || '',
        returns: 0,
        totalReturn: '+0',
        followers: 0,
        winRate: 0,
        maxDrawdown: 0,
        sharpeRatio: 0,
        createDate: new Date().toISOString().split('T')[0],
        status: '1', // 新创建的策略默认为运行中
        tags: strategyData.tags || [],
        riskLevel: strategyData.riskLevel || 'medium',
        totalFollowingCapital: '¥0',
        runDays: 0,
        aiModel: strategyData.aiModel || '',
        systemPrompt: strategyData.systemPrompt,
        userPrompt: strategyData.userPrompt,
        requestFrequency: strategyData.requestFrequency,
        requestFrequencyUnit: strategyData.requestFrequencyUnit
      };
      onUpdateStrategy(newStrategy.id, newStrategy);
    }
  };

  const calculateRunningDays = (createDate: string) => {
    const days = Math.floor((new Date().getTime() - new Date(createDate).getTime()) / (1000 * 60 * 60 * 24));
    return `${days}天`;
  };

  const handleFollowStrategy = (accountId: string) => {
    if (!accountId) {
      alert('请选择要跟随的交易账户');
      return;
    }
    const strategyName = displayStrategies.find(s => s.id === selectedStrategy)?.name;
    alert(`已成功使用账户跟随策略: ${strategyName}`);
    setShowFollowModal(false);
  };

  // Mock trading accounts
  const tradingAccounts = [
    { id: '1', name: '主账户 - Binance', balance: '¥125,680', uid: 'BN001' },
    { id: '2', name: '备用账户 - OKX', balance: '¥86,420', uid: 'OKX002' },
    { id: '3', name: '测试账户 - Huobi', balance: '¥45,230', uid: 'HB003' }
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Fixed Header Section */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-semibold text-gray-900">策略配置</h1>
              <button
                onClick={handleRefresh}
                className={`p-2 text-gray-400 hover:text-gray-600 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
                title="刷新"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500">浏览和选择AI交易策略</p>
          </div>
          <button
            onClick={handleCreateStrategy}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            创建策略
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-gray-200">
          {strategyStatusList.map((status) => (
            <button
              key={status.code}
              onClick={() => setActiveTab(status.code)}
              className={`px-4 py-2 font-medium transition-colors relative ${
                activeTab === status.code
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {status.message}
              <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                activeTab === status.code
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {getStatusCount(status.code)}
              </span>
              {activeTab === status.code && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto mt-6">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">加载中...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
            <button
              onClick={loadStrategies}
              className="mt-2 text-red-600 hover:text-red-800 underline"
            >
              重试
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && displayStrategies.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Activity className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-gray-900 mb-2">
              暂无{strategyStatusList.find(s => s.code === activeTab)?.message || '该状态'}的策略
            </h3>
            <p className="text-gray-600 text-sm">
              点击右上角"创建策略"按钮开始配置新策略
            </p>
          </div>
        )}

        {/* Strategy Cards Grid */}
        {!isLoading && !error && displayStrategies.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {displayStrategies.map((strategy) => (
            <div
              key={strategy.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              {/* Card Header */}
              <div className="p-6">
                {/* Title and Actions */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="text-gray-900">
                        {strategy.name}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-2xl ${
                        strategy.riskLevel === 'low' 
                          ? 'bg-green-100 text-green-700'
                          : strategy.riskLevel === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {strategy.riskLevel === 'low' ? '低风险' : strategy.riskLevel === 'medium' ? '中等风险' : '高风险'}
                      </span>
                    </div>
                    {/* Strategy Tags */}
                    <div className="flex flex-wrap gap-2">
                      {strategy.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded border border-gray-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Right Actions */}
                  <div className="flex items-center gap-2 ml-3">
                    <button
                      onClick={(e) => handleToggleStatus(strategy.id, e)}
                      className={`p-2 rounded-lg transition-colors ${
                        strategy.status === '1'
                          ? 'bg-gray-700 hover:bg-gray-800 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                      title={strategy.status === '1' ? '暂停' : '启动'}
                    >
                      {strategy.status === '1' ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={(e) => handleSettings(strategy.id, e)}
                      className="p-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-colors"
                      title="配置"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 my-4"></div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <div className="text-gray-600 text-sm mb-1">
                      总收益率
                    </div>
                    <div className={`${strategy.returns >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {strategy.returns >= 0 ? '+' : ''}{strategy.returns}%
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600 text-sm mb-1">
                      总收益额
                    </div>
                    <div className={`${strategy.totalReturn.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {strategy.totalReturn}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-600 text-sm mb-1">
                      最大回撤
                    </div>
                    <div className="text-red-600">
                      -{strategy.maxDrawdown}%
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600 text-sm mb-1">
                      胜率
                    </div>
                    <div className="text-green-600">{strategy.winRate}%</div>
                  </div>
                  <div>
                    <div className="text-gray-600 text-sm mb-1">
                      盈亏比
                    </div>
                    <div className="text-blue-600">{strategy.sharpeRatio}:1</div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-600 text-sm mb-1">
                      跟随资金
                    </div>
                    <div className="text-gray-900">{strategy.totalFollowingCapital}</div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 my-4"></div>

                {/* Description */}
                <div className="mb-4 h-10">
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {strategy.description}
                  </p>
                </div>

                {/* AI Model & Run Days Bar */}
                <div className="py-2 px-3 rounded-lg flex items-center justify-between text-sm bg-green-50 border border-green-200">
                  <div className="flex items-center gap-2 text-gray-700">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>{strategy.aiModel || 'AI'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-green-600">
                    <Activity className="w-3.5 h-3.5" />
                    <span>运行 {strategy.runDays}天</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {/* Create New Strategy Card */}
          <div
            onClick={handleCreateStrategy}
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer border-2 border-dashed border-gray-300 hover:border-blue-500 flex items-center justify-center min-h-[400px]"
          >
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-gray-900 mb-2">创建新策略</h3>
              <p className="text-gray-600 text-sm">点击配置新的量化交易策略</p>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Follow Strategy Modal */}
      {showFollowModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-gray-900">选择交易账户</h2>
              <p className="text-gray-600 mt-2">请选择要跟随该策略的交易账户</p>
            </div>

            <div className="p-6">
              <div className="space-y-3">
                {tradingAccounts.map((account) => (
                  <label
                    key={account.id}
                    className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-blue-300"
                  >
                    <input
                      type="radio"
                      name="account"
                      value={account.id}
                      onChange={(e) => handleFollowStrategy(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="ml-3 flex-1">
                      <div className="text-gray-900">{account.name}</div>
                      <div className="text-gray-600 text-sm">UID: {account.uid} · 余额: {account.balance}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 rounded-b-lg">
              <button
                onClick={() => setShowFollowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
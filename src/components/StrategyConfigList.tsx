import { useState } from 'react';
import { TrendingUp, TrendingDown, Activity, DollarSign, Users, ArrowRight, Plus, Play, Pause, Settings, X, RefreshCw } from 'lucide-react';

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
  status: 'active' | 'paused';
  tags: string[];
  riskLevel: 'low' | 'medium' | 'high';
  totalFollowingCapital: string;
  aiModel?: string;
  systemPrompt?: string;
  userPrompt?: string;
  requestFrequency?: number;
  requestFrequencyUnit?: 'seconds' | 'minutes' | 'hours';
}

interface StrategyConfigListProps {
  onViewDetail: (strategyId: string) => void;
  onNavigateToConfig: (strategy: Strategy | null) => void;
  strategies: Strategy[];
  onUpdateStrategy: (strategyId: string, updates: Partial<Strategy>) => void;
  onNavigateToAccounts?: () => void;
}

export function StrategyConfigList({ onViewDetail, onNavigateToConfig, strategies, onUpdateStrategy, onNavigateToAccounts }: StrategyConfigListProps) {
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'running' | 'paused'>('running');
  const [showStatusConfirmModal, setShowStatusConfirmModal] = useState(false);
  const [statusChangeStrategy, setStatusChangeStrategy] = useState<{ id: string; currentStatus: 'active' | 'paused' } | null>(null);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  const handleToggleStatus = (strategyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const strategy = strategies.find(s => s.id === strategyId);
    if (strategy) {
      setStatusChangeStrategy({ id: strategyId, currentStatus: strategy.status });
      setShowStatusConfirmModal(true);
    }
  };

  const confirmStatusChange = () => {
    if (statusChangeStrategy) {
      onUpdateStrategy(statusChangeStrategy.id, { 
        status: statusChangeStrategy.currentStatus === 'active' ? 'paused' : 'active' 
      });
      setShowStatusConfirmModal(false);
      setStatusChangeStrategy(null);
    }
  };

  const cancelStatusChange = () => {
    setShowStatusConfirmModal(false);
    setStatusChangeStrategy(null);
  };

  const handleSettings = (strategyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const strategy = strategies.find(s => s.id === strategyId);
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
        status: 'active',
        tags: strategyData.tags || [],
        riskLevel: strategyData.riskLevel || 'medium',
        totalFollowingCapital: '¥0',
        aiModel: strategyData.aiModel,
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
    const strategyName = strategies.find(s => s.id === selectedStrategy)?.name;
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
        <div className="mb-6 flex items-center gap-8">
          <button
            onClick={() => setActiveTab('running')}
            className={`pb-3 text-base transition-colors relative ${
              activeTab === 'running'
                ? 'text-gray-900 font-semibold'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            运行中
            {activeTab === 'running' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('paused')}
            className={`pb-3 text-base transition-colors relative ${
              activeTab === 'paused'
                ? 'text-gray-900 font-semibold'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            已暂停
            {activeTab === 'paused' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
            )}
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Strategy Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {strategies
            .filter(strategy => activeTab === 'running' ? strategy.status === 'active' : strategy.status === 'paused')
            .map((strategy) => (
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
                        strategy.status === 'active'
                          ? 'bg-gray-700 hover:bg-gray-800 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                      title={strategy.status === 'active' ? '停止' : '启动'}
                    >
                      {strategy.status === 'active' ? (
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
                      {Math.abs(strategy.returns)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600 text-sm mb-1">
                      总收益额
                    </div>
                    <div className={`${strategy.totalReturn.startsWith('+') || !strategy.totalReturn.startsWith('-') ? 'text-green-600' : 'text-red-600'}`}>
                      {strategy.totalReturn.replace(/^[\+\-]/, '')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-600 text-sm mb-1">
                      最大回撤
                    </div>
                    <div className="text-red-600">
                      {strategy.maxDrawdown}%
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

                {/* Status Bar */}
                <div className={`py-2 px-3 rounded-lg flex items-center justify-between text-sm ${
                  strategy.status === 'active'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                    <span>{strategy.aiModel || 'GPT-4'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5" />
                    <span>运行 {calculateRunningDays(strategy.createDate)}</span>
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

      {/* Status Confirm Modal */}
      {showStatusConfirmModal && statusChangeStrategy && (
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
                <h2 className="text-xl font-semibold text-gray-900">确认操作</h2>
                <button
                  onClick={cancelStatusChange}
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
              <div className="text-gray-600 mb-6">
                您确定要{statusChangeStrategy.currentStatus === 'active' ? '暂停' : '启动'}【{strategies.find(s => s.id === statusChangeStrategy.id)?.name}】吗？
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={cancelStatusChange}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={confirmStatusChange}
                className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                确认
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
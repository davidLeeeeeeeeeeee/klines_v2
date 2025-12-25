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

interface StrategyListProps {
  onViewDetail: (strategyId: string) => void;
  onNavigateToConfig: (strategy: Strategy | null) => void;
  strategies: Strategy[];
  onUpdateStrategy: (strategyId: string, updates: Partial<Strategy>) => void;
  onNavigateToAccounts?: () => void;
}

export function StrategyList({ onViewDetail, onNavigateToConfig, strategies, onUpdateStrategy, onNavigateToAccounts }: StrategyListProps) {
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  const handleToggleStatus = (strategyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateStrategy(strategyId, { status: strategies.find(s => s.id === strategyId)?.status === 'active' ? 'paused' : 'active' });
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
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-semibold text-gray-900">策略中心</h1>
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
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Strategy Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {strategies.map((strategy) => (
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

                {/* Action Buttons */}
                <div className="flex gap-3 mb-4">
                  <button
                    onClick={() => onViewDetail(strategy.id)}
                    className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    策略表现
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onNavigateToAccounts) {
                        onNavigateToAccounts();
                      }
                    }}
                    className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    前往跟随
                  </button>
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
    </div>
  );
}
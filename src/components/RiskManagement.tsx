import { useState } from 'react';
import { Shield, AlertTriangle, TrendingDown, TrendingUp, Activity, RefreshCw } from 'lucide-react';
import { formatNumber } from '../utils/format';

interface RiskManagementProps {
  onBack: () => void;
}

export function RiskManagement({ onBack }: RiskManagementProps) {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'rules' | 'alerts'>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  // Mock risk overview data
  const riskOverview = {
    totalRiskScore: 72,
    riskLevel: 'medium' as 'low' | 'medium' | 'high',
    totalExposure: 285000,
    maxDrawdown: 12.5,
    varDaily: 8500,
    sharpeRatio: 1.8
  };

  // Mock risk rules
  const riskRules = [
    {
      id: '1',
      name: '单笔交易最大损失限制',
      type: '仓位控制',
      status: 'active' as 'active' | 'inactive',
      threshold: '2%',
      current: '1.5%',
      description: '单笔交易损失不超过账户总资金的2%'
    },
    {
      id: '2',
      name: '最大杠杆倍数限制',
      type: '杠杆控制',
      status: 'active' as 'active' | 'inactive',
      threshold: '10x',
      current: '5x',
      description: '所有交易账户的最大杠杆倍数不超过10倍'
    },
    {
      id: '3',
      name: '日内最大回撤限制',
      type: '回撤控制',
      status: 'active' as 'active' | 'inactive',
      threshold: '5%',
      current: '3.2%',
      description: '单日最大回撤不超过账户总资金的5%'
    },
    {
      id: '4',
      name: '总持仓风险敞口限制',
      type: '风险敞口',
      status: 'active' as 'active' | 'inactive',
      threshold: '500,000',
      current: '285,000',
      description: '所有策略的总风险敞口不超过50万元'
    }
  ];

  // Mock risk alerts
  const riskAlerts = [
    {
      id: '1',
      level: 'warning' as 'info' | 'warning' | 'critical',
      title: 'BTC/USDT持仓接近止损',
      description: '趋势追踪策略的BTC/USDT多仓当前价格距离止损价格仅3%，请密切关注',
      timestamp: '2024-03-20 14:35:22',
      strategy: '趋势追踪策略'
    },
    {
      id: '2',
      level: 'critical' as 'info' | 'warning' | 'critical',
      title: '日内回撤超过预警线',
      description: '当前日内回撤已达到4.2%，接近5%的风险阈值，建议减少新开仓位',
      timestamp: '2024-03-20 13:20:15',
      strategy: '全部策略'
    },
    {
      id: '3',
      level: 'info' as 'info' | 'warning' | 'critical',
      title: '资金费率异常',
      description: 'ETH/USDT资金费率短期内上涨至0.15%，高于历史平均水平',
      timestamp: '2024-03-20 12:00:00',
      strategy: '网格交易策略'
    }
  ];

  const getRiskLevelColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'high':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getRiskLevelBg = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low':
        return 'bg-green-100 text-green-600';
      case 'medium':
        return 'bg-yellow-100 text-yellow-600';
      case 'high':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getAlertLevelColor = (level: 'info' | 'warning' | 'critical') => {
    switch (level) {
      case 'info':
        return 'bg-blue-100 text-blue-600';
      case 'warning':
        return 'bg-yellow-100 text-yellow-600';
      case 'critical':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getAlertLevelText = (level: 'info' | 'warning' | 'critical') => {
    switch (level) {
      case 'info':
        return '提示';
      case 'warning':
        return '警告';
      case 'critical':
        return '严重';
      default:
        return '未知';
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-semibold text-gray-900">风险管理</h1>
          <button
            onClick={handleRefresh}
            className={`p-2 text-gray-400 hover:text-gray-600 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
            title="刷新"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-gray-500">监控和管理交易风险</p>
      </div>

      {/* Risk Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* Risk Score */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-500">综合风险评分</span>
            </div>
            <span className={`px-3 py-1 rounded-2xl text-sm ${getRiskLevelBg(riskOverview.riskLevel)}`}>
              {riskOverview.riskLevel === 'low' ? '低风险' : riskOverview.riskLevel === 'medium' ? '中风险' : '高风险'}
            </span>
          </div>
          <div className={`text-3xl ${getRiskLevelColor(riskOverview.riskLevel)}`}>
            {riskOverview.totalRiskScore}
            <span className="text-lg text-gray-400 ml-1">/100</span>
          </div>
        </div>

        {/* Total Exposure */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-500">总风险敞口</span>
          </div>
          <div className="text-3xl text-gray-900">
            {formatNumber(riskOverview.totalExposure)}
          </div>
          <div className="text-sm text-gray-500 mt-1">限额: {formatNumber(500000, 0)}</div>
        </div>

        {/* Max Drawdown */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-500">最大回撤</span>
          </div>
          <div className="text-3xl text-red-600">
            {riskOverview.maxDrawdown}%
          </div>
          <div className="text-sm text-gray-500 mt-1">近30天</div>
        </div>

        {/* Daily VaR */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-500">日均VaR</span>
          </div>
          <div className="text-3xl text-gray-900">
            {formatNumber(riskOverview.varDaily)}
          </div>
          <div className="text-sm text-gray-500 mt-1">95%置信度</div>
        </div>

        {/* Sharpe Ratio */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-500">夏普比率</span>
          </div>
          <div className="text-3xl text-green-600">
            {riskOverview.sharpeRatio}
          </div>
          <div className="text-sm text-gray-500 mt-1">风险调整后收益</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 flex items-center gap-8 border-b border-gray-200">
        <button
          onClick={() => setSelectedTab('overview')}
          className={`pb-3 text-base transition-colors relative ${
            selectedTab === 'overview'
              ? 'text-gray-900 font-semibold'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          风险概览
          {selectedTab === 'overview' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
          )}
        </button>
        <button
          onClick={() => setSelectedTab('rules')}
          className={`pb-3 text-base transition-colors relative ${
            selectedTab === 'rules'
              ? 'text-gray-900 font-semibold'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          风控规则
          {selectedTab === 'rules' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
          )}
        </button>
        <button
          onClick={() => setSelectedTab('alerts')}
          className={`pb-3 text-base transition-colors relative ${
            selectedTab === 'alerts'
              ? 'text-gray-900 font-semibold'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          风险预警
          {selectedTab === 'alerts' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
          )}
        </button>
      </div>

      {/* Tab Content */}
      {selectedTab === 'overview' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">风险分布</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">策略风险</span>
                <span className="text-sm text-gray-900">75%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">市场风险</span>
                <span className="text-sm text-gray-900">60%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">流动性风险</span>
                <span className="text-sm text-gray-900">35%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '35%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">操作风险</span>
                <span className="text-sm text-gray-900">25%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'rules' && (
        <div className="space-y-4">
          {riskRules.map((rule) => (
            <div key={rule.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-gray-900 font-semibold">{rule.name}</h3>
                    <span className={`px-3 py-1 rounded-2xl text-sm ${
                      rule.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {rule.status === 'active' ? '启用' : '禁用'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{rule.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">风险阈值</div>
                  <div className="text-gray-900 font-semibold">{rule.threshold}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">当前值</div>
                  <div className="text-gray-900 font-semibold">{rule.current}</div>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-sm text-gray-500 mb-2">规则类型</div>
                <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-2xl text-sm">
                  {rule.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedTab === 'alerts' && (
        <div className="space-y-4">
          {riskAlerts.map((alert) => (
            <div key={alert.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${getAlertLevelColor(alert.level)}`}>
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-gray-900 font-semibold">{alert.title}</h3>
                        <span className={`px-3 py-1 rounded-2xl text-sm ${getAlertLevelColor(alert.level)}`}>
                          {getAlertLevelText(alert.level)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{alert.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-3">
                    <span>{alert.timestamp}</span>
                    <span>•</span>
                    <span>{alert.strategy}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
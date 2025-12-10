import { useState } from 'react';
import { ChevronLeft, TrendingUp, TrendingDown, Activity, Users, Check, BarChart3, Target, Clock, Percent, ChevronDown } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

interface StrategyDetailProps {
  strategyId: string | null;
  onBack: () => void;
}

export function StrategyDetail({ strategyId, onBack }: StrategyDetailProps) {
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [chartType, setChartType] = useState<'rate' | 'amount'>('rate');
  const [timeRange, setTimeRange] = useState<7 | 30 | 90 | 180>(90);

  // Mock data - 实际应用中根据 strategyId 从 API 获取
  const strategy = {
    id: strategyId || '1',
    name: '趋势追踪策略',
    description: '基于动量指标和移动平均线的中长期趋势跟踪系统，适合波动性市场。该策略结合多个技术指标,在趋势明确时进场,在趋势反转时及时止损。',
    returns: 23.5,
    totalReturn: '+156,890',
    followers: 48,
    winRate: 68.5,
    maxDrawdown: 12.3,
    sharpeRatio: 2.1,
    createDate: '2024-01-15',
    status: 'active',
    totalTrades: 142,
    avgHoldingTime: '3.2天',
    profitFactor: 2.4,
    monthlyReturn: 4.8,
    fundScale: '1,250,000',
    runningDays: 90
  };

  // Mock performance data
  const performanceDataFull = [
    { date: '01-15', rate: 0, amount: 0 },
    { date: '01-22', rate: 3.5, amount: 3500 },
    { date: '01-29', rate: 7.2, amount: 7200 },
    { date: '02-05', rate: 12.8, amount: 12800 },
    { date: '02-12', rate: 10.5, amount: 10500 },
    { date: '02-19', rate: 18.6, amount: 18600 },
    { date: '02-26', rate: 25.4, amount: 25400 },
    { date: '03-04', rate: 32.1, amount: 32100 },
    { date: '03-11', rate: 28.9, amount: 28900 },
    { date: '03-18', rate: 36.7, amount: 36700 },
    { date: '03-25', rate: 44.2, amount: 44200 },
    { date: '04-01', rate: 56.89, amount: 56890 }
  ];

  // Mock weekly performance data for bar chart
  const weeklyData = [
    { week: '11 周', rateChange: 8.5, amountChange: 12500 },
    { week: '9 周', rateChange: 5.2, amountChange: 8200 },
    { week: '7 周', rateChange: -3.5, amountChange: -5600 },
    { week: '5 周', rateChange: 6.8, amountChange: 9800 },
    { week: '3 周', rateChange: 12.3, amountChange: 18600 },
    { week: '1 周', rateChange: -15.2, amountChange: -22400 }
  ];

  // Filter data based on selected time range
  const getFilteredData = () => {
    const dataPoints = {
      7: 7,
      30: 10,
      90: 12,
      180: 12 // 用全部数据代表180天
    };
    const count = dataPoints[timeRange];
    return performanceDataFull.slice(-count);
  };

  const performanceData = getFilteredData();

  // Calculate current returns
  const currentRate = performanceData.length > 0 ? performanceData[performanceData.length - 1].rate : 0;
  const currentAmount = performanceData.length > 0 ? performanceData[performanceData.length - 1].amount : 0;

  // Mock drawdown data
  const drawdownData = [
    { date: '01-15', drawdown: 0 },
    { date: '01-22', drawdown: -2.1 },
    { date: '01-29', drawdown: -1.5 },
    { date: '02-05', drawdown: 0 },
    { date: '02-12', drawdown: -3.8 },
    { date: '02-19', drawdown: -1.2 },
    { date: '02-26', drawdown: 0 },
    { date: '03-04', drawdown: -2.5 },
    { date: '03-11', drawdown: -5.3 },
    { date: '03-18', drawdown: -1.8 },
    { date: '03-25', drawdown: 0 },
    { date: '04-01', drawdown: -12.3 }
  ];

  // Mock trading accounts
  const tradingAccounts = [
    { id: '1', name: '主账户 - Binance', balance: '¥125,680', uid: 'BN001' },
    { id: '2', name: '备用账户 - OKX', balance: '¥86,420', uid: 'OKX002' },
    { id: '3', name: '测试账户 - Huobi', balance: '¥45,230', uid: 'HB003' }
  ];

  const handleFollowStrategy = () => {
    if (!selectedAccount) {
      alert('请选择要跟随的交易账户');
      return;
    }
    alert(`已成功使用账户 ${selectedAccount} 跟随策略`);
    setShowFollowModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-gray-900">{strategy.name}</h1>
                <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
                  运行 {strategy.runningDays} 天
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowFollowModal(true)}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 flex-shrink-0"
            >
              <Check className="w-5 h-5" />
              跟随策略
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Key Metrics Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <p className="text-gray-600 mb-6 pb-4 border-b border-gray-200">{strategy.description}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-sm text-gray-500 mb-2">近 90 日收益率</div>
              <div className={`${strategy.returns >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <span className="text-2xl">
                  {strategy.returns >= 0 ? '+' : ''}{strategy.returns}%
                </span>
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-500 mb-2">近 90 日盈亏</div>
              <div className="text-green-600 text-2xl">${strategy.totalReturn}</div>
            </div>

            <div>
              <div className="text-sm text-gray-500 mb-2">跟随账户</div>
              <div className="text-gray-900 text-2xl">{strategy.followers}</div>
            </div>

            <div>
              <div className="text-sm text-gray-500 mb-2">资金规模</div>
              <div className="text-gray-900 text-2xl">${strategy.fundScale}</div>
            </div>
          </div>
        </div>

        {/* Weekly Performance Bar Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {chartType === 'rate' ? '收益率周表现' : '收益额周表现'}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setChartType('rate')}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  chartType === 'rate'
                    ? 'bg-gray-100 text-gray-700'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                收益率
              </button>
              <button
                onClick={() => setChartType('amount')}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  chartType === 'amount'
                    ? 'bg-gray-100 text-gray-700'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                收益额
              </button>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis 
                dataKey="week" 
                stroke="#9ca3af" 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={false}
              />
              <YAxis 
                stroke="#9ca3af" 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px',
                  padding: '8px 12px'
                }}
                formatter={(value: number) => 
                  chartType === 'rate' 
                    ? `${value > 0 ? '+' : ''}${value.toFixed(2)}%` 
                    : `${value > 0 ? '+' : ''}$${Math.abs(value).toLocaleString()}`
                }
                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
              />
              <Bar 
                dataKey={chartType === 'rate' ? 'rateChange' : 'amountChange'}
                radius={[0, 0, 0, 0]}
                maxBarSize={40}
              >
                {weeklyData.map((entry, index) => {
                  const value = chartType === 'rate' ? entry.rateChange : entry.amountChange;
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={value >= 0 ? '#10b981' : '#ef4444'}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cumulative Returns Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-900">
              {chartType === 'rate' ? '收益率' : '收益额'}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setChartType('rate')}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  chartType === 'rate'
                    ? 'bg-gray-100 text-gray-700'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                收益率
              </button>
              <button
                onClick={() => setChartType('amount')}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  chartType === 'amount'
                    ? 'bg-gray-100 text-gray-700'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                收益额
              </button>
            </div>
          </div>

          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-green-600 mb-1">
                {chartType === 'rate' ? (
                  <span className="text-3xl font-semibold">+{currentRate.toFixed(2)}%</span>
                ) : (
                  <span className="text-3xl font-semibold">+${currentAmount.toLocaleString()}</span>
                )}
              </div>
            </div>
            <div className="relative">
              <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors">
                近 {timeRange} 日
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={performanceData}>
              <defs>
                <linearGradient id="colorGreenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#9ca3af" 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={false}
              />
              <YAxis 
                stroke="#9ca3af" 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px',
                  padding: '8px 12px'
                }}
                formatter={(value: number) => 
                  chartType === 'rate' ? `+${value.toFixed(2)}%` : `+$${value.toLocaleString()}`
                }
                labelFormatter={(label) => label}
              />
              <Area 
                type="monotone" 
                dataKey={chartType === 'rate' ? 'rate' : 'amount'}
                stroke="#10b981" 
                fillOpacity={1} 
                fill="url(#colorGreenGradient)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-gray-900 mb-4">交易统计</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">总交易次数</span>
                <span className="text-gray-900">{strategy.totalTrades}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">胜率</span>
                <span className="text-gray-900">{strategy.winRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">盈利因子</span>
                <span className="text-gray-900">{strategy.profitFactor}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">平均持仓时间</span>
                <span className="text-gray-900">{strategy.avgHoldingTime}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-gray-900 mb-4">风险指标</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">最大回撤</span>
                <span className="text-red-600">{strategy.maxDrawdown}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">夏普比率</span>
                <span className="text-gray-900">{strategy.sharpeRatio}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">创建日期</span>
                <span className="text-gray-900">{strategy.createDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">运行天数</span>
                <span className="text-gray-900">
                  {Math.floor((new Date().getTime() - new Date(strategy.createDate).getTime()) / (1000 * 60 * 60 * 24))}天
                </span>
              </div>
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
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedAccount === account.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="account"
                      value={account.id}
                      checked={selectedAccount === account.id}
                      onChange={(e) => setSelectedAccount(e.target.value)}
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
              <button
                onClick={handleFollowStrategy}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                确认跟随
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
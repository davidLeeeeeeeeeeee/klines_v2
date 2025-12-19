import { useState } from 'react';
import { ChevronLeft, TrendingUp, TrendingDown, Activity, Users, Check, BarChart3, Target, Clock, Percent, ChevronDown } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, PieChart, Pie } from 'recharts';

interface StrategyDetailProps {
  strategyId: string | null;
  onBack: () => void;
}

export function StrategyDetail({ strategyId, onBack }: StrategyDetailProps) {
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [weeklyChartType, setWeeklyChartType] = useState<'rate' | 'amount'>('rate');
  const [cumulativeChartType, setCumulativeChartType] = useState<'rate' | 'amount'>('rate');
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90' | '180'>('90');
  const [showTimeRangeDropdown, setShowTimeRangeDropdown] = useState(false);
  const [symbolTimeRange, setSymbolTimeRange] = useState<'7' | '30' | '90' | '180'>('90');
  const [showSymbolTimeRangeDropdown, setShowSymbolTimeRangeDropdown] = useState(false);

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
    { date: '12/03', displayDate: '12/03', week: '12 周', dateRange: '2024/11/12-11/19', rateChange: 4.2, amountChange: 6200 },
    { date: '12/02', displayDate: '12/02', week: '11 周', dateRange: '2024/11/05-11/12', rateChange: 8.5, amountChange: 12500 },
    { date: '12/01', displayDate: '12/01', week: '10 周', dateRange: '2024/10/29-11/05', rateChange: -2.1, amountChange: -3100 },
    { date: '11/30', displayDate: '11/30', week: '9 周', dateRange: '2024/10/22-10/29', rateChange: 5.2, amountChange: 8200 },
    { date: '11/29', displayDate: '11/29', week: '8 周', dateRange: '2024/10/15-10/22', rateChange: 3.8, amountChange: 5800 },
    { date: '11/28', displayDate: '11/28', week: '7 周', dateRange: '2024/10/08-10/15', rateChange: -3.5, amountChange: -5600 },
    { date: '11/27', displayDate: '11/27', week: '6 周', dateRange: '2024/10/01-10/08', rateChange: 7.6, amountChange: 11200 },
    { date: '11/26', displayDate: '11/26', week: '5 周', dateRange: '2024/09/24-10/01', rateChange: 6.8, amountChange: 9800 },
    { date: '11/25', displayDate: '11/25', week: '4 周', dateRange: '2024/09/17-09/24', rateChange: -4.3, amountChange: -6400 },
    { date: '11/24', displayDate: '11/24', week: '3 周', dateRange: '2024/09/10-09/17', rateChange: 12.3, amountChange: 18600 },
    { date: '11/23', displayDate: '11/23', week: '2 周', dateRange: '2024/09/03-09/10', rateChange: 9.1, amountChange: 13500 },
    { date: '11/22', displayDate: '11/22', week: '1 周', dateRange: '2024/08/27-09/03', rateChange: -15.2, amountChange: -22400 }
  ];

  // Filter data based on selected time range
  const getFilteredData = () => {
    const dataPoints = {
      '7': 7,
      '30': 10,
      '90': 12,
      '180': 12 // 用全部数据代表180天
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

  const topSymbols = [
    { 
      id: 1, 
      name: 'BTCUSDT', 
      returns: 18.5, 
      amount: 28450,
      volume: '2.4B',
      price: 96850.23
    },
    { 
      id: 2, 
      name: 'ETHUSDT', 
      returns: 12.3, 
      amount: 15680,
      volume: '1.8B',
      price: 3542.18
    },
    { 
      id: 3, 
      name: 'SOLUSDT', 
      returns: -5.6, 
      amount: -8920,
      volume: '856M',
      price: 238.45
    },
    { 
      id: 4, 
      name: 'BNBUSDT', 
      returns: 9.8, 
      amount: 12340,
      volume: '645M',
      price: 692.34
    },
  ];

  // Symbol preference data for pie chart
  const symbolPreferenceData = [
    { name: 'BTCUSDT', value: 35.5, color: '#3b82f6' },
    { name: 'ETHUSDT', value: 28.2, color: '#8b5cf6' },
    { name: 'SOLUSDT', value: 18.3, color: '#10b981' },
    { name: 'BNBUSDT', value: 12.8, color: '#f59e0b' },
    { name: '其他', value: 5.2, color: '#6b7280' }
  ];

  // Trading statistics data
  const tradingStats = {
    totalPositions: 1248,
    profitTrades: 850,
    profitTradesRate: 68.5,
    lossTrades: 398,
    lossTradesRate: 31.5,
    profitLossRatio: 2.4,
    maxDrawdown: 12.3,
    totalVolume: '$12,450,000',
    totalFees: '$12,450',
    totalFundingFees: '$12,450'
  };

  const handleFollowStrategy = () => {
    if (!selectedAccount) {
      alert('请选择要跟随的交易账户');
      return;
    }
    alert(`已成功使用账户 ${selectedAccount} 跟随策略`);
    setShowFollowModal(false);
  };

  // Custom Tooltip for Weekly Chart
  const CustomWeeklyTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const rateValue = data.rateChange;
      const amountValue = data.amountChange;
      const isRatePositive = rateValue >= 0;
      const isAmountPositive = amountValue >= 0;
      
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-2.5 shadow-lg">
          <div className="text-xs text-gray-900 mb-1">{data.displayDate}</div>
          <div className="text-xs mb-0.5">
            <span className="text-gray-900">收益率:</span>
            {' '}
            <span className={isRatePositive ? 'text-green-600' : 'text-red-600'}>
              {isRatePositive ? '+' : ''}{rateValue.toFixed(2)}%
            </span>
          </div>
          <div className="text-xs">
            <span className="text-gray-900">收益额:</span>
            {' '}
            <span className={isAmountPositive ? 'text-green-600' : 'text-red-600'}>
              {isAmountPositive ? '+' : ''}${Math.abs(amountValue).toLocaleString()}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Cumulative Chart
  const CustomNetValueTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const value = data.amount;
      const isPositive = value >= 0;
      
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-2.5 shadow-lg">
          <div className="text-xs text-gray-900 mb-1">{data.date}</div>
          <div className="text-xs">
            <span className="text-gray-900">
              净值:
            </span>
            {' '}
            <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
              {isPositive ? '+' : ''}$${Math.abs(value).toLocaleString()}
            </span>
          </div>
        </div>
      );
    }
    return null;
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
                <h1 className="text-2xl font-semibold text-gray-900">策略表现</h1>
                <span className="px-3 py-1 rounded-2xl text-sm bg-green-100 text-green-600">
                  运行 {strategy.runningDays} 天
                </span>
              </div>
            </div>
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
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg text-gray-900 font-semibold">
              每日盈亏(近2周)
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setWeeklyChartType('rate')}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  weeklyChartType === 'rate'
                    ? 'bg-gray-100 text-gray-700'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                收益率
              </button>
              <button
                onClick={() => setWeeklyChartType('amount')}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  weeklyChartType === 'amount'
                    ? 'bg-gray-100 text-gray-700'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                收益额
              </button>
            </div>
          </div>

          <div style={{ marginLeft: '-20px' }}>
            <ResponsiveContainer width="100%" height={380}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#9ca3af" 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={false}
                  interval={0}
                />
                <YAxis 
                  stroke="#9ca3af" 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={false}
                  tickFormatter={(value) => 
                    weeklyChartType === 'rate' ? `${value}%` : `$${Math.abs(value / 1000).toFixed(0)}k`
                  }
                  width={60}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    padding: '8px 12px'
                  }}
                  formatter={(value: number) => 
                    weeklyChartType === 'rate' 
                      ? `${value > 0 ? '+' : ''}${value.toFixed(2)}%` 
                      : `${value > 0 ? '+' : ''}$${Math.abs(value).toLocaleString()}`
                  }
                  cursor={false}
                  content={<CustomWeeklyTooltip />}
                />
                <Bar 
                  dataKey={weeklyChartType === 'rate' ? 'rateChange' : 'amountChange'}
                  radius={[0, 0, 0, 0]}
                  maxBarSize={40}
                >
                  {weeklyData.map((entry, index) => {
                    const value = weeklyChartType === 'rate' ? entry.rateChange : entry.amountChange;
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
        </div>

        {/* Cumulative Returns Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg text-gray-900 font-semibold">
              净值曲线
            </h2>
            <div className="relative">
              <button
                className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                onClick={() => setShowTimeRangeDropdown(!showTimeRangeDropdown)}
              >
                近 {timeRange === '180' ? '半年' : `${timeRange} 日`}
                <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor" className="text-gray-600">
                  <path d="M5 6L0 0h10L5 6z" />
                </svg>
              </button>
              {showTimeRangeDropdown && (
                <div className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[100px] z-10">
                  <button
                    className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                      timeRange === '7' ? 'bg-gray-100' : ''
                    }`}
                    onClick={() => {
                      setTimeRange('7');
                      setShowTimeRangeDropdown(false);
                    }}
                  >
                    近 7 日
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                      timeRange === '30' ? 'bg-gray-100' : ''
                    }`}
                    onClick={() => {
                      setTimeRange('30');
                      setShowTimeRangeDropdown(false);
                    }}
                  >
                    近 30 日
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                      timeRange === '90' ? 'bg-gray-100' : ''
                    }`}
                    onClick={() => {
                      setTimeRange('90');
                      setShowTimeRangeDropdown(false);
                    }}
                  >
                    近 90 日
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                      timeRange === '180' ? 'bg-gray-100' : ''
                    }`}
                    onClick={() => {
                      setTimeRange('180');
                      setShowTimeRangeDropdown(false);
                    }}
                  >
                    近半年
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-green-600 mb-1">
                <span className="text-3xl font-semibold">+${currentAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div style={{ marginLeft: '-20px' }}>
            <ResponsiveContainer width="100%" height={340}>
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
                  tickFormatter={(value) => `$${Math.abs(value / 1000).toFixed(0)}k`}
                  width={60}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    padding: '8px 12px'
                  }}
                  formatter={(value: number) => `+$${value.toLocaleString()}`}
                  labelFormatter={(label) => label}
                  content={<CustomNetValueTooltip />}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount"
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
        </div>

        {/* Detailed Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Symbols */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-lg text-gray-900 font-semibold">商品排名</h2>
                <div className="relative">
                  <button
                    className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                    onClick={() => setShowSymbolTimeRangeDropdown(!showSymbolTimeRangeDropdown)}
                  >
                    近 {symbolTimeRange === '180' ? '半年' : `${symbolTimeRange} 日`}
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor" className="text-gray-600">
                      <path d="M5 6L0 0h10L5 6z" />
                    </svg>
                  </button>
                  {showSymbolTimeRangeDropdown && (
                    <div className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[100px] z-10">
                      <button
                        className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                          symbolTimeRange === '7' ? 'bg-gray-100' : ''
                        }`}
                        onClick={() => {
                          setSymbolTimeRange('7');
                          setShowSymbolTimeRangeDropdown(false);
                        }}
                      >
                        近 7 日
                      </button>
                      <button
                        className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                          symbolTimeRange === '30' ? 'bg-gray-100' : ''
                        }`}
                        onClick={() => {
                          setSymbolTimeRange('30');
                          setShowSymbolTimeRangeDropdown(false);
                        }}
                      >
                        近 30 日
                      </button>
                      <button
                        className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                          symbolTimeRange === '90' ? 'bg-gray-100' : ''
                        }`}
                        onClick={() => {
                          setSymbolTimeRange('90');
                          setShowSymbolTimeRangeDropdown(false);
                        }}
                      >
                        近 90 日
                      </button>
                      <button
                        className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                          symbolTimeRange === '180' ? 'bg-gray-100' : ''
                        }`}
                        onClick={() => {
                          setSymbolTimeRange('180');
                          setShowSymbolTimeRangeDropdown(false);
                        }}
                      >
                        近半年
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-1.5">
                {topSymbols.map((symbol, index) => {
                  // Calculate bar width percentage based on max value
                  const maxAmount = Math.max(...topSymbols.map(s => Math.abs(s.amount)));
                  const barWidth = (Math.abs(symbol.amount) / maxAmount) * 100;
                  const isPositive = symbol.amount >= 0;
                  
                  return (
                    <div key={symbol.id} className="flex items-center gap-3 p-2">
                      {/* Symbol Name */}
                      <div className="w-24 text-gray-900 flex-shrink-0">
                        {symbol.name}
                      </div>
                      
                      {/* Bar Chart */}
                      <div className="flex-1 h-7 overflow-hidden relative">
                        <div 
                          className={`h-full ${isPositive ? 'bg-green-500' : 'bg-red-500'} transition-all duration-500`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                      
                      {/* Amount */}
                      <div className={`w-28 text-right flex-shrink-0 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        <div className="flex items-center gap-1 justify-end">
                          {isPositive ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          <span>${Math.abs(symbol.amount).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Symbol Preference Pie Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg text-gray-900 font-semibold mb-6">商品偏好</h2>
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-16">
              {/* Pie Chart */}
              <div className="flex-shrink-0">
                <div className="w-[200px] h-[200px] md:w-[240px] md:h-[240px]">
                  <PieChart width={200} height={200} className="md:hidden">
                    <Pie
                      data={symbolPreferenceData}
                      cx={100}
                      cy={100}
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {symbolPreferenceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                  <PieChart width={240} height={240} className="hidden md:block">
                    <Pie
                      data={symbolPreferenceData}
                      cx={120}
                      cy={120}
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {symbolPreferenceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </div>
              </div>

              {/* Legend */}
              <div className="flex-1 w-full">
                <div className="space-y-2 md:space-y-3">
                  {symbolPreferenceData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 md:gap-3">
                      <div 
                        className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-sm flex-shrink-0" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-gray-700 min-w-[70px] md:min-w-[80px] text-sm md:text-base">{item.name}</span>
                      <span className="text-gray-900 text-sm md:text-base flex-shrink-0">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trading Statistics */}
        <div className="mt-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg text-gray-900 font-semibold mb-6">交易统计</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">仓位总数</span>
                <span className="text-gray-900">{tradingStats.totalPositions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">盈利交易</span>
                <span className="text-green-600">{tradingStats.profitTrades} / {tradingStats.profitTradesRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">亏损交易</span>
                <span className="text-red-600">{tradingStats.lossTrades} / {tradingStats.lossTradesRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">盈亏比</span>
                <span className="text-gray-900">{tradingStats.profitLossRatio}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">最大回撤</span>
                <span className="text-red-600">{tradingStats.maxDrawdown}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">总交易量</span>
                <span className="text-gray-900">{tradingStats.totalVolume}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">总手续费</span>
                <span className="text-gray-900">{tradingStats.totalFees}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">总资金费</span>
                <span className="text-gray-900">{tradingStats.totalFundingFees}</span>
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
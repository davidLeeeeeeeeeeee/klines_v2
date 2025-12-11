import { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Activity, 
  Target,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  ChevronDown,
  Wallet,
  ChevronUp,
  BarChart3,
  Percent,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, PieChart, Pie } from 'recharts';

export function Dashboard() {
  const [weeklyChartType, setWeeklyChartType] = useState<'rate' | 'amount'>('rate');
  const [cumulativeChartType, setCumulativeChartType] = useState<'rate' | 'amount'>('rate');
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90' | '180'>('90');
  const [showTimeRangeDropdown, setShowTimeRangeDropdown] = useState(false);
  const [strategyTimeRange, setStrategyTimeRange] = useState<'7' | '30' | '90' | '180'>('90');
  const [showStrategyTimeRangeDropdown, setShowStrategyTimeRangeDropdown] = useState(false);
  const [symbolTimeRange, setSymbolTimeRange] = useState<'7' | '30' | '90' | '180'>('90');
  const [showSymbolTimeRangeDropdown, setShowSymbolTimeRangeDropdown] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  // Mock weekly performance data for bar chart
  const weeklyData = [
    { week: '12 周', dateRange: '2024/11/12-11/19', rateChange: 4.2, amountChange: 6200 },
    { week: '11 周', dateRange: '2024/11/05-11/12', rateChange: 8.5, amountChange: 12500 },
    { week: '10 周', dateRange: '2024/10/29-11/05', rateChange: -2.1, amountChange: -3100 },
    { week: '9 周', dateRange: '2024/10/22-10/29', rateChange: 5.2, amountChange: 8200 },
    { week: '8 周', dateRange: '2024/10/15-10/22', rateChange: 3.8, amountChange: 5800 },
    { week: '7 周', dateRange: '2024/10/08-10/15', rateChange: -3.5, amountChange: -5600 },
    { week: '6 周', dateRange: '2024/10/01-10/08', rateChange: 7.6, amountChange: 11200 },
    { week: '5 周', dateRange: '2024/09/24-10/01', rateChange: 6.8, amountChange: 9800 },
    { week: '4 周', dateRange: '2024/09/17-09/24', rateChange: -4.3, amountChange: -6400 },
    { week: '3 周', dateRange: '2024/09/10-09/17', rateChange: 12.3, amountChange: 18600 },
    { week: '2 周', dateRange: '2024/09/03-09/10', rateChange: 9.1, amountChange: 13500 },
    { week: '1 周', dateRange: '2024/08/27-09/03', rateChange: -15.2, amountChange: -22400 }
  ];

  // Mock performance data for area chart
  const performanceData = [
    { date: '01-15', displayDate: '01/15', rate: 0, amount: 0 },
    { date: '01-22', displayDate: '01/22', rate: 3.5, amount: 3500 },
    { date: '01-29', displayDate: '01/29', rate: 7.2, amount: 7200 },
    { date: '02-05', displayDate: '02/05', rate: 12.8, amount: 12800 },
    { date: '02-12', displayDate: '02/12', rate: 10.5, amount: 10500 },
    { date: '02-19', displayDate: '02/19', rate: 18.6, amount: 18600 },
    { date: '02-26', displayDate: '02/26', rate: 25.4, amount: 25400 },
    { date: '03-04', displayDate: '03/04', rate: 32.1, amount: 32100 },
    { date: '03-11', displayDate: '03/11', rate: 28.9, amount: 28900 },
    { date: '03-18', displayDate: '03/18', rate: 36.7, amount: 36700 },
    { date: '03-25', displayDate: '03/25', rate: 44.2, amount: 44200 },
    { date: '04-01', displayDate: '04/01', rate: 56.89, amount: 156890 }
  ];

  // Calculate current returns
  const currentRate = performanceData.length > 0 ? performanceData[performanceData.length - 1].rate : 0;
  const currentAmount = performanceData.length > 0 ? performanceData[performanceData.length - 1].amount : 0;

  const topStrategies = [
    { 
      id: 1, 
      name: '高频做市策略', 
      returns: 31.4, 
      amount: 12580,
      followers: 28,
      status: 'active',
      change: 2.3
    },
    { 
      id: 2, 
      name: '趋势追踪策略', 
      returns: 23.5, 
      amount: 9420,
      followers: 48,
      status: 'active',
      change: 1.8
    },
    { 
      id: 3, 
      name: '网格交易策略', 
      returns: -8.2, 
      amount: -3280,
      followers: 35,
      status: 'active',
      change: -0.5
    },
    { 
      id: 4, 
      name: '均值回归策略', 
      returns: 15.6, 
      amount: 6240,
      followers: 41,
      status: 'paused',
      change: 0.9
    },
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

  // Custom Tooltip for Weekly Chart
  const CustomWeeklyTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const value = weeklyChartType === 'rate' ? data.rateChange : data.amountChange;
      const isPositive = value >= 0;
      
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-2.5 shadow-lg">
          <div className="text-xs text-gray-900 mb-1">{data.dateRange}</div>
          <div className="text-xs">
            <span className="text-gray-900">
              {weeklyChartType === 'rate' ? '周收益率' : '周收益额'}:
            </span>
            {' '}
            <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
              {weeklyChartType === 'rate' 
                ? `${isPositive ? '+' : ''}${value.toFixed(2)}%`
                : `${isPositive ? '+' : ''}$${Math.abs(value).toLocaleString()}`
              }
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Cumulative Chart
  const CustomCumulativeTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const value = cumulativeChartType === 'rate' ? data.rate : data.amount;
      const isPositive = value >= 0;
      
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-2.5 shadow-lg">
          <div className="text-xs text-gray-900 mb-1">{data.displayDate}</div>
          <div className="text-xs">
            <span className="text-gray-900">
              {cumulativeChartType === 'rate' ? '收益率' : '收益额'}:
            </span>
            {' '}
            <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
              {cumulativeChartType === 'rate' 
                ? `${isPositive ? '+' : ''}${value.toFixed(2)}%`
                : `${isPositive ? '+' : ''}$${Math.abs(value).toLocaleString()}`
              }
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-semibold text-gray-900">仪表盘</h1>
          <button
            onClick={handleRefresh}
            className={`p-2 text-gray-400 hover:text-gray-600 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
            title="刷新"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-gray-500">实时监控您的交易表现和资产状况</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {/* Total Net Worth */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="text-gray-600 text-sm mb-2">总净值</div>
              <div className="text-gray-900 text-2xl mb-2">$1,956,420</div>
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+12.5%</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Today's P&L */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="text-gray-600 text-sm mb-2">今日盈亏</div>
              <div className="text-gray-900 text-2xl mb-2">$12,680</div>
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+2.3%</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Positions / Win Rate */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="text-gray-600 text-sm mb-2">仓位数/胜率</div>
              <div className="text-gray-900 text-2xl mb-2">328</div>
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <Target className="w-3.5 h-3.5" />
                <span>68.5%</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Target className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Fees */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="text-gray-600 text-sm mb-2">总手续费</div>
              <div className="text-gray-900 text-2xl mb-2">$48,520</div>
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <span>返佣 $12,340</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Wallet className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        {/* Weekly Performance Bar Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg text-gray-900 font-semibold">
              {weeklyChartType === 'rate' ? '收益率周表现' : '收益额周表现'}
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
                  dataKey="week" 
                  stroke="#9ca3af" 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={false}
                  interval={0}
                  tickFormatter={(value) => {
                    // Only show odd weeks
                    const weekNum = parseInt(value.split(' ')[0]);
                    return weekNum % 2 === 1 ? value : '';
                  }}
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
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg text-gray-900 font-semibold">
              {cumulativeChartType === 'rate' ? '收益率' : '收益额'}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCumulativeChartType('rate')}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  cumulativeChartType === 'rate'
                    ? 'bg-gray-100 text-gray-700'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                收益率
              </button>
              <button
                onClick={() => setCumulativeChartType('amount')}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  cumulativeChartType === 'amount'
                    ? 'bg-gray-100 text-gray-700'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                收��额
              </button>
            </div>
          </div>

          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-green-600 mb-1">
                {cumulativeChartType === 'rate' ? (
                  <span className="text-3xl font-semibold">+{currentRate.toFixed(2)}%</span>
                ) : (
                  <span className="text-3xl font-semibold">+${currentAmount.toLocaleString()}</span>
                )}
              </div>
            </div>
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
                  tickFormatter={(value) => 
                    cumulativeChartType === 'rate' ? `${value}%` : `$${Math.abs(value / 1000).toFixed(0)}k`
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
                    cumulativeChartType === 'rate' ? `+${value.toFixed(2)}%` : `+$${value.toLocaleString()}`
                  }
                  labelFormatter={(label) => label}
                  content={<CustomCumulativeTooltip />}
                />
                <Area 
                  type="monotone" 
                  dataKey={cumulativeChartType === 'rate' ? 'rate' : 'amount'}
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
      </div>

      {/* Bottom Section - Top Strategies & Top Symbols */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        {/* Top Performing Strategies */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-lg text-gray-900 font-semibold">策略排名</h2>
              <div className="relative">
                <button
                  className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                  onClick={() => setShowStrategyTimeRangeDropdown(!showStrategyTimeRangeDropdown)}
                >
                  近 {strategyTimeRange === '180' ? '半年' : `${strategyTimeRange} 日`}
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor" className="text-gray-600">
                    <path d="M5 6L0 0h10L5 6z" />
                  </svg>
                </button>
                {showStrategyTimeRangeDropdown && (
                  <div className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[100px] z-10">
                    <button
                      className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                        strategyTimeRange === '7' ? 'bg-gray-100' : ''
                      }`}
                      onClick={() => {
                        setStrategyTimeRange('7');
                        setShowStrategyTimeRangeDropdown(false);
                      }}
                    >
                      近 7 日
                    </button>
                    <button
                      className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                        strategyTimeRange === '30' ? 'bg-gray-100' : ''
                      }`}
                      onClick={() => {
                        setStrategyTimeRange('30');
                        setShowStrategyTimeRangeDropdown(false);
                      }}
                    >
                      近 30 日
                    </button>
                    <button
                      className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                        strategyTimeRange === '90' ? 'bg-gray-100' : ''
                      }`}
                      onClick={() => {
                        setStrategyTimeRange('90');
                        setShowStrategyTimeRangeDropdown(false);
                      }}
                    >
                      近 90 日
                    </button>
                    <button
                      className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                        strategyTimeRange === '180' ? 'bg-gray-100' : ''
                      }`}
                      onClick={() => {
                        setStrategyTimeRange('180');
                        setShowStrategyTimeRangeDropdown(false);
                      }}
                    >
                      近半年
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              {topStrategies.map((strategy, index) => (
                <div key={strategy.id} className="flex items-center gap-4 rounded-lg p-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-gray-900">{strategy.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {strategy.followers}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`${strategy.returns >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      <div className="flex items-center gap-1 justify-end mb-0.5">
                        {strategy.returns >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        <div className="text-lg leading-none">${strategy.amount >= 0 ? strategy.amount.toLocaleString() : `${Math.abs(strategy.amount).toLocaleString()}`}</div>
                      </div>
                      <div className="text-xs leading-none">{strategy.returns}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

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
      </div>

      {/* Symbol Preference & Trading Statistics */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
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

        {/* Trading Statistics */}
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
  );
}
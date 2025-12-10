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
  Wallet
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

export function Dashboard() {
  const [weeklyChartType, setWeeklyChartType] = useState<'rate' | 'amount'>('rate');
  const [cumulativeChartType, setCumulativeChartType] = useState<'rate' | 'amount'>('rate');

  // Mock weekly performance data for bar chart
  const weeklyData = [
    { week: '11 周', rateChange: 8.5, amountChange: 12500 },
    { week: '9 周', rateChange: 5.2, amountChange: 8200 },
    { week: '7 周', rateChange: -3.5, amountChange: -5600 },
    { week: '5 周', rateChange: 6.8, amountChange: 9800 },
    { week: '3 周', rateChange: 12.3, amountChange: 18600 },
    { week: '1 周', rateChange: -15.2, amountChange: -22400 }
  ];

  // Mock performance data for area chart
  const performanceData = [
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
    { date: '04-01', rate: 56.89, amount: 156890 }
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

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">仪表盘</h1>
          <p className="text-sm text-gray-500">实时监控交易数据和策略表现</p>
        </div>
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

        {/* Cumulative Returns */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="text-gray-600 text-sm mb-2">累计收益</div>
              <div className="text-gray-900 text-2xl mb-2">$456,890</div>
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+23.8%</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* 30-Day Returns */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="text-gray-600 text-sm mb-2">近 30 日收益</div>
              <div className="text-gray-900 text-2xl mb-2">$126,800</div>
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+8.3%</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Total Accounts */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="text-gray-600 text-sm mb-2">总账户数</div>
              <div className="text-gray-900 text-2xl">6</div>
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg text-gray-900">
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
                  weeklyChartType === 'rate' 
                    ? `${value > 0 ? '+' : ''}${value.toFixed(2)}%` 
                    : `${value > 0 ? '+' : ''}$${Math.abs(value).toLocaleString()}`
                }
                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
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

        {/* Cumulative Returns Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg text-gray-900">
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
                收益额
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
              <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors">
                近 90 日
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
                  cumulativeChartType === 'rate' ? `+${value.toFixed(2)}%` : `+$${value.toLocaleString()}`
                }
                labelFormatter={(label) => label}
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

      {/* Bottom Section - Top Strategies & Top Symbols */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Top Performing Strategies */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg text-gray-900">策略收益排行</h2>
            <p className="text-sm text-gray-500 mt-1 mb-4">近 7 日收益</p>
            <div className="space-y-3">
              {topStrategies.map((strategy, index) => (
                <div key={strategy.id} className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0 ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                  }`}>
                    {index + 1}
                  </div>
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
            <h2 className="text-lg text-gray-900">商品收益排行</h2>
            <p className="text-sm text-gray-500 mt-1 mb-4">近 7 日收益</p>
            <div className="space-y-3">
              {topSymbols.map((symbol, index) => (
                <div key={symbol.id} className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0 ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-gray-900">{symbol.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5" />
                        {symbol.volume}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`${symbol.returns >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      <div className="flex items-center gap-1 justify-end mb-0.5">
                        {symbol.returns >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        <div className="text-lg leading-none">${symbol.amount >= 0 ? symbol.amount.toLocaleString() : `${Math.abs(symbol.amount).toLocaleString()}`}</div>
                      </div>
                      <div className="text-xs leading-none">{symbol.returns}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
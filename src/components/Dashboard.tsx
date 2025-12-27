import { useState, useEffect } from 'react';
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
import {
  getPanelOverview,
  getPanelCloseStatistics,
  getPanelStrategyRanking,
  getPanelSymbolLike,
  getPanelSymbolRanking,
  getPanelHistoryEquityLine,
  getPanelDailyProfitLoss,
  PanelOverviewRes,
  PanelCloseStatistics,
  PanelStrategyRankingRes,
  PanelSymbolLikeRes,
  PanelSymbolRankingRes,
  HistoryLine,
  PanelDailyProfitLossRes
} from '../services/api';
import { getToken } from '../utils/storage';
import { formatNumber } from '../utils/format';

export function Dashboard() {
  const [weeklyChartType, setWeeklyChartType] = useState<'rate' | 'amount'>('rate');
  const [timeRange, setTimeRange] = useState<'0' | '3' | '7' | '30' | '90' | '180'>('90');
  const [showTimeRangeDropdown, setShowTimeRangeDropdown] = useState(false);
  const [strategyTimeRange, setStrategyTimeRange] = useState<'0' | '3' | '7' | '30' | '90' | '180'>('90');
  const [showStrategyTimeRangeDropdown, setShowStrategyTimeRangeDropdown] = useState(false);
  const [symbolTimeRange, setSymbolTimeRange] = useState<'0' | '3' | '7' | '30' | '90' | '180'>('90');
  const [showSymbolTimeRangeDropdown, setShowSymbolTimeRangeDropdown] = useState(false);
  const [symbolLikeTimeRange, setSymbolLikeTimeRange] = useState<'0' | '3' | '7' | '30' | '90' | '180'>('90');
  const [showSymbolLikeTimeRangeDropdown, setShowSymbolLikeTimeRangeDropdown] = useState(false);
  const [statisticsTimeRange, setStatisticsTimeRange] = useState<'0' | '3' | '7' | '30' | '90' | '180'>('90');
  const [showStatisticsTimeRangeDropdown, setShowStatisticsTimeRangeDropdown] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API数据状态
  const [overviewData, setOverviewData] = useState<PanelOverviewRes | null>(null);
  const [statisticsData, setStatisticsData] = useState<PanelCloseStatistics | null>(null);
  const [strategyRankingData, setStrategyRankingData] = useState<PanelStrategyRankingRes[]>([]);
  const [symbolLikeData, setSymbolLikeData] = useState<PanelSymbolLikeRes[]>([]);
  const [symbolRankingData, setSymbolRankingData] = useState<PanelSymbolRankingRes[]>([]);
  const [historyEquityLine, setHistoryEquityLine] = useState<HistoryLine | null>(null);
  const [dailyProfitLossData, setDailyProfitLossData] = useState<PanelDailyProfitLossRes | null>(null);

  // 加载所有仪表盘数据
  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = getToken();

      if (!token) {
        throw new Error('未找到登录凭证，请重新登录');
      }

      // 并行加载所有数据
      const [overview, statistics, strategyRanking, symbolLike, symbolRanking, equityLine, dailyProfitLoss] = await Promise.all([
        getPanelOverview(token),
        getPanelCloseStatistics(token, getTimeRangeParams(statisticsTimeRange)),
        getPanelStrategyRanking(token, getTimeRangeParams(strategyTimeRange)),
        getPanelSymbolLike(token, getTimeRangeParams(symbolLikeTimeRange)),
        getPanelSymbolRanking(token, getTimeRangeParams(symbolTimeRange)),
        getPanelHistoryEquityLine(token, getTimeRangeParams(timeRange).startTime, getTimeRangeParams(timeRange).endTime),
        getPanelDailyProfitLoss(token)
      ]);

      setOverviewData(overview);
      setStatisticsData(statistics);
      setStrategyRankingData(strategyRanking);
      setSymbolLikeData(symbolLike);
      setSymbolRankingData(symbolRanking);
      setHistoryEquityLine(equityLine);
      setDailyProfitLossData(dailyProfitLoss);
    } catch (err) {
      console.error('加载仪表盘数据失败:', err);
      setError(err instanceof Error ? err.message : '加载数据失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 格式化日期为 YYYY-MM-DD 00:00:00
  const formatDateToMidnight = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day} 00:00:00`;
  };

  // 获取时间范围参数
  const getTimeRangeParams = (range: '0' | '3' | '7' | '30' | '90' | '180') => {
    const startTime = new Date();
    const endTime = new Date();

    if (range === '0') {
      // 今日：从今天0点开始，到明天0点结束
      endTime.setDate(endTime.getDate() + 1);
    } else {
      startTime.setDate(startTime.getDate() - parseInt(range));
      // 其他范围：endTime 也设置为明天0点
      endTime.setDate(endTime.getDate() + 1);
    }

    return {
      startTime: formatDateToMidnight(startTime),
      endTime: formatDateToMidnight(endTime)
    };
  };

  // 组件挂载时加载数据
  useEffect(() => {
    loadDashboardData();
  }, []);

  // 当时间范围改变时重新加载相关数据
  useEffect(() => {
    const loadStrategyRanking = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const data = await getPanelStrategyRanking(token, getTimeRangeParams(strategyTimeRange));
        setStrategyRankingData(data);
      } catch (err) {
        console.error('加载策略排名失败:', err);
      }
    };

    loadStrategyRanking();
  }, [strategyTimeRange]);

  useEffect(() => {
    const loadSymbolRanking = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const data = await getPanelSymbolRanking(token, getTimeRangeParams(symbolTimeRange));
        setSymbolRankingData(data);
      } catch (err) {
        console.error('加载交易对排名失败:', err);
      }
    };

    loadSymbolRanking();
  }, [symbolTimeRange]);

  useEffect(() => {
    const loadHistoryEquityLine = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const params = getTimeRangeParams(timeRange);
        const data = await getPanelHistoryEquityLine(token, params.startTime, params.endTime);
        setHistoryEquityLine(data);
      } catch (err) {
        console.error('加载历史收益率曲线图失败:', err);
      }
    };

    loadHistoryEquityLine();
  }, [timeRange]);

  // 当商品偏好时间范围改变时重新加载
  useEffect(() => {
    const loadSymbolLike = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const data = await getPanelSymbolLike(token, getTimeRangeParams(symbolLikeTimeRange));
        setSymbolLikeData(data);
      } catch (err) {
        console.error('加载商品偏好数据失败:', err);
      }
    };

    loadSymbolLike();
  }, [symbolLikeTimeRange]);

  // 当交易统计时间范围改变时重新加载
  useEffect(() => {
    const loadStatistics = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const data = await getPanelCloseStatistics(token, getTimeRangeParams(statisticsTimeRange));
        setStatisticsData(data);
      } catch (err) {
        console.error('加载交易统计数据失败:', err);
      }
    };

    loadStatistics();
  }, [statisticsTimeRange]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadDashboardData().finally(() => {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    });
  };

  // 将API数据转换为每日盈亏图表数据格式
  const weeklyData = (() => {
    if (!dailyProfitLossData || !dailyProfitLossData.amount || !dailyProfitLossData.rate) {
      return [];
    }

    const { amount, rate } = dailyProfitLossData;

    // 确保两个数组长度一致
    const length = Math.min(amount.lineX?.length || 0, rate.lineX?.length || 0);
    if (length === 0) return [];

    return amount.lineX.slice(0, length).map((dateStr, index) => {
      // 解析日期字符串 (格式: YYYYMMDD，例如: "20251225")
      let displayDate: string;
      let fullDate: string;

      if (dateStr && dateStr.length === 8) {
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        displayDate = `${month}/${day}`;
        fullDate = `${year}/${month}/${day}`;
      } else {
        displayDate = dateStr;
        fullDate = dateStr;
      }

      return {
        date: displayDate,
        displayDate: displayDate,
        dateRange: fullDate,
        rateChange: (rate.lineY?.[index] || 0) * 100, // 转换为百分比
        amountChange: amount.lineY?.[index] || 0
      };
    });
  })();

  // 将API数据转换为图表数据格式
  const performanceData = (() => {
    if (!historyEquityLine || !historyEquityLine.lineX || !historyEquityLine.lineY) {
      return [];
    }

    return historyEquityLine.lineX.map((dateStr, index) => {
      // 解析日期字符串 (格式: YYYYMMDD，例如: "20251216")
      let month: string;
      let day: string;

      if (dateStr && dateStr.length === 8) {
        // 从YYYYMMDD格式中提取月份和日期
        const year = dateStr.substring(0, 4);
        month = dateStr.substring(4, 6);
        day = dateStr.substring(6, 8);
      } else {
        // 如果格式不正确，尝试使用Date解析
        console.warn(`Unexpected date format: ${dateStr}`);
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          month = '01';
          day = '01';
        } else {
          month = String(date.getMonth() + 1).padStart(2, '0');
          day = String(date.getDate()).padStart(2, '0');
        }
      }

      // Y轴数据（这里是净值equity）
      const equity = historyEquityLine.lineY[index] || 0;

      // 计算收益额和收益率（基于初始净值）
      const initEquity = overviewData?.initEquity || 0;
      const amount = equity - initEquity;  // 收益额 = 当前净值 - 初始净值
      const rate = initEquity > 0 ? (amount / initEquity) * 100 : 0;  // 收益率

      return {
        date: `${month}-${day}`,
        displayDate: `${month}/${day}`,
        rate: rate,
        amount: amount,
        equity: equity  // 保存原始净值
      };
    });
  })();

  // Calculate current returns - 直接使用最新的净值
  const currentEquity = performanceData.length > 0 ? performanceData[performanceData.length - 1].equity : 0;

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

  // 颜色数组用于饼图
  const pieColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16', '#6b7280'];

  // 从API数据计算商品偏好数据
  const symbolPreferenceData = (() => {
    if (!symbolLikeData || symbolLikeData.length === 0) {
      return [];
    }

    const totalTrades = symbolLikeData.reduce((sum, item) => sum + item.tradeCount, 0);

    // 取前5个，其余归为"其他"
    const top5 = symbolLikeData.slice(0, 5);
    const others = symbolLikeData.slice(5);

    const result = top5.map((item, index) => ({
      name: item.symbol,
      value: totalTrades > 0 ? (item.tradeCount / totalTrades) * 100 : 0,
      color: pieColors[index]
    }));

    if (others.length > 0) {
      const othersCount = others.reduce((sum, item) => sum + item.tradeCount, 0);
      result.push({
        name: '其他',
        value: totalTrades > 0 ? (othersCount / totalTrades) * 100 : 0,
        color: '#6b7280'
      });
    }

    return result;
  })();

  // Trading statistics data - 保留mock数据结构以防API数据未加载
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
          <div className="text-xs text-gray-900 mb-1">{data.displayDate}</div>
          <div className="text-xs">
            <span className="text-gray-900">
              {weeklyChartType === 'rate' ? '收益率' : '收益额'}:
            </span>
            {' '}
            <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
              {weeklyChartType === 'rate'
                ? `${isPositive ? '+' : ''}${value.toFixed(2)}%`
                : `${isPositive ? '+' : ''}${formatNumber(Math.abs(value))}`
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
      const value = data.equity;

      return (
        <div className="bg-white border border-gray-200 rounded-lg p-2.5 shadow-lg">
          <div className="text-xs text-gray-900 mb-1">{data.displayDate}</div>
          <div className="text-xs">
            <span className="text-gray-900">
              净值:
            </span>
            {' '}
            <span className="text-gray-900">
              {formatNumber(value)}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Fixed Header Section */}
      <div className="flex-shrink-0">
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
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* 加载状态 */}
        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
              <p className="text-gray-600">加载中...</p>
            </div>
          </div>
        )}

        {/* 错误状态 */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* 数据展示 */}
        {!isLoading && !error && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              {/* Floating P&L */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-gray-600 text-sm mb-2">浮动盈亏</div>
                    <div className={`text-2xl mb-2 ${
                      (overviewData?.unrealisedPnl || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatNumber(Math.abs(overviewData?.unrealisedPnl || 0))}
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${
                      (overviewData?.unrealisedPnl || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {(overviewData?.unrealisedPnl || 0) >= 0 ? (
                        <TrendingUp className="w-3.5 h-3.5" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {overviewData?.initEquity
                          ? `${Math.abs((overviewData.unrealisedPnl / overviewData.initEquity) * 100).toFixed(2)}%`
                          : '0%'
                        }
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Activity className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Total Returns */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-gray-600 text-sm mb-2">总收益额</div>
                    <div className={`text-2xl mb-2 ${
                      (overviewData?.totalClosePnl || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatNumber(Math.abs(overviewData?.totalClosePnl || 0))}
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${
                      (overviewData?.totalClosePnl || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {(overviewData?.totalClosePnl || 0) >= 0 ? (
                        <TrendingUp className="w-3.5 h-3.5" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {overviewData?.initEquity
                          ? `${Math.abs((overviewData.totalClosePnl / overviewData.initEquity) * 100).toFixed(2)}%`
                          : '0%'
                        }
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              {/* Total Net Worth */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-gray-600 text-sm mb-2">总净值</div>
                    <div className="text-gray-900 text-2xl mb-2">
                      {formatNumber(overviewData?.equity || 0)}
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${
                      (overviewData?.equity || 0) >= (overviewData?.initEquity || 0) ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {(overviewData?.equity || 0) >= (overviewData?.initEquity || 0) ? (
                        <TrendingUp className="w-3.5 h-3.5" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {overviewData?.initEquity
                          ? `${(((overviewData.equity - overviewData.initEquity) / overviewData.initEquity) * 100).toFixed(2)}%`
                          : '0%'
                        }
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Initial Net Worth */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-gray-600 text-sm mb-2">初始净值</div>
                    <div className="text-gray-900 text-2xl mb-2">
                      {formatNumber(overviewData?.initEquity || 0)}
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <span>基准值</span>
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
                      weeklyChartType === 'rate' ? `${value}%` : `${Math.abs(value / 1000).toFixed(0)}k`
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
                        : `${value > 0 ? '+' : ''}${formatNumber(Math.abs(value))}`
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
                净值曲线
              </h2>
              <div className="relative">
                <button
                  className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                  onClick={() => setShowTimeRangeDropdown(!showTimeRangeDropdown)}
                >
                  {timeRange === '0' ? '今日' : timeRange === '180' ? '近 半年' : `近 ${timeRange} 日`}
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor" className="text-gray-600">
                    <path d="M5 6L0 0h10L5 6z" />
                  </svg>
                </button>
                {showTimeRangeDropdown && (
                  <div className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[100px] z-10">
                    <button
                      className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                        timeRange === '0' ? 'bg-gray-100' : ''
                      }`}
                      onClick={() => {
                        setTimeRange('0');
                        setShowTimeRangeDropdown(false);
                      }}
                    >
                      今日
                    </button>
                    <button
                      className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                        timeRange === '3' ? 'bg-gray-100' : ''
                      }`}
                      onClick={() => {
                        setTimeRange('3');
                        setShowTimeRangeDropdown(false);
                      }}
                    >
                      近 3 日
                    </button>
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
                      近 半年
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-gray-900 mb-1">
                  <span className="text-3xl font-semibold">
                    {formatNumber(currentEquity)}
                  </span>
                </div>
              </div>
            </div>

            {performanceData.length === 0 ? (
              <div className="flex items-center justify-center h-[340px] text-gray-400">
                <div className="text-center">
                  <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>暂无数据</p>
                </div>
              </div>
            ) : (
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
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    width={60}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '8px 12px'
                    }}
                    formatter={(value: number) => formatNumber(value)}
                    labelFormatter={(label) => label}
                    content={<CustomCumulativeTooltip />}
                  />
                  <Area
                    type="monotone"
                    dataKey="equity"
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
            )}
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
                    {strategyTimeRange === '0' ? '今日' : strategyTimeRange === '180' ? '近 半年' : `近 ${strategyTimeRange} 日`}
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor" className="text-gray-600">
                      <path d="M5 6L0 0h10L5 6z" />
                    </svg>
                  </button>
                  {showStrategyTimeRangeDropdown && (
                    <div className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[100px] z-10">
                      <button
                        className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                          strategyTimeRange === '0' ? 'bg-gray-100' : ''
                        }`}
                        onClick={() => {
                          setStrategyTimeRange('0');
                          setShowStrategyTimeRangeDropdown(false);
                        }}
                      >
                        今日
                      </button>
                      <button
                        className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                          strategyTimeRange === '3' ? 'bg-gray-100' : ''
                        }`}
                        onClick={() => {
                          setStrategyTimeRange('3');
                          setShowStrategyTimeRangeDropdown(false);
                        }}
                      >
                        近 3 日
                      </button>
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
                        近 半年
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-1.5">
                {strategyRankingData.length > 0 ? (
                  strategyRankingData.map((strategy, index) => (
                    <div key={index} className="flex items-center gap-4 rounded-lg p-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-gray-900">{strategy.strategyType || '未知策略'}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`${strategy.totalClosePnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          <div className="flex items-center gap-1 justify-end mb-0.5">
                            {strategy.totalClosePnl >= 0 ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <TrendingDown className="w-4 h-4" />
                            )}
                            <div className="text-lg leading-none">
                              {strategy.totalClosePnl >= 0
                                ? formatNumber(strategy.totalClosePnl)
                                : formatNumber(Math.abs(strategy.totalClosePnl))
                              }
                            </div>
                          </div>
                          <div className="text-xs leading-none">
                            {overviewData?.initEquity
                              ? `${((strategy.totalClosePnl / overviewData.initEquity) * 100).toFixed(2)}%`
                              : '-'
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    暂无策略数据
                  </div>
                )}
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
                    {symbolTimeRange === '0' ? '今日' : symbolTimeRange === '180' ? '近 半年' : `近 ${symbolTimeRange} 日`}
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor" className="text-gray-600">
                      <path d="M5 6L0 0h10L5 6z" />
                    </svg>
                  </button>
                  {showSymbolTimeRangeDropdown && (
                    <div className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[100px] z-10">
                      <button
                        className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                          symbolTimeRange === '0' ? 'bg-gray-100' : ''
                        }`}
                        onClick={() => {
                          setSymbolTimeRange('0');
                          setShowSymbolTimeRangeDropdown(false);
                        }}
                      >
                        今日
                      </button>
                      <button
                        className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                          symbolTimeRange === '3' ? 'bg-gray-100' : ''
                        }`}
                        onClick={() => {
                          setSymbolTimeRange('3');
                          setShowSymbolTimeRangeDropdown(false);
                        }}
                      >
                        近 3 日
                      </button>
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
                        近 半年
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-1.5">
                {symbolRankingData.length > 0 ? (
                  symbolRankingData.map((symbol, index) => {
                    // Calculate bar width percentage based on max value
                    const maxAmount = Math.max(...symbolRankingData.map(s => Math.abs(s.totalClosePnl)));
                    const barWidth = maxAmount > 0 ? (Math.abs(symbol.totalClosePnl) / maxAmount) * 100 : 0;
                    const isPositive = symbol.totalClosePnl >= 0;

                    return (
                      <div key={index} className="flex items-center gap-3 p-2">
                        {/* Symbol Name */}
                        <div className="w-24 text-gray-900 flex-shrink-0">
                          {symbol.symbol}
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
                            <span>{formatNumber(Math.abs(symbol.totalClosePnl))}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    暂无交易对数据
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Symbol Preference & Trading Statistics */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Symbol Preference Pie Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg text-gray-900 font-semibold">商品偏好</h2>
              <div className="relative">
                <button
                  onClick={() => setShowSymbolLikeTimeRangeDropdown(!showSymbolLikeTimeRangeDropdown)}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                >
                  <span>
                    {symbolLikeTimeRange === '0' ? '今日' :
                     symbolLikeTimeRange === '3' ? '近 3 日' :
                     symbolLikeTimeRange === '7' ? '近 7 日' :
                     symbolLikeTimeRange === '30' ? '近 30 日' :
                     symbolLikeTimeRange === '90' ? '近 90 日' : '近 半年'}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showSymbolLikeTimeRangeDropdown && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[100px]">
                    <button className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${symbolLikeTimeRange === '0' ? 'bg-gray-100' : ''}`} onClick={() => { setSymbolLikeTimeRange('0'); setShowSymbolLikeTimeRangeDropdown(false); }}>今日</button>
                    <button className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${symbolLikeTimeRange === '3' ? 'bg-gray-100' : ''}`} onClick={() => { setSymbolLikeTimeRange('3'); setShowSymbolLikeTimeRangeDropdown(false); }}>近 3 日</button>
                    <button className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${symbolLikeTimeRange === '7' ? 'bg-gray-100' : ''}`} onClick={() => { setSymbolLikeTimeRange('7'); setShowSymbolLikeTimeRangeDropdown(false); }}>近 7 日</button>
                    <button className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${symbolLikeTimeRange === '30' ? 'bg-gray-100' : ''}`} onClick={() => { setSymbolLikeTimeRange('30'); setShowSymbolLikeTimeRangeDropdown(false); }}>近 30 日</button>
                    <button className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${symbolLikeTimeRange === '90' ? 'bg-gray-100' : ''}`} onClick={() => { setSymbolLikeTimeRange('90'); setShowSymbolLikeTimeRangeDropdown(false); }}>近 90 日</button>
                    <button className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${symbolLikeTimeRange === '180' ? 'bg-gray-100' : ''}`} onClick={() => { setSymbolLikeTimeRange('180'); setShowSymbolLikeTimeRangeDropdown(false); }}>近 半年</button>
                  </div>
                )}
              </div>
            </div>
            {symbolPreferenceData.length > 0 ? (
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
                        <span className="text-gray-900 text-sm md:text-base flex-shrink-0">{item.value.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                暂无商品偏好数据
              </div>
            )}
          </div>

          {/* Trading Statistics */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg text-gray-900 font-semibold">交易统计</h2>
              <div className="relative">
                <button
                  onClick={() => setShowStatisticsTimeRangeDropdown(!showStatisticsTimeRangeDropdown)}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                >
                  <span>
                    {statisticsTimeRange === '0' ? '今日' :
                     statisticsTimeRange === '3' ? '近 3 日' :
                     statisticsTimeRange === '7' ? '近 7 日' :
                     statisticsTimeRange === '30' ? '近 30 日' :
                     statisticsTimeRange === '90' ? '近 90 日' : '近 半年'}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showStatisticsTimeRangeDropdown && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[100px]">
                    <button className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${statisticsTimeRange === '0' ? 'bg-gray-100' : ''}`} onClick={() => { setStatisticsTimeRange('0'); setShowStatisticsTimeRangeDropdown(false); }}>今日</button>
                    <button className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${statisticsTimeRange === '3' ? 'bg-gray-100' : ''}`} onClick={() => { setStatisticsTimeRange('3'); setShowStatisticsTimeRangeDropdown(false); }}>近 3 日</button>
                    <button className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${statisticsTimeRange === '7' ? 'bg-gray-100' : ''}`} onClick={() => { setStatisticsTimeRange('7'); setShowStatisticsTimeRangeDropdown(false); }}>近 7 日</button>
                    <button className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${statisticsTimeRange === '30' ? 'bg-gray-100' : ''}`} onClick={() => { setStatisticsTimeRange('30'); setShowStatisticsTimeRangeDropdown(false); }}>近 30 日</button>
                    <button className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${statisticsTimeRange === '90' ? 'bg-gray-100' : ''}`} onClick={() => { setStatisticsTimeRange('90'); setShowStatisticsTimeRangeDropdown(false); }}>近 90 日</button>
                    <button className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${statisticsTimeRange === '180' ? 'bg-gray-100' : ''}`} onClick={() => { setStatisticsTimeRange('180'); setShowStatisticsTimeRangeDropdown(false); }}>近 半年</button>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">仓位总数</span>
                <span className="text-gray-900">{statisticsData?.positionCount || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">盈利交易</span>
                <span className="text-green-600">
                  {statisticsData?.winCount || 0} / {
                    statisticsData?.positionCount
                      ? ((statisticsData.winCount / statisticsData.positionCount) * 100).toFixed(1)
                      : '0'
                  }%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">亏损交易</span>
                <span className="text-red-600">
                  {statisticsData?.lossCount || 0} / {
                    statisticsData?.positionCount
                      ? ((statisticsData.lossCount / statisticsData.positionCount) * 100).toFixed(1)
                      : '0'
                  }%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">盈亏比</span>
                <span className="text-gray-900">
                  {statisticsData?.winAmount && statisticsData?.lossAmount
                    ? (Math.abs(statisticsData.winAmount / statisticsData.lossAmount)).toFixed(2)
                    : '0'
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">最大回撤</span>
                <span className="text-red-600">
                  {statisticsData?.maxDrawdownRate
                    ? `${(statisticsData.maxDrawdownRate * 100).toFixed(2)}%`
                    : '0%'
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">总交易量</span>
                <span className="text-gray-900">
                  {formatNumber(statisticsData?.totalTradeAmount || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">总手续费</span>
                <span className="text-gray-900">
                  {formatNumber(statisticsData?.totalFee || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">盈利金额</span>
                <span className="text-green-600">
                  {formatNumber(statisticsData?.winAmount || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">亏损金额</span>
                <span className="text-red-600">
                  {formatNumber(Math.abs(statisticsData?.lossAmount || 0))}
                </span>
              </div>
            </div>
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
}
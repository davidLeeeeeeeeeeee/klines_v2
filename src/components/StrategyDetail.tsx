import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import {
  getStrategyPanelOverview,
  getStrategyCloseStatistics,
  getStrategyDailyProfitLoss,
  getStrategyHistoryEquityLine,
  getStrategySymbolLike,
  getStrategySymbolRanking,
  StrategyPanelOverviewRes,
  StrategyCloseStatisticsRes,
  StrategySymbolLikeRes,
  StrategySymbolRankingRes,
  PanelDailyProfitLossRes,
  HistoryLineRes
} from '../services/api';
import { getToken } from '../utils/storage';
import { formatNumber } from '../utils/format';

interface StrategyDetailProps {
  strategyName: string | null;
  aiModel?: string;
  runDays?: number;
  description?: string;
  onBack: () => void;
}

// 时间范围类型
type TimeRangeType = '1' | '3' | '7' | '30' | '90' | '180';

// 时间范围选项配置
const TIME_RANGE_OPTIONS: { value: TimeRangeType; label: string }[] = [
  { value: '1', label: '今日' },
  { value: '3', label: '近 3 日' },
  { value: '7', label: '近 7 日' },
  { value: '30', label: '近 30 日' },
  { value: '90', label: '近 90 日' },
  { value: '180', label: '近 半年' },
];

// 获取时间范围显示文本
const getTimeRangeLabel = (value: TimeRangeType) => {
  return TIME_RANGE_OPTIONS.find(opt => opt.value === value)?.label || '';
};

export function StrategyDetail({ strategyName, aiModel, runDays, description, onBack }: StrategyDetailProps) {
  const [weeklyChartType, setWeeklyChartType] = useState<'rate' | 'amount'>('rate');
  // 净值曲线时间范围
  const [timeRange, setTimeRange] = useState<TimeRangeType>('90');
  const [showTimeRangeDropdown, setShowTimeRangeDropdown] = useState(false);
  // 商品排名时间范围
  const [symbolRankingTimeRange, setSymbolRankingTimeRange] = useState<TimeRangeType>('90');
  const [showSymbolRankingDropdown, setShowSymbolRankingDropdown] = useState(false);
  // 商品偏好时间范围
  const [symbolPreferenceTimeRange, setSymbolPreferenceTimeRange] = useState<TimeRangeType>('90');
  const [showSymbolPreferenceDropdown, setShowSymbolPreferenceDropdown] = useState(false);
  // 交易统计时间范围
  const [tradingStatsTimeRange, setTradingStatsTimeRange] = useState<TimeRangeType>('90');
  const [showTradingStatsDropdown, setShowTradingStatsDropdown] = useState(false);

  // API 数据状态
  const [isLoading, setIsLoading] = useState(true);
  const [overviewData, setOverviewData] = useState<StrategyPanelOverviewRes | null>(null);
  const [statisticsData, setStatisticsData] = useState<StrategyCloseStatisticsRes | null>(null);
  const [dailyProfitLossData, setDailyProfitLossData] = useState<PanelDailyProfitLossRes | null>(null);
  const [equityLineData, setEquityLineData] = useState<HistoryLineRes | null>(null);
  const [symbolLikeData, setSymbolLikeData] = useState<StrategySymbolLikeRes[]>([]);
  const [symbolRankingData, setSymbolRankingData] = useState<StrategySymbolRankingRes[]>([]);

  // 计算时间范围
  const getTimeRange = useCallback((days: string) => {
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day} 00:00:00`;
    };
    const startDate = new Date();
    const endDate = new Date();
    // endTime 设置为明天0点，确保包含今天的所有数据
    endDate.setDate(endDate.getDate() + 1);
    const endTime = formatDate(endDate);
    // 今日(days='1')时 startDate 不变，其他情况减去对应天数
    if (days !== '1') {
      startDate.setDate(startDate.getDate() - parseInt(days));
    }
    const startTime = formatDate(startDate);
    return { startTime, endTime };
  }, []);

  // 加载基础数据（只有总览不依赖时间范围）
  const loadBaseData = useCallback(async () => {
    if (!strategyName) return;
    const token = getToken();
    if (!token) return;

    try {
      const overview = await getStrategyPanelOverview(token, strategyName);
      setOverviewData(overview);
    } catch (error) {
      console.error('加载基础数据失败:', error);
    }
  }, [strategyName]);

  // 加载每日盈亏数据（不依赖时间范围，使用API默认数据）
  const loadDailyPnlData = useCallback(async () => {
    if (!strategyName) return;
    const token = getToken();
    if (!token) return;

    try {
      const dailyPnl = await getStrategyDailyProfitLoss(token, strategyName);
      setDailyProfitLossData(dailyPnl);
    } catch (error) {
      console.error('加载每日盈亏数据失败:', error);
    }
  }, [strategyName]);

  // 加载净值曲线数据（依赖 timeRange）
  const loadEquityData = useCallback(async () => {
    if (!strategyName) return;
    const token = getToken();
    if (!token) return;

    try {
      const { startTime, endTime } = getTimeRange(timeRange);
      const equityLine = await getStrategyHistoryEquityLine(token, strategyName, startTime, endTime);
      setEquityLineData(equityLine);
    } catch (error) {
      console.error('加载净值数据失败:', error);
    }
  }, [strategyName, timeRange, getTimeRange]);

  // 加载交易统计数据（依赖 tradingStatsTimeRange）
  const loadTradingStatsData = useCallback(async () => {
    if (!strategyName) return;
    const token = getToken();
    if (!token) return;

    try {
      const { startTime, endTime } = getTimeRange(tradingStatsTimeRange);
      const statistics = await getStrategyCloseStatistics(token, strategyName, { startTime, endTime });
      setStatisticsData(statistics);
    } catch (error) {
      console.error('加载交易统计数据失败:', error);
    }
  }, [strategyName, tradingStatsTimeRange, getTimeRange]);

  // 加载商品排名数据（依赖 symbolRankingTimeRange）
  const loadSymbolRankingData = useCallback(async () => {
    if (!strategyName) return;
    const token = getToken();
    if (!token) return;

    try {
      const { startTime, endTime } = getTimeRange(symbolRankingTimeRange);
      const symbolRanking = await getStrategySymbolRanking(token, strategyName, { startTime, endTime });
      setSymbolRankingData(symbolRanking);
    } catch (error) {
      console.error('加载商品排名数据失败:', error);
    }
  }, [strategyName, symbolRankingTimeRange, getTimeRange]);

  // 加载商品偏好数据（依赖 symbolPreferenceTimeRange）
  const loadSymbolPreferenceData = useCallback(async () => {
    if (!strategyName) return;
    const token = getToken();
    if (!token) return;

    try {
      const { startTime, endTime } = getTimeRange(symbolPreferenceTimeRange);
      const symbolLike = await getStrategySymbolLike(token, strategyName, { startTime, endTime });
      setSymbolLikeData(symbolLike);
    } catch (error) {
      console.error('加载商品偏好数据失败:', error);
    }
  }, [strategyName, symbolPreferenceTimeRange, getTimeRange]);

  // 使用 ref 跟踪是否已完成初始加载
  const initialLoadDone = useRef(false);

  // 初始加载 - 只在 strategyName 变化时执行
  useEffect(() => {
    if (!strategyName) return;

    const loadAllData = async () => {
      setIsLoading(true);
      const token = getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // 直接调用API，不依赖callback
        const { startTime: equityStart, endTime: equityEnd } = getTimeRange(timeRange);
        const { startTime: rankingStart, endTime: rankingEnd } = getTimeRange(symbolRankingTimeRange);
        const { startTime: prefStart, endTime: prefEnd } = getTimeRange(symbolPreferenceTimeRange);
        const { startTime: statsStart, endTime: statsEnd } = getTimeRange(tradingStatsTimeRange);

        const [overview, dailyPnl, equityLine, statistics, symbolRanking, symbolLike] = await Promise.all([
          getStrategyPanelOverview(token, strategyName),
          getStrategyDailyProfitLoss(token, strategyName),
          getStrategyHistoryEquityLine(token, strategyName, equityStart, equityEnd),
          getStrategyCloseStatistics(token, strategyName, { startTime: statsStart, endTime: statsEnd }),
          getStrategySymbolRanking(token, strategyName, { startTime: rankingStart, endTime: rankingEnd }),
          getStrategySymbolLike(token, strategyName, { startTime: prefStart, endTime: prefEnd })
        ]);

        setOverviewData(overview);
        setDailyProfitLossData(dailyPnl);
        setEquityLineData(equityLine);
        setStatisticsData(statistics);
        setSymbolRankingData(symbolRanking);
        setSymbolLikeData(symbolLike);
        initialLoadDone.current = true;
      } catch (error) {
        console.error('加载数据失败:', error);
      }
      setIsLoading(false);
    };

    loadAllData();
  }, [strategyName]); // 只依赖 strategyName

  // 时间范围变化时重新加载净值数据
  useEffect(() => {
    if (initialLoadDone.current) {
      loadEquityData();
    }
  }, [timeRange, loadEquityData]);

  // 商品排名时间范围变化时重新加载
  useEffect(() => {
    if (initialLoadDone.current) {
      loadSymbolRankingData();
    }
  }, [symbolRankingTimeRange, loadSymbolRankingData]);

  // 商品偏好时间范围变化时重新加载
  useEffect(() => {
    if (initialLoadDone.current) {
      loadSymbolPreferenceData();
    }
  }, [symbolPreferenceTimeRange, loadSymbolPreferenceData]);

  // 交易统计时间范围变化时重新加载
  useEffect(() => {
    if (initialLoadDone.current) {
      loadTradingStatsData();
    }
  }, [tradingStatsTimeRange, loadTradingStatsData]);

  // 转换每日盈亏数据为图表格式
  // API返回格式: { amount: { lineX: string[], lineY: number[] }, rate: { lineX: string[], lineY: number[] } }
  const weeklyData = dailyProfitLossData?.rate?.lineX?.map((dateStr, index) => {
    // 日期格式: "20251225" -> "12-25"
    const formattedDate = dateStr.length === 8
      ? `${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`
      : dateStr;
    return {
      date: formattedDate,
      displayDate: formattedDate,
      rateChange: dailyProfitLossData.rate.lineY[index] ?? 0,
      amountChange: dailyProfitLossData.amount?.lineY[index] ?? 0
    };
  }) || [];

  // 转换净值曲线数据为图表格式
  // API返回格式: { lineX: string[], lineY: number[] }
  const performanceData = equityLineData?.lineX?.map((dateStr, index) => {
    // 日期格式: "20251225" -> "12-25"
    const formattedDate = dateStr.length === 8
      ? `${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`
      : dateStr;
    return {
      date: formattedDate,
      amount: equityLineData.lineY[index] ?? 0
    };
  }) || [];

  // 计算当前净值
  const currentAmount = performanceData.length > 0 ? performanceData[performanceData.length - 1].amount : 0;

  // 转换商品排名数据
  const topSymbols = symbolRankingData.map((item, index) => ({
    id: index + 1,
    name: item.symbol,
    amount: item.totalClosePnl
  }));

  // 转换商品偏好数据为饼图格式
  const pieColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#6b7280', '#ef4444', '#06b6d4', '#ec4899'];
  const totalTradeCount = symbolLikeData.reduce((sum, item) => sum + item.tradeCount, 0);
  const symbolPreferenceData = symbolLikeData.slice(0, 5).map((item, index) => ({
    name: item.symbol,
    value: totalTradeCount > 0 ? Number(((item.tradeCount / totalTradeCount) * 100).toFixed(1)) : 0,
    color: pieColors[index % pieColors.length]
  }));

  // 计算交易统计数据
  const winCount = statisticsData?.winCount ?? 0;
  const lossCount = statisticsData?.lossCount ?? 0;
  const totalTrades = winCount + lossCount;
  const winRate = totalTrades > 0 ? Number(((winCount / totalTrades) * 100).toFixed(1)) : 0;
  const lossRate = totalTrades > 0 ? Number(((lossCount / totalTrades) * 100).toFixed(1)) : 0;
  const winAmount = statisticsData?.winAmount ?? 0;
  const lossAmount = statisticsData?.lossAmount ?? 0;
  const profitLossRatio = lossAmount !== 0 ? Number((winAmount / Math.abs(lossAmount)).toFixed(2)) : 0;

  const tradingStats = {
    totalPositions: statisticsData?.positionCount ?? 0,
    profitTrades: winCount,
    profitTradesRate: winRate,
    lossTrades: lossCount,
    lossTradesRate: lossRate,
    profitLossRatio: profitLossRatio,
    maxDrawdown: statisticsData?.maxDrawdownRate ? Number((statisticsData.maxDrawdownRate * 100).toFixed(2)) : 0,
    totalVolume: formatNumber(statisticsData?.totalTradeAmount ?? 0),
    totalFees: formatNumber(statisticsData?.totalFee ?? 0)
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
            <span className="text-gray-900">收益率: </span>
            <span className={isRatePositive ? 'text-green-600' : 'text-red-600'}>
              {isRatePositive ? '+' : '-'}{Math.abs(rateValue).toFixed(2)}%
            </span>
          </div>
          <div className="text-xs">
            <span className="text-gray-900">收益额: </span>
            <span className={isAmountPositive ? 'text-green-600' : 'text-red-600'}>
              {isAmountPositive ? '+' : '-'}{formatNumber(Math.abs(amountValue))}
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
              {formatNumber(Math.abs(value))}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  // 加载状态显示
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  // 顶部总览数据
  const totalClosePnl = overviewData?.totalClosePnl ?? 0;
  const followAccountNum = overviewData?.followAccountNum ?? 0;
  const totalFund = overviewData?.totalFund ?? 0;

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
              <div className="flex items-baseline gap-3">
                <h1 className="text-2xl font-semibold text-gray-900">{strategyName}</h1>
                {aiModel && (
                  <span className="text-gray-500 text-lg">{aiModel}</span>
                )}
                {runDays !== undefined && (
                  <span className="px-3 py-1 rounded-full text-sm bg-green-50 text-green-600 border border-green-200">
                    运行 {runDays} 天
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Key Metrics Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {/* Description */}
          {description && (
            <p className="text-gray-600 mb-6 pb-4 border-b border-gray-200">{description}</p>
          )}

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-sm text-gray-500 mb-2">近90日盈亏</div>
              <div className={`text-2xl ${totalClosePnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalClosePnl >= 0 ? formatNumber(totalClosePnl) : `-${formatNumber(Math.abs(totalClosePnl))}`}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-500 mb-2">胜率</div>
              <div className="text-green-600 text-2xl">
                {(() => {
                  const winCount = overviewData?.winCount ?? 0;
                  const lossCount = overviewData?.lossCount ?? 0;
                  const total = winCount + lossCount;
                  if (total === 0) return '0%';
                  return ((winCount / total) * 100).toFixed(1) + '%';
                })()}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-500 mb-2">跟随账户</div>
              <div className="text-gray-900 text-2xl">{followAccountNum}</div>
            </div>

            <div>
              <div className="text-sm text-gray-500 mb-2">资金规模</div>
              <div className="text-gray-900 text-2xl">{formatNumber(totalFund)}</div>
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
                      ? `${value.toFixed(2)}%`
                      : formatNumber(Math.abs(value))
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
                {getTimeRangeLabel(timeRange)}
                <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor" className="text-gray-600">
                  <path d="M5 6L0 0h10L5 6z" />
                </svg>
              </button>
              {showTimeRangeDropdown && (
                <div className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[100px] z-10">
                  {TIME_RANGE_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                        timeRange === option.value ? 'bg-gray-100' : ''
                      }`}
                      onClick={() => {
                        setTimeRange(option.value);
                        setShowTimeRangeDropdown(false);
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-green-600 mb-1">
                <span className="text-3xl font-semibold">{formatNumber(currentAmount)}</span>
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
                  tickFormatter={(value) => `${Math.abs(value / 1000).toFixed(0)}k`}
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
                    onClick={() => setShowSymbolRankingDropdown(!showSymbolRankingDropdown)}
                  >
                    {getTimeRangeLabel(symbolRankingTimeRange)}
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor" className="text-gray-600">
                      <path d="M5 6L0 0h10L5 6z" />
                    </svg>
                  </button>
                  {showSymbolRankingDropdown && (
                    <div className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[100px] z-10">
                      {TIME_RANGE_OPTIONS.map(option => (
                        <button
                          key={option.value}
                          className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                            symbolRankingTimeRange === option.value ? 'bg-gray-100' : ''
                          }`}
                          onClick={() => {
                            setSymbolRankingTimeRange(option.value);
                            setShowSymbolRankingDropdown(false);
                          }}
                        >
                          {option.label}
                        </button>
                      ))}
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
                          <span>{formatNumber(Math.abs(symbol.amount))}</span>
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
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-lg text-gray-900 font-semibold">商品偏好</h2>
              <div className="relative">
                <button
                  className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                  onClick={() => setShowSymbolPreferenceDropdown(!showSymbolPreferenceDropdown)}
                >
                  {getTimeRangeLabel(symbolPreferenceTimeRange)}
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor" className="text-gray-600">
                    <path d="M5 6L0 0h10L5 6z" />
                  </svg>
                </button>
                {showSymbolPreferenceDropdown && (
                  <div className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[100px] z-10">
                    {TIME_RANGE_OPTIONS.map(option => (
                      <button
                        key={option.value}
                        className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                          symbolPreferenceTimeRange === option.value ? 'bg-gray-100' : ''
                        }`}
                        onClick={() => {
                          setSymbolPreferenceTimeRange(option.value);
                          setShowSymbolPreferenceDropdown(false);
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
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
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-lg text-gray-900 font-semibold">交易统计</h2>
              <div className="relative">
                <button
                  className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                  onClick={() => setShowTradingStatsDropdown(!showTradingStatsDropdown)}
                >
                  {getTimeRangeLabel(tradingStatsTimeRange)}
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor" className="text-gray-600">
                    <path d="M5 6L0 0h10L5 6z" />
                  </svg>
                </button>
                {showTradingStatsDropdown && (
                  <div className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[100px] z-10">
                    {TIME_RANGE_OPTIONS.map(option => (
                      <button
                        key={option.value}
                        className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                          tradingStatsTimeRange === option.value ? 'bg-gray-100' : ''
                        }`}
                        onClick={() => {
                          setTradingStatsTimeRange(option.value);
                          setShowTradingStatsDropdown(false);
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
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
                <span className="text-blue-600">{tradingStats.profitLossRatio} : 1</span>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { ChevronDown, X, Play, XCircle, Loader2 } from 'lucide-react';
import { getPositionList, getPositionChat, PositionResponse, ChatResponse } from '../services/api';
import { getToken } from '../utils/storage';
import { JsonViewer } from './JsonViewer';

interface AccountMonitorProps {
  onBack: () => void;
}

interface Position {
  id: string;
  accountUid: string;
  accountName: string;
  type: 'long' | 'short';
  symbol: string;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  leverage: number;
  takeProfit: number | null;
  stopLoss: number | null;
  createdAt: string;
}

interface HistoricalTrade {
  id: string;
  accountUid: string;
  accountName: string;
  type: 'long' | 'short';
  symbol: string;
  realizedPnL: number;
  realizedPnLPercent: number;
  quantity: number;
  entryPrice: number;
  exitPrice: number;
  leverage: number;
  openTime: string;
  closeTime: string;
  openFee: number;
  closeFee: number;
  fundingFee: number;
  tradeType: string;
  tradeAction: '开仓买入' | '开仓卖出' | '平仓买入' | '平仓卖出';
}

export function AccountMonitor({ onBack }: AccountMonitorProps) {
  const [selectedStrategy, setSelectedStrategy] = useState('all');
  const [showStrategyDropdown, setShowStrategyDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<'positions' | 'history'>('positions');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState('all');
  const [showSymbolDropdown, setShowSymbolDropdown] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [showAIChatModal, setShowAIChatModal] = useState(false);
  const [selectedAIChat, setSelectedAIChat] = useState<ChatResponse | null>(null);
  const [expandedPrompt, setExpandedPrompt] = useState(true);
  const [expandedReasoning, setExpandedReasoning] = useState(true);
  const [expandedOutput, setExpandedOutput] = useState(true);
  const [showBatchCloseModal, setShowBatchCloseModal] = useState(false);
  const [batchCloseSymbol, setBatchCloseSymbol] = useState('BTCUSDT');
  const [batchCloseAction, setBatchCloseAction] = useState<'long' | 'short' | null>(null);

  // API数据状态
  const [positions, setPositions] = useState<PositionResponse[]>([]);
  const [isLoadingPositions, setIsLoadingPositions] = useState(false);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [error, setError] = useState<string>('');

  // 获取持仓列表
  useEffect(() => {
    fetchPositions();
  }, [selectedSymbol]);

  const fetchPositions = async () => {
    setIsLoadingPositions(true);
    setError('');
    try {
      const token = getToken();
      if (!token) {
        throw new Error('未登录，请先登录');
      }

      const symbol = selectedSymbol === 'all' ? undefined : selectedSymbol;
      const data = await getPositionList(token, symbol);
      setPositions(data);
    } catch (err: any) {
      setError(err.message || '获取持仓列表失败');
      console.error('获取持仓列表失败:', err);
    } finally {
      setIsLoadingPositions(false);
    }
  };

  // 获取AI Chat
  const fetchAIChat = async (accountId: number, symbol: string, side: string) => {
    setIsLoadingChat(true);
    try {
      const token = getToken();
      if (!token) {
        throw new Error('未登录，请先登录');
      }

      const chatData = await getPositionChat(token, {
        accountId,
        symbol,
        side,
      });

      setSelectedAIChat(chatData);
      setShowAIChatModal(true);
    } catch (err: any) {
      alert(err.message || '获取AI Chat失败');
      console.error('获取AI Chat失败:', err);
    } finally {
      setIsLoadingChat(false);
    }
  };

  // 将API数据转换为组件使用的Position格式
  const convertToPosition = (apiPosition: PositionResponse): Position => {
    return {
      id: `${apiPosition.accountId}-${apiPosition.symbol}-${apiPosition.side}`,
      accountUid: String(apiPosition.accountId),
      accountName: apiPosition.accountName,
      type: apiPosition.side === 'Buy' ? 'long' : 'short',
      symbol: apiPosition.symbol,
      unrealizedPnL: apiPosition.unrealisedPnl,
      unrealizedPnLPercent: apiPosition.entryPrice > 0
        ? (apiPosition.unrealisedPnl / (apiPosition.entryPrice * apiPosition.qty)) * 100
        : 0,
      quantity: apiPosition.qty,
      entryPrice: apiPosition.entryPrice,
      currentPrice: apiPosition.lastPrice,
      leverage: apiPosition.leverage,
      takeProfit: apiPosition.takeProfit || null,
      stopLoss: apiPosition.stopLoss || null,
      createdAt: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).replace(/\//g, '-'),
    };
  };

  // 获取转换后的持仓列表
  const currentPositions: Position[] = positions.map(convertToPosition);

  // Function to calculate holding duration
  const calculateDuration = (openTime: string, closeTime: string) => {
    const open = new Date(openTime);
    const close = new Date(closeTime);
    const diffMs = close.getTime() - open.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffDays > 0) {
      return `${diffDays}天${diffHours}小时${diffMinutes}分`;
    } else if (diffHours > 0) {
      return `${diffHours}小时${diffMinutes}分钟`;
    } else {
      return `${diffMinutes}分钟`;
    }
  };

  // Function to format time as MM/DD HH:mm:ss
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${month}/${day} ${hours}:${minutes}:${seconds}`;
  };

  // Function to handle close position
  const handleClosePosition = (position: Position) => {
    setSelectedPosition(position);
    setShowCloseModal(true);
  };

  // Function to confirm close position
  const confirmClosePosition = () => {
    // Handle closing position logic here
    console.log('Closing position:', selectedPosition);
    setShowCloseModal(false);
    setSelectedPosition(null);
  };

  // Get action badge color
  const getActionColor = (action: string) => {
    switch (action) {
      case '开多':
        return 'bg-green-100 text-green-600';
      case '开空':
        return 'bg-red-100 text-red-600';
      case '平多':
        return 'bg-green-100 text-green-600';
      case '平空':
        return 'bg-red-100 text-red-600';
      case '观望':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // Symbols list
  const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'DOGEUSDT'];

  // Mock strategies data
  const strategies = [
    { id: 'all', name: '所有策略' },
    { id: '1', name: '趋势追踪策略' },
    { id: '2', name: '网格交易策略' },
    { id: '3', name: '套利策略' },
    { id: '4', name: '高频交易策略' }
  ];

  // Mock historical trades data
  const historicalTrades: HistoricalTrade[] = [
    {
      id: '1',
      accountUid: 'BN001',
      accountName: '主账户 - Binance',
      type: 'long',
      symbol: 'BTC/USDT',
      realizedPnL: 1850.50,
      realizedPnLPercent: 9.2,
      quantity: 0.3,
      entryPrice: 40000,
      exitPrice: 46500,
      leverage: 5,
      openTime: '2024-03-15 10:30:21',
      closeTime: '2024-03-18 14:20:21',
      openFee: 10,
      closeFee: 15,
      fundingFee: 5,
      tradeType: 'AI平仓',
      tradeAction: '平仓卖出'
    },
    {
      id: '2',
      accountUid: 'OKX002',
      accountName: '备用账户 - OKX',
      type: 'short',
      symbol: 'ETH/USDT',
      realizedPnL: -420.30,
      realizedPnLPercent: -3.5,
      quantity: 5,
      entryPrice: 3200,
      exitPrice: 3450,
      leverage: 3,
      openTime: '2024-03-16 08:15:32',
      closeTime: '2024-03-17 16:45:18',
      openFee: 5,
      closeFee: 10,
      fundingFee: 2,
      tradeType: '止损',
      tradeAction: '平仓买入'
    },
    {
      id: '3',
      accountUid: 'HB003',
      accountName: '测试账户 - Huobi',
      type: 'long',
      symbol: 'ADA/USDT',
      realizedPnL: 125.80,
      realizedPnLPercent: 15.3,
      quantity: 1000,
      entryPrice: 0.55,
      exitPrice: 0.63,
      leverage: 2,
      openTime: '2024-03-14 12:00:45',
      closeTime: '2024-03-16 09:30:12',
      openFee: 1,
      closeFee: 2,
      fundingFee: 0.5,
      tradeType: '止盈',
      tradeAction: '平仓卖出'
    }
  ];

  const selectedStrategyName = strategies.find(s => s.id === selectedStrategy)?.name || '';

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">交易监控</h1>
          <p className="text-sm text-gray-500">管理交易所账户持仓</p>
        </div>
        <button
          onClick={() => setShowBatchCloseModal(true)}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
        >
          一键平仓
        </button>
      </div>

      {/* Filters - Strategy and Search */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Strategy Selector */}
          <div className="relative">
            <button
              onClick={() => setShowStrategyDropdown(!showStrategyDropdown)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-left flex items-center justify-between hover:border-gray-400 transition-colors"
            >
              <span className="text-gray-900">{selectedStrategyName}</span>
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </button>

            {showStrategyDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-20">
                {strategies.map((strategy) => (
                  <button
                    key={strategy.id}
                    onClick={() => {
                      setSelectedStrategy(strategy.id);
                      setShowStrategyDropdown(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                      selectedStrategy === strategy.id ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                    }`}
                  >
                    {strategy.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Filter */}
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="输入用户名、交易账户UID"
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Tab Navigation with Symbol Filter */}
      <div className="mb-6 flex items-center gap-8">
        <button
          onClick={() => setActiveTab('positions')}
          className={`pb-3 text-base transition-colors relative ${
            activeTab === 'positions'
              ? 'text-gray-900 font-semibold'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          当前仓位
          {activeTab === 'positions' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 text-base transition-colors relative ${
            activeTab === 'history'
              ? 'text-gray-900 font-semibold'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          历史仓位
          {activeTab === 'history' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
          )}
        </button>

        {/* Symbol Filter */}
        <div className="relative">
          <button
            onClick={() => setShowSymbolDropdown(!showSymbolDropdown)}
            className="flex items-center gap-1.5 pb-3 text-base text-gray-700 hover:text-gray-900 transition-colors"
          >
            <span>{selectedSymbol === 'all' ? '商品' : selectedSymbol}</span>
            <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor" className="text-gray-500">
              <path d="M5 6L0 0h10L5 6z" />
            </svg>
          </button>

          {showSymbolDropdown && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-20 min-w-[140px]">
              <button
                onClick={() => {
                  setSelectedSymbol('all');
                  setShowSymbolDropdown(false);
                }}
                className={`w-full px-4 py-2 text-left text-base hover:bg-gray-50 transition-colors ${
                  selectedSymbol === 'all' ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                }`}
              >
                全部
              </button>
              {symbols.map((symbol) => (
                <button
                  key={symbol}
                  onClick={() => {
                    setSelectedSymbol(symbol);
                    setShowSymbolDropdown(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-base hover:bg-gray-50 transition-colors ${
                    selectedSymbol === symbol ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                  }`}
                >
                  {symbol}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Current Positions */}
      {activeTab === 'positions' && (
        <div className="space-y-4">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Loading State */}
          {isLoadingPositions ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
              <div className="text-gray-600">加载持仓数据中...</div>
            </div>
          ) : currentPositions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="text-gray-400 mb-2">暂无持仓</div>
              <div className="text-sm text-gray-500">当前没有活跃的持仓</div>
            </div>
          ) : (
            currentPositions.map((position) => (
              <div key={position.id} className="bg-white rounded-lg shadow-sm p-6 pb-4">
                {/* Header Row */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-gray-900 font-semibold">{position.symbol}</span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-2xl text-sm">
                        {position.leverage}x
                      </span>
                      <span
                        className={`px-3 py-1 rounded-2xl text-sm ${
                          position.type === 'long'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {position.type === 'long' ? '开多' : '开空'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      UID: {position.accountUid}
                    </div>
                  </div>
                  
                  <div className={`text-right ${position.unrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <div className="text-sm text-gray-500 mb-1">未结盈亏</div>
                    <div>
                      <span className="text-lg">{position.unrealizedPnL >= 0 ? '+' : ''}${position.unrealizedPnL.toFixed(2)}</span>
                      <span className="text-sm ml-1">({position.unrealizedPnLPercent >= 0 ? '+' : ''}{position.unrealizedPnLPercent}%)</span>
                    </div>
                  </div>
                </div>

                {/* Position Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">订单数量</div>
                    <div className="text-gray-900">{position.quantity}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500 mb-1">入场价格</div>
                    <div className="text-gray-900">${position.entryPrice.toLocaleString()}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500 mb-1">止盈/止损</div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">
                        {position.takeProfit ? `$${position.takeProfit.toLocaleString()}` : '-'}
                      </span>
                      <span className="text-gray-400">/</span>
                      <span className="text-red-600">
                        {position.stopLoss ? `$${position.stopLoss.toLocaleString()}` : '-'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="text-sm text-gray-500">
                    创建时间: <span className="text-gray-900">{position.createdAt}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      onClick={() => {
                        const apiPosition = positions.find(p =>
                          `${p.accountId}-${p.symbol}-${p.side}` === position.id
                        );
                        if (apiPosition) {
                          fetchAIChat(apiPosition.accountId, apiPosition.symbol, apiPosition.side);
                        }
                      }}
                      disabled={isLoadingChat}
                    >
                      {isLoadingChat ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          加载中...
                        </>
                      ) : (
                        'AI CHAT'
                      )}
                    </button>
                    <button
                      className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      onClick={() => handleClosePosition(position)}
                    >
                      平仓
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Historical Trades */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {historicalTrades.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="text-gray-400 mb-2">暂无历史交易</div>
              <div className="text-sm text-gray-500">当前策略没有已完成的交易记录</div>
            </div>
          ) : (
            historicalTrades.map((trade) => (
              <div key={trade.id} className="bg-white rounded-lg shadow-sm p-6 pb-4">
                {/* Header Row */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-gray-900 font-semibold">{trade.symbol}</span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-2xl text-sm">
                        {trade.leverage}x
                      </span>
                      <span
                        className={`px-3 py-1 rounded-2xl text-sm ${
                          trade.tradeAction === '平仓卖出'
                            ? 'bg-red-100 text-red-600'
                            : trade.tradeAction === '平仓买入'
                            ? 'bg-green-100 text-green-600'
                            : trade.tradeAction.includes('买入')
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {trade.tradeAction === '平仓卖出' ? '平空' : trade.tradeAction === '平仓买入' ? '平多' : trade.tradeAction}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      UID: {trade.accountUid}
                    </div>
                  </div>
                  
                  <div className={`text-right ${trade.realizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <div className="text-sm text-gray-500 mb-1">已结盈亏</div>
                    <div>
                      <span className="text-lg">{trade.realizedPnL >= 0 ? '+' : ''}${trade.realizedPnL.toFixed(2)}</span>
                      <span className="text-sm ml-1">({trade.realizedPnLPercent >= 0 ? '+' : ''}{trade.realizedPnLPercent}%)</span>
                    </div>
                  </div>
                </div>

                {/* Trade Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">订单数量</div>
                    <div className="text-gray-900">{trade.quantity}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500 mb-1">入场价格</div>
                    <div className="text-gray-900">${trade.entryPrice.toLocaleString()}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500 mb-1">出场价格</div>
                    <div className="text-gray-900">${trade.exitPrice.toLocaleString()}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500 mb-1">成交类型</div>
                    <div className="text-gray-900">{trade.tradeType}</div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 mb-4"></div>

                {/* Fee Information */}
                <div className="grid grid-cols-1 gap-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">开仓手续费</span>
                    <span className="text-sm text-gray-900">{trade.openFee} USDT</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">平仓手续费</span>
                    <span className="text-sm text-gray-900">{trade.closeFee} USDT</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">资金费用</span>
                    <span className="text-sm text-gray-900">{trade.fundingFee} USDT</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="text-sm text-gray-500">
                    持仓时长: <span className="text-gray-900">{formatTime(trade.openTime)}-{formatTime(trade.closeTime)} {calculateDuration(trade.openTime, trade.closeTime)}</span>
                  </div>
                  <button
                    className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => {
                      setSelectedAIChat({
                        strategyName: '趋势追踪策略',
                        symbol: trade.symbol,
                        action: '交易复盘',
                        timestamp: new Date().toISOString(),
                        summary: '分析已完成的交易，评估交易决策是否正确，并总结经验教训。',
                        prompt: `分析已完成的 ${trade.symbol} 交易，评估交易决策是否正确，并总结经验教训。考虑以下因素：1) 入场时机是否合理；2) 出场时机是否及时；3) 风险控制是否得当；4) 是否达到预期目标。`,
                        reasoning: `交易回顾：本次${trade.type === 'long' ? '多' : '空'}仓交易${trade.symbol}，入场价格$${trade.entryPrice.toLocaleString()}，出场价格$${trade.exitPrice.toLocaleString()}。持仓时长：${calculateDuration(trade.openTime, trade.closeTime)}。市场环境分析：入场时市场趋势${trade.type === 'long' ? '向上' : '向下'}，符合策略要求。风险管理：使用${trade.leverage}x杠杆，在可控范围内。出场原因：${trade.tradeType}触发，执行了预设的风险管理规则。盈亏分析：最终实现盈亏${trade.realizedPnL >= 0 ? '+' : ''}$${trade.realizedPnL.toFixed(2)}（${trade.realizedPnLPercent >= 0 ? '+' : ''}${trade.realizedPnLPercent}%）。成本分析：开仓手续费$${trade.openFee}，平仓手续费$${trade.closeFee}，资金费用$${trade.fundingFee}，总成本$${trade.openFee + trade.closeFee + trade.fundingFee}。综合评估：${trade.realizedPnL >= 0 ? '交易决策正确，风险控制得当，值得复制' : '交易出现亏损，需要反思入场时机和风险管理'}。`,
                        output: `📊 交易复盘报告\n\n交易概况：\n商品：${trade.symbol}\n类型：${trade.type === 'long' ? '多仓' : '空仓'}\n杠杆：${trade.leverage}x\n持仓时长：${calculateDuration(trade.openTime, trade.closeTime)}\n\n价格表现：\n入场价格：$${trade.entryPrice.toLocaleString()}\n出场价格：$${trade.exitPrice.toLocaleString()}\n价格变动：${trade.type === 'long' ? '+' : '-'}${Math.abs(((trade.exitPrice - trade.entryPrice) / trade.entryPrice) * 100).toFixed(2)}%\n\n盈亏分析：\n已结盈亏：${trade.realizedPnL >= 0 ? '+' : ''}$${trade.realizedPnL.toFixed(2)} (${trade.realizedPnLPercent >= 0 ? '+' : ''}${trade.realizedPnLPercent}%)\n手续费成本：$${trade.openFee + trade.closeFee + trade.fundingFee}\n\n出场方式：${trade.tradeType}\n\n${trade.realizedPnL >= 0 ? '✅ 成功案例\n• 入场时机把握准确\n• 风险控制执行到位\n• 值得作为成功模板' : '⚠️ 需要改进\n• 反思入场时机选择\n• 优化风险控制策略\n• 总结经验教训'}\n\n综合评分：${trade.realizedPnL >= 0 ? '85/100' : '65/100'}`
                      });
                      setShowAIChatModal(true);
                    }}
                  >
                    AI CHAT
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Close Position Modal */}
      {showCloseModal && selectedPosition && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/30 flex items-end justify-center z-50">
          <div 
            className="bg-white rounded-t-3xl shadow-xl p-6 w-full max-w-4xl h-[85vh] flex flex-col animate-slide-up"
            style={{
              animation: 'slideUp 0.3s ease-out'
            }}
          >
            {/* Modal Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">平仓</h2>
                <button
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowCloseModal(false)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {/* Divider */}
              <div className="border-t border-gray-200"></div>
            </div>

            {/* Position Info */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-gray-900 font-semibold">{selectedPosition.symbol}</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-2xl text-sm">
                  {selectedPosition.leverage}x
                </span>
                <span
                  className={`px-3 py-1 rounded-2xl text-sm ${
                    selectedPosition.type === 'long'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  {selectedPosition.type === 'long' ? '开多' : '开空'}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">入场价格</span>
                  <span className="text-sm text-gray-900 font-medium">${selectedPosition.entryPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">市场价格</span>
                  <span className="text-sm text-gray-900 font-medium">${selectedPosition.currentPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">数量</span>
                  <span className="text-sm text-gray-900 font-medium">{selectedPosition.quantity}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-sm text-gray-500">预计盈亏</span>
                  <span className={`text-sm font-semibold ${selectedPosition.unrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedPosition.unrealizedPnL >= 0 ? '+' : ''}${selectedPosition.unrealizedPnL.toFixed(2)} (${selectedPosition.unrealizedPnLPercent >= 0 ? '+' : ''}{selectedPosition.unrealizedPnLPercent}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Spacer to push buttons to bottom */}
            <div className="flex-1"></div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => setShowCloseModal(false)}
              >
                取消
              </button>
              <button
                className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                onClick={confirmClosePosition}
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

      {/* AI Chat Modal */}
      {showAIChatModal && selectedAIChat && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/30 flex items-end justify-center z-50">
          <div 
            className="bg-white rounded-t-3xl shadow-xl p-6 w-full max-w-4xl h-[85vh] flex flex-col animate-slide-up"
            style={{
              animation: 'slideUp 0.3s ease-out'
            }}
          >
            {/* Modal Header */}
            <div className="mb-4 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">AI CHAT</h2>
                <button
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowAIChatModal(false)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {/* Divider */}
              <div className="border-t border-gray-200"></div>
            </div>

            {/* AI Chat Content - Scrollable */}
            <div className="flex-1 overflow-y-auto pr-2">
              {/* Card Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-gray-700">{selectedAIChat.strategyType || '策略'}</span>
                  <span className="text-gray-400">｜</span>
                  <span className="text-gray-900">ID: {selectedAIChat.id}</span>
                </div>
                <div className="text-sm text-gray-500 ml-4 whitespace-nowrap">
                  {selectedAIChat.createTime ? new Date(selectedAIChat.createTime).toLocaleString('zh-CN', {
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                  }) : ''}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 mb-4"></div>

              {/* Model Info */}
              {selectedAIChat.model && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
                  <div className="text-sm text-gray-500 mb-1">模型</div>
                  <div className="text-gray-900">{selectedAIChat.model}</div>
                </div>
              )}

              {/* Prompt - Collapsible with JSON Viewer */}
              <div className="mb-4">
                <button
                  onClick={() => setExpandedPrompt(!expandedPrompt)}
                  className="flex items-center gap-2 text-left text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {expandedPrompt ? (
                    <Play className="w-3 h-3 rotate-90 fill-current" />
                  ) : (
                    <Play className="w-3 h-3 fill-current" />
                  )}
                  <span>USER_PROMPT</span>
                </button>

                {expandedPrompt && (
                  <div className="mt-2 bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <div className="text-gray-700 text-sm font-mono">
                      {(() => {
                        try {
                          const promptData = JSON.parse(selectedAIChat.prompt);
                          return <JsonViewer data={promptData} defaultExpanded={true} />;
                        } catch {
                          return <div className="whitespace-pre-wrap">{selectedAIChat.prompt}</div>;
                        }
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* Response - Collapsible with JSON Viewer */}
              <div className="mb-4">
                <button
                  onClick={() => setExpandedReasoning(!expandedReasoning)}
                  className="flex items-center gap-2 text-left text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {expandedReasoning ? (
                    <Play className="w-3 h-3 rotate-90 fill-current" />
                  ) : (
                    <Play className="w-3 h-3 fill-current" />
                  )}
                  <span>CHAIN_OF_THOUGHT</span>
                </button>

                {expandedReasoning && (
                  <div className="mt-2 bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <div className="text-gray-700 text-sm font-mono">
                      {(() => {
                        try {
                          const responseData = JSON.parse(selectedAIChat.response);
                          return <JsonViewer data={responseData} defaultExpanded={true} />;
                        } catch {
                          return <div className="whitespace-pre-wrap">{selectedAIChat.response}</div>;
                        }
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Close Button */}
            <div className="mt-4 flex-shrink-0">
              <button
                className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                onClick={() => setShowAIChatModal(false)}
              >
                关闭
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
      
      {/* Batch Close Modal */}
      {showBatchCloseModal && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/30 backdrop-blur-sm flex items-end justify-center z-50">
          <div 
            className="bg-white rounded-t-3xl shadow-xl p-6 w-full max-w-4xl h-[85vh] flex flex-col animate-slide-up"
            style={{
              animation: 'slideUp 0.3s ease-out'
            }}
          >
            {/* Modal Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">一键平仓</h2>
                <button
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => {
                    setShowBatchCloseModal(false);
                    setBatchCloseSymbol('BTCUSDT');
                    setBatchCloseAction(null);
                  }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {/* Divider */}
              <div className="border-t border-gray-200"></div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Info Alert */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  ⚠️ 一键平仓将批量平掉所选条件的所有持仓，请谨慎操作
                </p>
              </div>

              {/* Symbol Selector */}
              <div className="mb-6">
                <label className="block text-sm text-gray-700 mb-3">
                  选择商品
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {symbols.map((symbol) => (
                    <button
                      key={symbol}
                      onClick={() => setBatchCloseSymbol(symbol)}
                      className={`px-4 py-3 rounded-lg border transition-colors ${
                        batchCloseSymbol === symbol
                          ? 'bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {symbol}
                    </button>
                  ))}
                </div>
              </div>

              {/* Position Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-sm text-gray-600 mb-2">将要平仓的持仓数量</div>
                <div className="text-2xl text-gray-900">
                  {currentPositions.filter(p => 
                    p.symbol.replace('/', '') === batchCloseSymbol && (!batchCloseAction || p.type === batchCloseAction)
                  ).length} 个仓位
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setBatchCloseAction('long');
                    console.log('平多操作:', { symbol: batchCloseSymbol, action: 'long' });
                    alert(`已执行平多操作\n商品: ${batchCloseSymbol}`);
                    setShowBatchCloseModal(false);
                    setBatchCloseSymbol('BTCUSDT');
                    setBatchCloseAction(null);
                  }}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  平多
                </button>
                <button
                  onClick={() => {
                    setBatchCloseAction('short');
                    console.log('平空操作:', { symbol: batchCloseSymbol, action: 'short' });
                    alert(`已执行平空操作\n商品: ${batchCloseSymbol}`);
                    setShowBatchCloseModal(false);
                    setBatchCloseSymbol('BTCUSDT');
                    setBatchCloseAction(null);
                  }}
                  className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  平空
                </button>
              </div>
              <button
                onClick={() => {
                  setShowBatchCloseModal(false);
                  setBatchCloseSymbol('BTCUSDT');
                  setBatchCloseAction(null);
                }}
                className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
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
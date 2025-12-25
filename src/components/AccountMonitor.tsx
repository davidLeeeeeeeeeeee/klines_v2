import { useState, useEffect, useRef } from 'react';
import { ChevronDown, X, Play, XCircle, RefreshCw, Loader2, Copy } from 'lucide-react';
import {
  getPositionList,
  getPositionChat,
  getClosedPositionList,
  getChatDetail,
  closeAllPositions,
  closeOnePosition,
  getSystemDict,
  PositionResponse,
  ChatResponse,
  ClosePnlVO,
  PageRequest,
  ClosePnlListReq,
  ClosePositionReq,
  DictItem
} from '../services/api';
import { getToken } from '../utils/storage';
import { JsonViewer } from './JsonViewer';
import { useClickOutside } from '../hooks/useClickOutside';

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
  curRealisedPnl: number; // 已结盈亏
  plBalancePrice: number; // 盈亏平衡价
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  leverage: number;
  takeProfit: number | null;
  stopLoss: number | null;
  createdAt: string;
  strategyType: string;
  exchange: string;
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
  orderCreateTime: string; // 订单创建时间
  openFee: number;
  closeFee: number;
  fundingFee: number;
  tradeType: string;
  tradeAction: '开仓买入' | '开仓卖出' | '平仓买入' | '平仓卖出';
}

export function AccountMonitor({ onBack }: AccountMonitorProps) {
  const formatClipboardText = (data: unknown) => {
    if (data === null || data === undefined) return '';
    if (typeof data === 'string') return data;
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  const copyToClipboard = async (data: unknown) => {
    const text = formatClipboardText(data);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  };

  const [selectedStrategy, setSelectedStrategy] = useState('all');
  const [showStrategyDropdown, setShowStrategyDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<'positions' | 'history'>('positions');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState('all');
  const [showSymbolDropdown, setShowSymbolDropdown] = useState(false);
  const [selectedType, setSelectedType] = useState('all');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [showAIChatModal, setShowAIChatModal] = useState(false);
  const [selectedAIChat, setSelectedAIChat] = useState<ChatResponse | null>(null);
  const [isChatForClosing, setIsChatForClosing] = useState(false); // 标识是否为平仓CHAT
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null); // 用于筛选accountActions
  const [selectedClosePrice, setSelectedClosePrice] = useState<number | null>(null); // 平仓价格
  const [selectedPositionSide, setSelectedPositionSide] = useState<string | null>(null); // 仓位方向
  const [selectedEntryPrice, setSelectedEntryPrice] = useState<number | null>(null); // 开仓价格
  const [expandedPrompt, setExpandedPrompt] = useState(false); // 默认收起
  const [expandedReasoning, setExpandedReasoning] = useState(true);
  const [expandedOutput, setExpandedOutput] = useState(true);
  const [showBatchCloseModal, setShowBatchCloseModal] = useState(false);
  const [batchCloseSymbol, setBatchCloseSymbol] = useState('BTCUSDT');
  const [batchCloseAction, setBatchCloseAction] = useState<'long' | 'short' | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Refs for click outside detection
  const strategyDropdownRef = useRef<HTMLDivElement>(null);
  const symbolDropdownRef = useRef<HTMLDivElement>(null);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const closeModalRef = useRef<HTMLDivElement>(null);
  const aiChatModalRef = useRef<HTMLDivElement>(null);
  const batchCloseModalRef = useRef<HTMLDivElement>(null);

  // Click outside handlers
  useClickOutside(strategyDropdownRef, () => setShowStrategyDropdown(false));
  useClickOutside(symbolDropdownRef, () => setShowSymbolDropdown(false));
  useClickOutside(typeDropdownRef, () => setShowTypeDropdown(false));
  useClickOutside(closeModalRef, () => {
    if (showCloseModal) {
      setShowCloseModal(false);
      setSelectedPosition(null);
    }
  });
  useClickOutside(aiChatModalRef, () => setShowAIChatModal(false));
  useClickOutside(batchCloseModalRef, () => {
    if (showBatchCloseModal) {
      setShowBatchCloseModal(false);
      setBatchCloseSymbol('BTCUSDT');
      setBatchCloseAction(null);
    }
  });

  // API相关状态
  const [positions, setPositions] = useState<PositionResponse[]>([]);
  const [isLoadingPositions, setIsLoadingPositions] = useState(false);
  const [loadingChatId, setLoadingChatId] = useState<string | null>(null); // 记录正在加载的position ID
  const [error, setError] = useState('');

  // 商品列表 - 从系统字典API获取
  const [symbolList, setSymbolList] = useState<DictItem[]>([]);
  // 策略列表 - 从系统字典API获取
  const [strategyModelList, setStrategyModelList] = useState<DictItem[]>([]);

  // 历史仓位相关状态
  const [closedPositions, setClosedPositions] = useState<ClosePnlVO[]>([]);
  const [isLoadingClosedPositions, setIsLoadingClosedPositions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loadingHistoryChatId, setLoadingHistoryChatId] = useState<string | null>(null);

  // 获取持仓列表
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

  // 获取历史仓位列表
  const fetchClosedPositions = async (page: number = currentPage) => {
    setIsLoadingClosedPositions(true);
    setError('');
    try {
      const token = getToken();
      if (!token) {
        throw new Error('未登录，请先登录');
      }

      // 根据类型筛选确定side参数
      // closeLong: 平多 = side: 'Sell' (卖出平多)
      // closeShort: 平空 = side: 'Buy' (买入平空)
      let sideParam: string | undefined = undefined;
      if (selectedType === 'closeLong') {
        sideParam = 'Sell';
      } else if (selectedType === 'closeShort') {
        sideParam = 'Buy';
      }

      const request: PageRequest<ClosePnlListReq> = {
        page: page - 1, // API从0开始
        pageSize: pageSize,
        param: {
          symbol: selectedSymbol === 'all' ? undefined : selectedSymbol,
          side: sideParam,
        }
      };

      const data = await getClosedPositionList(token, request);
      setClosedPositions(data.records);
      setTotalRecords(data.total);
    } catch (err: any) {
      setError(err.message || '获取历史仓位失败');
      console.error('获取历史仓位失败:', err);
    } finally {
      setIsLoadingClosedPositions(false);
    }
  };

  // 获取AI Chat（当前仓位）
  const fetchAIChat = async (positionId: string, accountId: number, symbol: string, side: string) => {
    setLoadingChatId(positionId);
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
      setIsChatForClosing(false); // 当前仓位的Chat是开仓CHAT
      setShowAIChatModal(true);
    } catch (err: any) {
      alert(err.message || '获取AI Chat失败');
      console.error('获取AI Chat失败:', err);
    } finally {
      setLoadingChatId(null);
    }
  };

  // 获取历史Chat详情
  const fetchHistoryChat = async (
    tradeId: number,
    chatId: number,
    isClosing: boolean = false,
    accountId?: number,
    closePrice?: number,
    positionSide?: string,
    entryPrice?: number
  ) => {
    const loadingKey = `${tradeId}-${chatId}`;
    setLoadingHistoryChatId(loadingKey);
    try {
      const token = getToken();
      if (!token) {
        throw new Error('未登录，请先登录');
      }

      const chatData = await getChatDetail(token, chatId);
      setSelectedAIChat(chatData);
      setIsChatForClosing(isClosing); // 设置是否为平仓CHAT
      setSelectedAccountId(accountId || null); // 设置选中的账户ID用于筛选accountActions
      setSelectedClosePrice(closePrice || null); // 设置平仓价格
      setSelectedPositionSide(positionSide || null); // 设置仓位方向
      setSelectedEntryPrice(entryPrice || null); // 设置开仓价格
      setShowAIChatModal(true);
    } catch (err: any) {
      alert(err.message || '获取Chat详情失败');
      console.error('获取Chat详情失败:', err);
    } finally {
      setLoadingHistoryChatId(null);
    }
  };

  // 数据转换函数
  const convertToPosition = (apiPos: PositionResponse): Position => {
    return {
      id: `${apiPos.accountId}-${apiPos.symbol}-${apiPos.side}`,
      accountUid: apiPos.accountId.toString(),
      accountName: apiPos.accountName,
      type: apiPos.side === 'Buy' ? 'long' : 'short',
      symbol: apiPos.symbol,
      unrealizedPnL: apiPos.unrealisedPnl,
      unrealizedPnLPercent: apiPos.marginPlRatio * 100, // 使用API返回的保证金盈亏比率
      curRealisedPnl: apiPos.curRealisedPnl || 0, // 已结盈亏
      plBalancePrice: apiPos.plBalancePrice || 0, // 盈亏平衡价
      quantity: apiPos.qty,
      entryPrice: apiPos.entryPrice,
      currentPrice: apiPos.lastPrice,
      leverage: apiPos.leverage,
      takeProfit: apiPos.takeProfit || null,
      stopLoss: apiPos.stopLoss || null,
      createdAt: apiPos.createdTime || '',
      strategyType: apiPos.strategyType || '',
      exchange: apiPos.exchange || 'BYBIT',
    };
  };

  // 获取系统字典（商品列表和策略列表）
  const fetchSystemDict = async () => {
    try {
      const dictData = await getSystemDict();
      setSymbolList(dictData.SymbolType || []);
      setStrategyModelList(dictData.StrategyModel || []);
      console.log('📊 获取到商品列表:', dictData.SymbolType);
      console.log('📊 获取到策略列表:', dictData.StrategyModel);
    } catch (err: any) {
      console.error('获取系统字典失败:', err);
    }
  };

  // 组件挂载时获取系统字典
  useEffect(() => {
    fetchSystemDict();
  }, []);

  // 加载持仓数据
  useEffect(() => {
    fetchPositions();
  }, [selectedSymbol]);

  // 加载历史仓位数据 - 所有筛选条件改变都重新请求
  useEffect(() => {
    if (activeTab === 'history') {
      fetchClosedPositions(1); // 筛选条件改变时重置到第一页
      setCurrentPage(1);
    }
  }, [activeTab, selectedSymbol, selectedType, selectedStrategy]);

  // 分页改变时重新请求
  useEffect(() => {
    if (activeTab === 'history') {
      fetchClosedPositions(currentPage);
    }
  }, [currentPage]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    if (activeTab === 'positions') {
      fetchPositions();
    } else {
      fetchClosedPositions(currentPage);
    }
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  // Function to calculate holding duration
  const calculateDuration = (openTime: string, closeTime: string) => {
    const open = new Date(openTime);
    const close = new Date(closeTime);
    const diffMs = close.getTime() - open.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    if (diffDays > 0) {
      return `${diffDays}天${diffHours}小时${diffMinutes}分${diffSeconds}秒`;
    } else if (diffHours > 0) {
      return `${diffHours}小时${diffMinutes}分${diffSeconds}秒`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}分${diffSeconds}秒`;
    } else {
      return `${diffSeconds}秒`;
    }
  };

  // Function to calculate duration from a past time to now
  const calculateDurationToNow = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    if (diffDays > 0) {
      return `${diffDays}天${diffHours}小时${diffMinutes}分${diffSeconds}秒`;
    } else if (diffHours > 0) {
      return `${diffHours}小时${diffMinutes}分${diffSeconds}秒`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}分${diffSeconds}秒`;
    } else {
      return `${diffSeconds}秒`;
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

  // Function to format position time with open/close time and duration
  const formatPositionTime = (openTime: string, closeTime: string) => {
    const open = new Date(openTime);
    const close = new Date(closeTime);
    const diffMs = close.getTime() - open.getTime();
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const remainingSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    return {
      openTimeFormatted: formatTime(openTime),
      closeTimeFormatted: formatTime(closeTime),
      durationFormatted: `${totalMinutes}分${remainingSeconds}秒`
    };
  };

  // Function to handle close position
  const handleClosePosition = (position: Position) => {
    setSelectedPosition(position);
    setShowCloseModal(true);
  };

  // Function to confirm close position
  const confirmClosePosition = async () => {
    if (!selectedPosition) return;

    try {
      const token = getToken();
      if (!token) {
        alert('未登录，请先登录');
        return;
      }

      if (!confirm(`确定要平掉 ${selectedPosition.symbol} 的${selectedPosition.type === 'long' ? '多' : '空'}单持仓吗？`)) {
        return;
      }

      // 从API数据中获取accountId
      const apiPosition = positions.find(p =>
        `${p.accountId}-${p.symbol}-${p.side}` === selectedPosition.id
      );

      if (!apiPosition) {
        alert('找不到对应的持仓信息');
        return;
      }

      const request: ClosePositionReq = {
        accountId: apiPosition.accountId,
        symbol: selectedPosition.symbol.replace('/', ''), // 移除斜杠，如 BTC/USDT -> BTCUSDT
        closeSide: selectedPosition.type === 'long' ? 'Buy' : 'Sell',
      };

      console.log('单个平仓操作:', request);
      const result = await closeOnePosition(token, request);

      if (result) {
        alert(`平仓成功！\n商品: ${selectedPosition.symbol}\n类型: ${selectedPosition.type === 'long' ? '多单' : '空单'}`);
        setShowCloseModal(false);
        setSelectedPosition(null);
        // 刷新持仓列表
        fetchPositions();
      } else {
        alert('平仓失败，请重试');
      }
    } catch (err: any) {
      console.error('平仓操作失败:', err);
      alert(`平仓操作失败: ${err.message || '未知错误'}`);
    }
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

  // Symbols list - 从系统字典API获取
  const symbols = symbolList.map(item => item.code);
  console.log('📊 可用的交易对列表:', symbols);

  // 策略列表 - 使用系统字典API获取的StrategyModel
  const strategies = [
    { id: 'all', name: '策略' },
    ...strategyModelList.map(item => ({ id: item.code, name: item.name }))
  ];

  // 从API数据转换为组件需要的格式
  const allCurrentPositions: Position[] = positions.map(convertToPosition);

  // 筛选当前持仓
  const currentPositions = allCurrentPositions.filter((position) => {
    // 按搜索框筛选
    if (searchFilter) {
      const searchLower = searchFilter.toLowerCase();
      if (!position.accountUid.toLowerCase().includes(searchLower) &&
        !position.accountName.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // 按类型筛选
    if (selectedType !== 'all') {
      if (selectedType === 'long' && position.type !== 'long') return false;
      if (selectedType === 'short' && position.type !== 'short') return false;
    }

    // 按策略筛选
    if (selectedStrategy !== 'all' && position.strategyType !== selectedStrategy) {
      return false;
    }

    return true;
  });

  // 筛选历史仓位
  const filteredClosedPositions = closedPositions.filter((position) => {
    // 按搜索框筛选
    if (searchFilter) {
      const searchLower = searchFilter.toLowerCase();
      if (!position.accountId.toString().toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // 按类型筛选
    if (selectedType !== 'all') {
      // ClosePnlVO 中的 side 字段表示平仓操作的方向
      // side: "Sell" 表示卖出平仓 = 平多（平掉多单）
      // side: "Buy" 表示买入平仓 = 平空（平掉空单）
      if (selectedType === 'closeLong' && position.side !== 'Sell') return false;
      if (selectedType === 'closeShort' && position.side !== 'Buy') return false;
    }

    // 按策略筛选
    if (selectedStrategy !== 'all' && position.strategyType !== selectedStrategy) {
      return false;
    }

    return true;
  });

  // 计算总的持仓盈亏
  const totalUnrealizedPnL = currentPositions.reduce((sum, position) => sum + position.unrealizedPnL, 0);

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
      orderCreateTime: '2024-03-15 10:30:00',
      openFee: 10,
      closeFee: 15,
      fundingFee: 5,
      tradeType: 'AI平仓',
      tradeAction: '平仓卖出'
    },
    {
      id: '2',
      accountUid: 'OKX002',
      accountName: '备用账 - OKX',
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
      orderCreateTime: '2024-03-16 08:15:00',
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
      orderCreateTime: '2024-03-14 12:00:00',
      openFee: 1,
      closeFee: 2,
      fundingFee: 0.5,
      tradeType: '止盈',
      tradeAction: '平仓卖出'
    }
  ];

  const selectedStrategyName = strategies.find(s => s.id === selectedStrategy)?.name || '';

  return (
    <div className="flex flex-col h-full">
      {/* Fixed Header Section */}
      <div className="flex-shrink-0">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-semibold text-gray-900">交易监控</h1>
              <button
                onClick={handleRefresh}
                className={`p-2 text-gray-400 hover:text-gray-600 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
                title="刷新"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500">管理交易所账户持仓</p>
          </div>
          <button
            onClick={() => setShowBatchCloseModal(true)}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            一键平仓
          </button>
        </div>

        {/* Search Filter */}
        <div className="mb-6">
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="输入用户名、交易账户UID"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          />
        </div>

      {/* Tab Navigation with Filters */}
      <div className="mb-6 flex items-center gap-8">
        <button
          onClick={() => {
            setActiveTab('positions');
            setSelectedType('all'); // 切换Tab时重置类型筛选
          }}
          className={`pb-3 text-base transition-colors relative ${activeTab === 'positions'
              ? 'text-gray-900 font-semibold'
              : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          仓位
          {activeTab === 'positions' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
          )}
        </button>
        <button
          onClick={() => {
            setActiveTab('history');
            setSelectedType('all'); // 切换Tab时重置类型筛选
          }}
          className={`pb-3 text-base transition-colors relative ${activeTab === 'history'
              ? 'text-gray-900 font-semibold'
              : 'text-gray-700 hover:text-gray-900'
            }`}
        >
          历史仓位
          {activeTab === 'history' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
          )}
        </button>

        {/* Strategy Selector */}
        <div className="relative" ref={strategyDropdownRef}>
          <button
            onClick={() => {
              setShowStrategyDropdown(!showStrategyDropdown);
              setShowSymbolDropdown(false);
            }}
            className="flex items-center gap-1.5 pb-3 text-base text-gray-700 hover:text-gray-900 transition-colors"
          >
            <span>{selectedStrategy === 'all' ? '策略' : selectedStrategyName}</span>
            <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor" className="text-gray-500">
              <path d="M5 6L0 0h10L5 6z" />
            </svg>
          </button>

          {showStrategyDropdown && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-20 min-w-[140px]">
              {strategies.map((strategy) => (
                <button
                  key={strategy.id}
                  onClick={() => {
                    setSelectedStrategy(strategy.id);
                    setShowStrategyDropdown(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-base hover:bg-gray-50 transition-colors ${selectedStrategy === strategy.id ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                    }`}
                >
                  {strategy.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Symbol Filter */}
        <div className="relative" ref={symbolDropdownRef}>
          <button
            onClick={() => {
              setShowSymbolDropdown(!showSymbolDropdown);
              setShowStrategyDropdown(false);
              setShowTypeDropdown(false);
            }}
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
                className={`w-full px-4 py-2 text-left text-base hover:bg-gray-50 transition-colors ${selectedSymbol === 'all' ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
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
                  className={`w-full px-4 py-2 text-left text-base hover:bg-gray-50 transition-colors ${selectedSymbol === symbol ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                    }`}
                >
                  {symbol}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Type Filter */}
        <div className="relative" ref={typeDropdownRef}>
          <button
            onClick={() => {
              setShowTypeDropdown(!showTypeDropdown);
              setShowStrategyDropdown(false);
              setShowSymbolDropdown(false);
            }}
            className="flex items-center gap-1.5 pb-3 text-base text-gray-700 hover:text-gray-900 transition-colors"
          >
            <span>
              {selectedType === 'all'
                ? '类型'
                : activeTab === 'positions'
                  ? (selectedType === 'long' ? '多单' : '空单')
                  : (selectedType === 'closeLong' ? '平多' : '平空')
              }
            </span>
            <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor" className="text-gray-500">
              <path d="M5 6L0 0h10L5 6z" />
            </svg>
          </button>

          {showTypeDropdown && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-20 min-w-[140px]">
              <button
                onClick={() => {
                  setSelectedType('all');
                  setShowTypeDropdown(false);
                }}
                className={`w-full px-4 py-2 text-left text-base hover:bg-gray-50 transition-colors ${selectedType === 'all' ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                  }`}
              >
                全部
              </button>
              {activeTab === 'positions' ? (
                <>
                  <button
                    onClick={() => {
                      setSelectedType('long');
                      setShowTypeDropdown(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-base hover:bg-gray-50 transition-colors ${selectedType === 'long' ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                      }`}
                  >
                    多单
                  </button>
                  <button
                    onClick={() => {
                      setSelectedType('short');
                      setShowTypeDropdown(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-base hover:bg-gray-50 transition-colors ${selectedType === 'short' ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                      }`}
                  >
                    空单
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setSelectedType('closeLong');
                      setShowTypeDropdown(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-base hover:bg-gray-50 transition-colors ${selectedType === 'closeLong' ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                      }`}
                  >
                    平多
                  </button>
                  <button
                    onClick={() => {
                      setSelectedType('closeShort');
                      setShowTypeDropdown(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-base hover:bg-gray-50 transition-colors ${selectedType === 'closeShort' ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                      }`}
                  >
                    平空
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Position Count Display */}
        <div className="ml-auto text-right">
          <div className="text-sm text-gray-500">仓位数量</div>
          <div className="text-lg font-semibold text-gray-900">
            {activeTab === 'positions' ? currentPositions.length : filteredClosedPositions.length}
          </div>
        </div>

        {/* Total PnL Display */}
        <div className="text-right ml-6">
          <div className="text-sm text-gray-500">总盈亏</div>
          <div className={`text-lg font-semibold ${activeTab === 'positions'
              ? (totalUnrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600')
              : (filteredClosedPositions.reduce((sum, t) => sum + t.closedPnl, 0) >= 0 ? 'text-green-600' : 'text-red-600')
            }`}>
            {activeTab === 'positions'
              ? Math.abs(totalUnrealizedPnL).toFixed(2)
              : Math.abs(filteredClosedPositions.reduce((sum, t) => sum + t.closedPnl, 0)).toFixed(2)
            }
          </div>
        </div>
      </div>
      </div>

      {/* Scrollable List Content */}
      <div className="flex-1 overflow-y-auto">
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
                        className={`px-3 py-1 rounded-2xl text-sm ${position.type === 'long'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                          }`}
                      >
                        {position.type === 'long' ? '开多' : '开空'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {position.exchange}: {position.accountUid}
                    </div>
                  </div>

                  <div className={`text-right ${position.unrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <div className="text-sm text-gray-500 mb-1">浮动盈亏</div>
                    <div>
                      <span className="text-lg">{Math.abs(position.unrealizedPnL).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      <span className="text-sm ml-1">({Math.abs(position.unrealizedPnLPercent).toFixed(1)}%)</span>
                    </div>
                  </div>
                </div>

                {/* Position Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">订单数量</div>
                    <div className="text-gray-900">{position.quantity.toLocaleString()}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500 mb-1">入场价格</div>
                    <div className="text-gray-900">{position.entryPrice.toLocaleString()}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500 mb-1">盈亏平衡价</div>
                    <div className="text-gray-900">{position.plBalancePrice.toLocaleString()}</div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 mb-4"></div>

                {/* Additional Information */}
                <div className="grid grid-cols-1 gap-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">止盈/止损</span>
                    <div className="flex items-center gap-0.5">
                      <span className="text-sm text-green-600">
                        {position.takeProfit ? position.takeProfit.toLocaleString() : '-'}
                      </span>
                      <span className="text-sm text-gray-400">/</span>
                      <span className="text-sm text-red-600">
                        {position.stopLoss ? position.stopLoss.toLocaleString() : '-'}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">已结盈亏</span>
                    <span className={`text-sm ${position.curRealisedPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.abs(position.curRealisedPnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">持仓时间</span>
                    <span className="text-sm text-gray-900">{position.createdAt || '-'}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="text-sm text-gray-900">
                    {position.strategyType || '-'}
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      onClick={() => {
                        // 调用真实API
                        const apiPosition = positions.find(p =>
                          `${p.accountId}-${p.symbol}-${p.side}` === position.id
                        );
                        if (apiPosition) {
                          fetchAIChat(
                            position.id,
                            apiPosition.accountId,
                            apiPosition.symbol,
                            apiPosition.side
                          );
                        }
                      }}
                      disabled={loadingChatId === position.id}
                    >
                      {loadingChatId === position.id ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          加载中...
                        </>
                      ) : (
                        'AI CHAT'
                      )}
                    </button>
                    <button
                      className="px-3 py-1.5 text-sm border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
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
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {isLoadingClosedPositions ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
              <div className="text-gray-600">加载历史仓位数据中...</div>
            </div>
          ) : filteredClosedPositions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="text-gray-400 mb-2">暂无历史交易</div>
              <div className="text-sm text-gray-500">当前没有符合筛选条件的交易记录</div>
            </div>
          ) : (
            <>
              {filteredClosedPositions.map((trade) => {
                // 使用API返回的 marginPlRatio 作为盈亏百分比
                const pnlPercent = ((trade.marginPlRatio ?? 0) * 100).toFixed(2);

                return (
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
                            className={`px-3 py-1 rounded-2xl text-sm ${trade.side === 'Sell'
                                ? 'bg-green-100 text-green-600'
                                : 'bg-red-100 text-red-600'
                              }`}
                          >
                            {trade.side === 'Sell' ? '平多' : '平空'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {trade.exchange}: {trade.accountId}
                        </div>
                      </div>

                      <div className={`text-right ${trade.closedPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <div className="text-sm text-gray-500 mb-1">已结盈亏</div>
                        <div>
                          <span className="text-lg">{Math.abs(trade.closedPnl).toFixed(2)}</span>
                          <span className="text-sm ml-1">({Math.abs(parseFloat(pnlPercent)).toFixed(2)}%)</span>
                        </div>
                      </div>
                    </div>

                    {/* Trade Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-500 mb-1">订单数量</div>
                        <div className="text-gray-900">{trade.closedQty}</div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-500 mb-1">入场价格</div>
                        <div className="text-gray-900">{trade.avgEntryPrice.toLocaleString()}</div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-500 mb-1">出场价格</div>
                        <div className="text-gray-900">{trade.avgExitPrice.toLocaleString()}</div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-500 mb-1">持仓类型</div>
                        <div className="text-gray-900">{trade.closeType || '-'}</div>
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
                        <span className="text-sm text-gray-500">持仓时间</span>
                        <span className="text-sm text-gray-900">
                          {formatPositionTime(trade.openTime, trade.orderCreateTime).openTimeFormatted} - {formatPositionTime(trade.openTime, trade.orderCreateTime).closeTimeFormatted} {formatPositionTime(trade.openTime, trade.orderCreateTime).durationFormatted}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="text-sm text-gray-500">
                         <span className="text-gray-900">{trade.strategyType || '-'}</span>
                      </div>
                      <div className="flex gap-2">
                        {trade.openChatId && (
                          <button
                            className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            onClick={() => fetchHistoryChat(trade.id, trade.openChatId, false)}
                            disabled={loadingHistoryChatId === `${trade.id}-${trade.openChatId}`}
                          >
                            {loadingHistoryChatId === `${trade.id}-${trade.openChatId}` ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                加载中...
                              </>
                            ) : (
                              '开仓CHAT'
                            )}
                          </button>
                        )}
                        {trade.closeChatId && (
                          <button
                            className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            onClick={() => fetchHistoryChat(trade.id, trade.closeChatId, true, trade.accountId, trade.avgExitPrice, trade.side, trade.avgEntryPrice)}
                            disabled={loadingHistoryChatId === `${trade.id}-${trade.closeChatId}`}
                          >
                            {loadingHistoryChatId === `${trade.id}-${trade.closeChatId}` ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                加载中...
                              </>
                            ) : (
                              '平仓CHAT'
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Pagination */}
              {totalRecords > pageSize && (
                <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4">
                  <div className="text-sm text-gray-600">
                    共 {totalRecords} 条记录，第 {currentPage} / {Math.ceil(totalRecords / pageSize)} 页
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      上一页
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(Math.ceil(totalRecords / pageSize), p + 1))}
                      disabled={currentPage >= Math.ceil(totalRecords / pageSize)}
                      className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      下一页
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
      </div>

      {/* Close Position Modal */}
      {showCloseModal && selectedPosition && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/30 flex items-end justify-center z-50">
          <div
            ref={closeModalRef}
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
                  className={`px-3 py-1 rounded-2xl text-sm ${selectedPosition.type === 'long'
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
                  <span className="text-sm text-gray-900 font-medium">{selectedPosition.entryPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">市场价格</span>
                  <span className="text-sm text-gray-900 font-medium">{selectedPosition.currentPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">数量</span>
                  <span className="text-sm text-gray-900 font-medium">{selectedPosition.quantity}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">止盈价格</span>
                  <span className="text-sm text-gray-900 font-medium">
                    {selectedPosition.takeProfit ? `${selectedPosition.takeProfit.toLocaleString()}` : '未设置'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">止损价格</span>
                  <span className="text-sm text-gray-900 font-medium">
                    {selectedPosition.stopLoss ? `${selectedPosition.stopLoss.toLocaleString()}` : '未设置'}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-sm text-gray-500">预计盈亏</span>
                  <span className={`text-sm font-semibold ${selectedPosition.unrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedPosition.unrealizedPnL >= 0 ? '+' : ''}{Math.abs(selectedPosition.unrealizedPnL).toFixed(2)} ({selectedPosition.unrealizedPnLPercent >= 0 ? '+' : ''}{Math.abs(selectedPosition.unrealizedPnLPercent).toFixed(2)}%)
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
                className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                onClick={confirmClosePosition}
              >
                平仓
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
            ref={aiChatModalRef}
            className="bg-white rounded-t-3xl shadow-xl p-6 w-full max-w-4xl h-[85vh] flex flex-col animate-slide-up"
            style={{
              animation: 'slideUp 0.3s ease-out'
            }}
          >
            {/* Modal Header */}
            <div className="mb-4 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-baseline gap-2">
                  <h2 className="text-xl font-semibold text-gray-900">{selectedAIChat.model || 'AI CHAT'}</h2>
                </div>
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
              {(() => {
                // 解析response字段
                let parsedResponse: any = null;
                let simpleThought = '';
                let tradeSignalArgs: any = null;

                try {
                  parsedResponse = JSON.parse(selectedAIChat.response);
                  // 新的response结构：直接包含字段，不再嵌套在symbol下
                  if (parsedResponse && typeof parsedResponse === 'object') {
                    // 直接从parsedResponse获取simpleThought
                    simpleThought = parsedResponse.simpleThought || '';
                    // 整个parsedResponse就是tradeSignalArgs
                    tradeSignalArgs = parsedResponse;
                  }
                } catch (e) {
                  console.error('解析response失败:', e);
                }

                return (
                  <>
                    {/* Strategy Type and Time */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-gray-900 font-semibold">{selectedAIChat.strategyType || '策略分析'}</span>
                      </div>
                      <div className="text-sm text-gray-500 ml-4 whitespace-nowrap">
                        {new Date(selectedAIChat.createTime).toLocaleString('zh-CN', {
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          hour12: false
                        })}
                      </div>
                    </div>

                    {/* Symbol and Action */}
                    {tradeSignalArgs && (
                      <div className="mb-3">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <span>{tradeSignalArgs.symbol || tradeSignalArgs.coin || selectedAIChat.symbol}</span>
                          <span className={`px-2 py-0.5 rounded-2xl ${
                              tradeSignalArgs.side === 'Wait' ? 'bg-gray-100 text-gray-600' :
                              isChatForClosing
                              ? (tradeSignalArgs.side === 'Sell' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600')
                              : (tradeSignalArgs.side === 'Buy' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600')
                            }`}>
                            {tradeSignalArgs.side === 'Wait' ? '观望' :
                              isChatForClosing
                              ? (tradeSignalArgs.side === 'Sell' ? '平多' : '平空')
                              : (tradeSignalArgs.side === 'Buy' ? '开多' : '开空')
                            }
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Divider */}
                    <div className="border-t border-gray-200 mb-4"></div>

                    {/* Summary - Trade Signal Info */}
                    {tradeSignalArgs && (
                      <div className="bg-gray-50 rounded-lg p-4 pb-8 border border-gray-200 mb-4 relative">
                        <div className="text-gray-900 text-sm space-y-1">
                          {/* 平仓CHAT: 显示操作类型和操作描述 */}
                          {isChatForClosing ? (
                            <>
                              {/* 账户操作详情 (按accountId筛选) */}
                              {tradeSignalArgs.accountActions && tradeSignalArgs.accountActions.length > 0 && (() => {
                                const filteredActions = selectedAccountId
                                  ? tradeSignalArgs.accountActions.filter((action: any) => action.accountId === selectedAccountId)
                                  : tradeSignalArgs.accountActions;

                                if (filteredActions.length === 0) return null;
                                const action = filteredActions[0]; // 取第一个匹配的操作

                                return (
                                  <>
                                    {/* 操作类型 (原信心度位置) */}
                                    {action.action && (
                                      <div>操作类型: <span className={`font-semibold ${
                                        action.action === 'close_long' || action.action === 'close_short'
                                          ? 'text-orange-600'
                                          : 'text-blue-600'
                                      }`}>{action.action}</span></div>
                                    )}
                                    {/* 操作描述 (原失效条件位置) */}
                                    {action.thought && (
                                      <div>操作描述: <span className="font-semibold text-gray-700">{action.thought}</span></div>
                                    )}

                                    {/* 账户操作详情 */}
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                      <div className="font-medium mb-2">账户操作:</div>
                                      <div className="space-y-1.5 ml-2">
                                        {/* 仓位方向 */}
                                        <div>仓位方向: <span className={`font-semibold ${
                                          selectedPositionSide === 'Buy' ? 'text-green-600' : 'text-red-600'
                                        }`}>{selectedPositionSide || '-'}</span></div>
                                        {/* 开仓价格 */}
                                        <div>开仓价格: <span className="font-semibold">{selectedEntryPrice ?? '-'}</span></div>
                                        {/* 平仓价格 */}
                                        <div>平仓价格: <span className="font-semibold">{selectedClosePrice ?? '-'}</span></div>
                                        {/* 止盈(新) */}
                                        {action.takeProfit !== undefined && (
                                          <div>止盈(新): <span className="font-semibold text-green-600">{action.takeProfit}</span></div>
                                        )}
                                        {/* 止损(新) */}
                                        {action.stopLoss !== undefined && (
                                          <div>止损(新): <span className="font-semibold text-red-600">{action.stopLoss}</span></div>
                                        )}
                                        {/* 止盈(旧) */}
                                        {action.oldTakeProfit !== undefined && (
                                          <div>止盈(旧): <span className="font-semibold text-gray-500">{action.oldTakeProfit}</span></div>
                                        )}
                                        {/* 止损(旧) */}
                                        {action.oldStopLoss !== undefined && (
                                          <div>止损(旧): <span className="font-semibold text-gray-500">{action.oldStopLoss}</span></div>
                                        )}
                                      </div>
                                    </div>
                                  </>
                                );
                              })()}
                            </>
                          ) : (
                            <>
                              {/* 开仓CHAT: 显示原有字段 */}
                              {/* 信心度 - 直接从顶层获取 */}
                              {tradeSignalArgs.confidence !== undefined && (
                                <div>信心度: <span className="font-semibold">{(tradeSignalArgs.confidence * 100).toFixed(0)}%</span></div>
                              )}
                              {/* 失效条件 */}
                              {tradeSignalArgs.invalidationCondition && (
                                <div>失效条件: <span className="font-semibold text-orange-600">{tradeSignalArgs.invalidationCondition}</span></div>
                              )}
                              {/* 旧结构兼容 - 直接显示入场价格等 */}
                              {tradeSignalArgs.entryPrice !== undefined && (
                                <div>入场价格: <span className="font-semibold">{tradeSignalArgs.entryPrice}</span></div>
                              )}
                              {tradeSignalArgs.takeProfit !== undefined && (
                                <div>止盈: <span className="font-semibold text-green-600">{tradeSignalArgs.takeProfit}</span></div>
                              )}
                              {tradeSignalArgs.stopLoss !== undefined && (
                                <div>止损: <span className="font-semibold text-red-600">{tradeSignalArgs.stopLoss}</span></div>
                              )}
                              {tradeSignalArgs.riskUsd !== undefined && (
                                <div>风险金额: <span className="font-semibold">{tradeSignalArgs.riskUsd}</span></div>
                              )}
                            </>
                          )}
                        </div>
                        {/* ID in bottom-right corner */}
                        {selectedAIChat.id && (
                          <div className="absolute bottom-2 right-3 text-xs text-gray-400">
                            {selectedAIChat.id}
                          </div>
                        )}
                      </div>
                    )}

                    {/* CHAIN_OF_THOUGHTS - simpleThought */}
                    {simpleThought && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setExpandedReasoning(!expandedReasoning)}
                            className="flex items-center gap-2 text-left text-sm text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            {expandedReasoning ? (
                              <Play className="w-3 h-3 rotate-90 fill-current" />
                            ) : (
                              <Play className="w-3 h-3 fill-current" />
                            )}
                            <span>CHAIN_OF_THOUGHTS</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(simpleThought)}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label="Copy CHAIN_OF_THOUGHTS"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>

                        {expandedReasoning && (
                          <div className="mt-2 bg-blue-50 rounded-lg p-4 border border-blue-100">
                            <div className="text-gray-700 text-sm whitespace-pre-wrap">
                              {simpleThought}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* USER_PROMPT - Collapsible (默认收起) */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2">
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
                        <button
                          type="button"
                          onClick={() => {
                            try {
                              copyToClipboard(JSON.parse(selectedAIChat.prompt));
                            } catch {
                              copyToClipboard(selectedAIChat.prompt);
                            }
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          aria-label="Copy USER_PROMPT"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>

                      {expandedPrompt && (
                        <div className="mt-2 bg-blue-50 rounded-lg p-4 border border-blue-100">
                          <JsonViewer data={(() => {
                            try {
                              return JSON.parse(selectedAIChat.prompt);
                            } catch {
                              return selectedAIChat.prompt;
                            }
                          })()} expandAll={true} />
                        </div>
                      )}
                    </div>

                    {/* TRADING_DECISIONS - tradeSignalArgs */}
                    {tradeSignalArgs && (
                      <div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setExpandedOutput(!expandedOutput)}
                            className="flex items-center gap-2 text-left text-sm text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            {expandedOutput ? (
                              <Play className="w-3 h-3 rotate-90 fill-current" />
                            ) : (
                              <Play className="w-3 h-3 fill-current" />
                            )}
                            <span>TRADING_DECISIONS</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(tradeSignalArgs)}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label="Copy TRADING_DECISIONS"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>

                        {expandedOutput && (
                          <div className="mt-2 bg-blue-50 rounded-lg p-4 border border-blue-100">
                            <JsonViewer data={tradeSignalArgs} defaultExpanded={true} />
                          </div>
                        )}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Bottom Close Button */}
            <div className="mt-4 flex-shrink-0">
              <button
                className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
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

      {/* Batch Close Position Modal */}
      {showBatchCloseModal && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/30 flex items-end justify-center z-50">
          <div
            ref={batchCloseModalRef}
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
                      className={`px-4 py-3 rounded-lg border transition-colors ${batchCloseSymbol === symbol
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
                <div className="grid grid-cols-2 gap-4">
                  {/* 多单持仓 */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="text-sm text-gray-600 mb-2">多单持仓数量</div>
                    <div className="text-2xl text-green-600 font-semibold">
                      {currentPositions.filter(p =>
                        p.symbol.replace('/', '') === batchCloseSymbol && p.type === 'long'
                      ).length} 个
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      浮动盈亏: <span className={
                        currentPositions.filter(p =>
                          p.symbol.replace('/', '') === batchCloseSymbol && p.type === 'long'
                        ).reduce((sum, p) => sum + p.unrealizedPnL, 0) >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }>
                        {currentPositions.filter(p =>
                          p.symbol.replace('/', '') === batchCloseSymbol && p.type === 'long'
                        ).reduce((sum, p) => sum + p.unrealizedPnL, 0) >= 0 ? '+' : ''}
                        {currentPositions.filter(p =>
                          p.symbol.replace('/', '') === batchCloseSymbol && p.type === 'long'
                        ).reduce((sum, p) => sum + p.unrealizedPnL, 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* 空单持仓 */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="text-sm text-gray-600 mb-2">空单持仓数量</div>
                    <div className="text-2xl text-red-600 font-semibold">
                      {currentPositions.filter(p =>
                        p.symbol.replace('/', '') === batchCloseSymbol && p.type === 'short'
                      ).length} 个
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      浮动盈亏: <span className={
                        currentPositions.filter(p =>
                          p.symbol.replace('/', '') === batchCloseSymbol && p.type === 'short'
                        ).reduce((sum, p) => sum + p.unrealizedPnL, 0) >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }>
                        {currentPositions.filter(p =>
                          p.symbol.replace('/', '') === batchCloseSymbol && p.type === 'short'
                        ).reduce((sum, p) => sum + p.unrealizedPnL, 0) >= 0 ? '+' : ''}
                        {currentPositions.filter(p =>
                          p.symbol.replace('/', '') === batchCloseSymbol && p.type === 'short'
                        ).reduce((sum, p) => sum + p.unrealizedPnL, 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mb-3">
              <button
                onClick={async () => {
                  try {
                    const token = getToken();
                    if (!token) {
                      alert('未登录，请先登录');
                      return;
                    }

                    const longPositions = currentPositions.filter(p =>
                      p.symbol.replace('/', '') === batchCloseSymbol && p.type === 'long'
                    );

                    if (longPositions.length === 0) {
                      alert(`没有${batchCloseSymbol}的多单持仓`);
                      return;
                    }

                    if (!confirm(`确定要平掉 ${batchCloseSymbol} 的 ${longPositions.length} 个多单持仓吗？`)) {
                      return;
                    }

                    const request: ClosePositionReq = {
                      symbol: batchCloseSymbol,
                      closeSide: 'Buy', // 多单对应Buy
                    };

                    console.log('平多操作:', request);
                    const result = await closeAllPositions(token, request);

                    if (result) {
                      alert(`平多操作成功！\n商品: ${batchCloseSymbol}\n数量: ${longPositions.length} 个`);
                      setShowBatchCloseModal(false);
                      setBatchCloseSymbol('BTCUSDT');
                      // 刷新持仓列表
                      fetchPositions();
                    } else {
                      alert('平多操作失败，请重试');
                    }
                  } catch (err: any) {
                    console.error('平多操作失败:', err);
                    alert(`平多操作失败: ${err.message || '未知错误'}`);
                  }
                }}
                className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentPositions.filter(p =>
                  p.symbol.replace('/', '') === batchCloseSymbol && p.type === 'long'
                ).length === 0}
              >
                平多
              </button>
              <button
                onClick={async () => {
                  try {
                    const token = getToken();
                    if (!token) {
                      alert('未登录，请先登录');
                      return;
                    }

                    const shortPositions = currentPositions.filter(p =>
                      p.symbol.replace('/', '') === batchCloseSymbol && p.type === 'short'
                    );

                    if (shortPositions.length === 0) {
                      alert(`没有${batchCloseSymbol}的空单持仓`);
                      return;
                    }

                    if (!confirm(`确定要平掉 ${batchCloseSymbol} 的 ${shortPositions.length} 个空单持仓吗？`)) {
                      return;
                    }

                    const request: ClosePositionReq = {
                      symbol: batchCloseSymbol,
                      closeSide: 'Sell', // 空单对应Sell
                    };

                    console.log('平空操作:', request);
                    const result = await closeAllPositions(token, request);

                    if (result) {
                      alert(`平空操作成功！\n商品: ${batchCloseSymbol}\n数量: ${shortPositions.length} 个`);
                      setShowBatchCloseModal(false);
                      setBatchCloseSymbol('BTCUSDT');
                      // 刷新持仓列表
                      fetchPositions();
                    } else {
                      alert('平空操作失败，请重试');
                    }
                  } catch (err: any) {
                    console.error('平空操作失败:', err);
                    alert(`平空操作失败: ${err.message || '未知错误'}`);
                  }
                }}
                className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentPositions.filter(p =>
                  p.symbol.replace('/', '') === batchCloseSymbol && p.type === 'short'
                ).length === 0}
              >
                平空
              </button>
            </div>

            {/* Cancel Button */}
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
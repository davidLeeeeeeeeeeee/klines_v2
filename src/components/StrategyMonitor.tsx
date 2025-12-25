import { useState, useEffect, useRef } from 'react';
import { ChevronRight, Play, X, RefreshCw, Loader2, Copy } from 'lucide-react';
import { getChatList, ChatResVO, PageRequest, ChatListReq, getSystemDict, DictItem } from '../services/api';
import { getToken } from '../utils/storage';
import { JsonViewer } from './JsonViewer';
import { useClickOutside } from '../hooks/useClickOutside';

interface StrategyMonitorProps {
  onBack: () => void;
}

interface AIChatMessage {
  id: string;
  timestamp: string;
  strategyName: string;
  symbol: string;
  action: '开多' | '开空' | '观望';
  summary: string;
  prompt: string;
  reasoning: string;
  output: string;
  duration?: string;
  symbols?: Array<{ symbol: string; action: '开多' | '开空' | '观望' }>;
  model?: string;
}

export function StrategyMonitor({ onBack }: StrategyMonitorProps) {
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
  // 格式化日期为 YYYY-MM-DD HH:mm:ss 格式
  const formatDateTime = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // 将 datetime-local 格式转换为 YYYY-MM-DD HH:mm:ss 格式
  const convertToApiFormat = (datetimeLocal: string): string => {
    if (!datetimeLocal) return '';
    // datetime-local 格式: 2025-12-12T12:00
    // 转换为: 2025-12-12 12:00:00
    return datetimeLocal.replace('T', ' ') + ':00';
  };

  // 将 YYYY-MM-DD HH:mm:ss 格式转换为 datetime-local 格式
  const convertToInputFormat = (apiFormat: string): string => {
    if (!apiFormat) return '';
    // API 格式: 2025-12-12 12:00:00
    // 转换为: 2025-12-12T12:00
    return apiFormat.substring(0, 16).replace(' ', 'T');
  };

  // 设置默认时间为最近1天
  const getDefaultStartTime = () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    return formatDateTime(yesterday);
  };

  const getDefaultEndTime = () => {
    const now = new Date();
    return formatDateTime(now);
  };

  const [selectedStrategy, setSelectedStrategy] = useState('all');
  const [showStrategyDropdown, setShowStrategyDropdown] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState('all');
  const [showSymbolDropdown, setShowSymbolDropdown] = useState(false);
  const [selectedAction, setSelectedAction] = useState('all');
  const [showActionDropdown, setShowActionDropdown] = useState(false);
  const [showTimeRangeModal, setShowTimeRangeModal] = useState(false);
  const [expandedPrompt, setExpandedPrompt] = useState<{ [key: string]: boolean }>({});
  const [expandedReasoning, setExpandedReasoning] = useState<{ [key: string]: boolean }>({});
  const [expandedOutput, setExpandedOutput] = useState<{ [key: string]: boolean }>({});
  const [startTime, setStartTime] = useState(getDefaultStartTime());
  const [endTime, setEndTime] = useState(getDefaultEndTime());
  // 追踪用户是否手动设置了时间范围
  const [isCustomTimeRange, setIsCustomTimeRange] = useState(false);

  // Refs for click outside detection
  const strategyDropdownRef = useRef<HTMLDivElement>(null);
  const symbolDropdownRef = useRef<HTMLDivElement>(null);
  const actionDropdownRef = useRef<HTMLDivElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);

  // Click outside handlers
  useClickOutside(strategyDropdownRef, () => setShowStrategyDropdown(false));
  useClickOutside(symbolDropdownRef, () => setShowSymbolDropdown(false));
  useClickOutside(actionDropdownRef, () => setShowActionDropdown(false));

  const [selectedModel, setSelectedModel] = useState('all');
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  useClickOutside(modelDropdownRef, () => setShowModelDropdown(false));
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 新增状态：API数据
  const [chatList, setChatList] = useState<ChatResVO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10); // 每页10条
  const [total, setTotal] = useState(0);

  // 商品列表 - 从系统字典API获取
  const [symbolList, setSymbolList] = useState<DictItem[]>([]);
  // 策略列表 - 从系统字典API获取
  const [strategyModelList, setStrategyModelList] = useState<DictItem[]>([]);
  // AI模型列表 - 从系统字典API获取
  const [aiModelList, setAiModelList] = useState<DictItem[]>([]);

  // 获取对话列表
  const fetchChatList = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = getToken();
      if (!token) {
        throw new Error('未登录，请先登录');
      }

      // 将前端显示的类型转换为API需要的格式
      let apiSide: string | undefined;
      if (selectedAction !== 'all') {
        if (selectedAction === '开多') apiSide = 'Buy';
        else if (selectedAction === '开空') apiSide = 'Sell';
        else if (selectedAction === '观望') apiSide = 'Wait';
      }

      const request: PageRequest<ChatListReq> = {
        page: currentPage,
        pageSize: pageSize,
        param: {
          startTime: startTime || undefined, // 已经是 YYYY-MM-DD HH:mm:ss 格式
          endTime: endTime || undefined, // 已经是 YYYY-MM-DD HH:mm:ss 格式
          symbol: selectedSymbol === 'all' ? undefined : selectedSymbol,
          side: apiSide,
          strategyType: selectedStrategy === 'all' ? undefined : selectedStrategy,
          model: selectedModel === 'all' ? undefined : selectedModel,
        }
      };

      const response = await getChatList(token, request);
      console.log('✅ 获取到对话列表:', {
        total: response.total,
        recordsCount: response.records.length,
        records: response.records
      });
      setChatList(response.records);
      setTotal(response.total);
    } catch (err: any) {
      setError(err.message || '获取对话列表失败');
      console.error('获取对话列表失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 获取系统字典（商品列表、策略列表和AI模型列表）
  const fetchSystemDict = async () => {
    try {
      const dictData = await getSystemDict();
      setSymbolList(dictData.SymbolType || []);
      setStrategyModelList(dictData.StrategyModel || []);
      setAiModelList(dictData.AiModel || []);
      console.log('📊 获取到商品列表:', dictData.SymbolType);
      console.log('📊 获取到策略列表:', dictData.StrategyModel);
      console.log('📊 获取到AI模型列表:', dictData.AiModel);
    } catch (err: any) {
      console.error('获取系统字典失败:', err);
    }
  };

  // 组件挂载时获取系统字典
  useEffect(() => {
    fetchSystemDict();
  }, []);

  // 组件挂载时获取数据，以及当筛选条件变化时重新获取
  useEffect(() => {
    fetchChatList();
  }, [currentPage, selectedStrategy, selectedSymbol, selectedAction, selectedModel, startTime, endTime]); // 当筛选条件变化时重新获取

  const handleRefresh = () => {
    setIsRefreshing(true);

    // 如果用户没有手动设置时间范围，则更新为当前时间的最近1天
    if (!isCustomTimeRange) {
      setStartTime(getDefaultStartTime());
      setEndTime(getDefaultEndTime());
    }

    fetchChatList().finally(() => {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    });
  };

  // Symbols list - 从系统字典API获取
  const symbols = symbolList.map(item => item.code);
  console.log('📊 可用的交易对列表:', symbols);

  // 策略列表 - 使用系统字典API获取的StrategyModel
  const strategies = [
    { id: 'all', name: '所有策略' },
    ...strategyModelList.map(item => ({ id: item.code, name: item.name }))
  ];
  console.log('📊 可用的策略列表:', strategies);

  // 将API数据转换为组件需要的格式
  const aiChatMessages: AIChatMessage[] = chatList.map(chat => {
    // 解析response字段
    let parsedResponse: any = null;
    let simpleThought = '';
    let tradeSignalArgs: any = null;

    try {
      parsedResponse = JSON.parse(chat.response);

      // 新的response结构：直接包含字段，不再嵌套在symbol下
      if (parsedResponse && typeof parsedResponse === 'object') {
        // 直接从parsedResponse获取simpleThought
        simpleThought = parsedResponse.simpleThought || '';
        // 整个parsedResponse就是tradeSignalArgs
        tradeSignalArgs = parsedResponse;
      }

      console.log('📊 解析Chat数据:', {
        chatId: chat.id,
        symbol: chat.symbol,
        side: chat.side,
        prompt: chat.prompt,
        simpleThought,
        hasTradeSignalArgs: !!tradeSignalArgs
      });
    } catch (e) {
      // 如果解析失败，使用原始response
      console.error('❌ 解析response失败:', e, '原始数据:', chat.response);
    }

    // 将API返回的side转换为前端显示的action
    let action: '开多' | '开空' | '观望' = '观望';
    if (chat.side === 'Buy') action = '开多';
    else if (chat.side === 'Sell') action = '开空';
    else if (chat.side === 'Wait') action = '观望';

    return {
      id: chat.id.toString(),
      timestamp: chat.createTime,
      strategyName: chat.strategyType || '未知策略',
      symbol: chat.symbol || '',
      action: action,
      summary: chat.prompt || '',
      prompt: chat.prompt || '',
      reasoning: simpleThought, // 从response中解析出的simpleThought
      output: chat.response || '',
      model: chat.model || ''
    };
  });

  const selectedStrategyName = strategies.find(s => s.id === selectedStrategy)?.name || '';

  const togglePrompt = (messageId: string) => {
    setExpandedPrompt(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  const toggleReasoning = (messageId: string) => {
    setExpandedReasoning(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  const toggleOutput = (messageId: string) => {
    setExpandedOutput(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  // Format timestamp to MM/DD HH:mm:ss
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${month}/${day} ${hours}:${minutes}:${seconds}`;
  };

  // Get action badge color
  const getActionColor = (action: string) => {
    switch (action) {
      case '开多':
        return 'bg-green-100 text-green-600';
      case '开空':
        return 'bg-red-100 text-red-600';
      case '观望':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // 过滤已经在API请求中完成，直接使用aiChatMessages
  const filteredMessages = aiChatMessages;

  return (
    <div className="flex flex-col h-full">
      {/* Fixed Header Section */}
      <div className="flex-shrink-0">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-semibold text-gray-900">策略监控</h1>
            <button
              onClick={handleRefresh}
              className={`p-2 text-gray-400 hover:text-gray-600 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
              title="刷新"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-500">
            {isCustomTimeRange ? '展示自定义时间范围的AI交互信息' : '自动展示最近 1 天的AI交互信息（每次刷新自动更新时间范围）'}
          </p>
        </div>

      {/* Filters - All in One Row */}
      <div className="mb-6 flex items-center gap-8">
        {/* Strategy Selector */}
        <div className="relative" ref={strategyDropdownRef}>
          <button
            onClick={() => setShowStrategyDropdown(!showStrategyDropdown)}
            className="flex items-center gap-1.5 text-base text-gray-700 hover:text-gray-900 transition-colors"
          >
            <span>{selectedStrategy === 'all' ? '所有策略' : selectedStrategyName}</span>
            <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor" className="text-gray-500">
              <path d="M5 6L0 0h10L5 6z" />
            </svg>
          </button>

          {showStrategyDropdown && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-20 min-w-[180px]">
              {strategies.map((strategy) => (
                <button
                  key={strategy.id}
                  onClick={() => {
                    setSelectedStrategy(strategy.id);
                    setShowStrategyDropdown(false);
                    setCurrentPage(1); // 重置页码
                    // 触发新的API请求会在useEffect中自动执行
                  }}
                  className={`w-full px-4 py-2 text-left text-base hover:bg-gray-50 transition-colors ${
                    selectedStrategy === strategy.id ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
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
            onClick={() => setShowSymbolDropdown(!showSymbolDropdown)}
            className="flex items-center gap-1.5 text-base text-gray-700 hover:text-gray-900 transition-colors"
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

        {/* Action Type Dropdown */}
        <div className="relative" ref={actionDropdownRef}>
          <button
            onClick={() => setShowActionDropdown(!showActionDropdown)}
            className="flex items-center gap-1.5 text-base text-gray-700 hover:text-gray-900 transition-colors"
          >
            <span>{selectedAction === 'all' ? '类型' : selectedAction}</span>
            <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor" className="text-gray-500">
              <path d="M5 6L0 0h10L5 6z" />
            </svg>
          </button>

          {showActionDropdown && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-20 min-w-[140px]">
              <button
                onClick={() => {
                  setSelectedAction('all');
                  setShowActionDropdown(false);
                }}
                className={`w-full px-4 py-2 text-left text-base hover:bg-gray-50 transition-colors ${
                  selectedAction === 'all' ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                }`}
              >
                全部
              </button>
              <button
                onClick={() => {
                  setSelectedAction('开多');
                  setShowActionDropdown(false);
                }}
                className={`w-full px-4 py-2 text-left text-base hover:bg-gray-50 transition-colors ${
                  selectedAction === '开多' ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                }`}
              >
                开多
              </button>
              <button
                onClick={() => {
                  setSelectedAction('开空');
                  setShowActionDropdown(false);
                }}
                className={`w-full px-4 py-2 text-left text-base hover:bg-gray-50 transition-colors ${
                  selectedAction === '开空' ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                }`}
              >
                开空
              </button>
              <button
                onClick={() => {
                  setSelectedAction('观望');
                  setShowActionDropdown(false);
                }}
                className={`w-full px-4 py-2 text-left text-base hover:bg-gray-50 transition-colors ${
                  selectedAction === '观望' ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                }`}
              >
                观望
              </button>
            </div>
          )}
        </div>

        {/* Time Range Button */}
        <button
          onClick={() => setShowTimeRangeModal(true)}
          className="flex items-center gap-1.5 text-base text-gray-700 hover:text-gray-900 transition-colors"
        >
          <span>{isCustomTimeRange ? '自定义时间' : '最近1天'}</span>
          <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor" className="text-gray-500">
            <path d="M5 6L0 0h10L5 6z" />
          </svg>
        </button>

        {/* AI Model Dropdown */}
        <div className="relative" ref={modelDropdownRef}>
          <button
            onClick={() => setShowModelDropdown(!showModelDropdown)}
            className="flex items-center gap-1.5 text-base text-gray-700 hover:text-gray-900 transition-colors"
          >
            <span>{selectedModel === 'all' ? 'MODELS' : selectedModel}</span>
            <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor" className="text-gray-500">
              <path d="M5 6L0 0h10L5 6z" />
            </svg>
          </button>

          {showModelDropdown && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-20 min-w-[180px]">
              <button
                onClick={() => {
                  setSelectedModel('all');
                  setShowModelDropdown(false);
                }}
                className={`w-full px-4 py-2 text-left text-base hover:bg-gray-50 transition-colors ${
                  selectedModel === 'all' ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                }`}
              >
                全部
              </button>
              {aiModelList.map((model) => (
                <button
                  key={model.code}
                  onClick={() => {
                    setSelectedModel(model.code);
                    setShowModelDropdown(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-base hover:bg-gray-50 transition-colors ${
                    selectedModel === model.code ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                  }`}
                >
                  {model.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Scrollable List Content */}
      <div className="flex-1 overflow-y-auto">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="text-red-600 text-sm">{error}</div>
        </div>
      )}

      {/* AI Chat Messages */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
            <div className="text-gray-500">加载中...</div>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 mb-2">暂无数据</div>
            <div className="text-sm text-gray-500">所选时间范围内没有AI对话记录</div>
          </div>
        ) : (
          filteredMessages.map((message) => {
            // 解析response字段以获取详细信息
            let parsedResponse: any = null;
            let simpleThought = '';
            let tradeSignalArgs: any = null;
            let promptData: any = message.prompt;

            try {
              parsedResponse = JSON.parse(message.output);

              // 新的response结构：直接包含字段，不再嵌套在symbol下
              if (parsedResponse && typeof parsedResponse === 'object') {
                // 直接从parsedResponse获取simpleThought
                simpleThought = parsedResponse.simpleThought || '';
                // 整个parsedResponse就是tradeSignalArgs
                tradeSignalArgs = parsedResponse;
              }
            } catch (e) {
              // 如果解析失败，使用原始数据
            }

            try {
              promptData = JSON.parse(message.prompt);
            } catch {
              // 保持原始prompt字符串
            }

            return (
          <div key={message.id} className="bg-white rounded-lg shadow-sm p-6">
            {/* Header: Strategy Name with Model and Timestamp */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-baseline gap-2">
                <span className="text-gray-900 font-semibold">{message.strategyName}</span>
                {message.model && (
                  <span className="text-sm text-gray-400 font-normal">{message.model}</span>
                )}
              </div>
              <div className="text-sm text-gray-500 ml-4 whitespace-nowrap">{formatTime(message.timestamp)}</div>
            </div>

            {/* Symbol and Action with ID */}
            <div className="mb-3">
              <div className="flex items-center justify-between gap-1.5 text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <span>{message.symbol || (tradeSignalArgs?.symbol)}</span>
                  <span className={`px-2 py-0.5 rounded-2xl ${getActionColor(message.action)}`}>
                    {message.action}
                  </span>
                </div>
                <span className="text-gray-400 text-xs">ID: {message.id}</span>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 mb-4"></div>

            {/* CHAIN_OF_THOUGHTS - simpleThought */}
            {simpleThought && (
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleReasoning(message.id)}
                    className="flex items-center gap-2 text-left text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {expandedReasoning[message.id] === false ? (
                      <Play className="w-3 h-3 fill-current" />
                    ) : (
                      <Play className="w-3 h-3 rotate-90 fill-current" />
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

                {expandedReasoning[message.id] !== false && (
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
                  onClick={() => togglePrompt(message.id)}
                  className="flex items-center gap-2 text-left text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {expandedPrompt[message.id] ? (
                    <Play className="w-3 h-3 rotate-90 fill-current" />
                  ) : (
                    <Play className="w-3 h-3 fill-current" />
                  )}
                  <span>USER_PROMPT</span>
                </button>
                <button
                  type="button"
                  onClick={() => copyToClipboard(promptData)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Copy USER_PROMPT"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              {expandedPrompt[message.id] && (
                <div className="mt-2 bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <JsonViewer data={promptData} expandAll={true} />
                </div>
              )}
            </div>

            {/* TRADING_DECISIONS - tradeSignalArgs */}
            {tradeSignalArgs && (
              <div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleOutput(message.id)}
                    className="flex items-center gap-2 text-left text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {expandedOutput[message.id] === false ? (
                      <Play className="w-3 h-3 fill-current" />
                    ) : (
                      <Play className="w-3 h-3 rotate-90 fill-current" />
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

                {expandedOutput[message.id] !== false && (
                  <div className="mt-2 bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <JsonViewer data={tradeSignalArgs} defaultExpanded={true} />
                  </div>
                )}
              </div>
            )}
          </div>
            );
          })
        )}

        {/* Pagination */}
        {!isLoading && total > pageSize && (
          <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4 mt-4">
            <div className="text-sm text-gray-600">
              共 {total} 条记录，第 {currentPage} / {Math.ceil(total / pageSize)} 页
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
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(total / pageSize), p + 1))}
                disabled={currentPage >= Math.ceil(total / pageSize)}
                className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Time Range Modal */}
      {showTimeRangeModal && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/30 flex items-end justify-center z-50">
          <div 
            className="bg-white rounded-t-3xl shadow-xl p-6 w-full max-w-4xl h-[85vh] flex flex-col animate-slide-up"
            style={{
              animation: 'slideUp 0.3s ease-out'
            }}
          >
            {/* Modal Header */}
            <div className="mb-6 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">时间范围</h2>
                <button
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowTimeRangeModal(false)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="border-t border-gray-200"></div>
            </div>

            {/* Time Inputs */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-gray-500 mb-2">
                  开始时间
                </label>
                <input
                  type="datetime-local"
                  step="1"
                  value={convertToInputFormat(startTime)}
                  onChange={(e) => setStartTime(convertToApiFormat(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-500 mb-2">
                  结束时间
                </label>
                <input
                  type="datetime-local"
                  step="1"
                  value={convertToInputFormat(endTime)}
                  onChange={(e) => setEndTime(convertToApiFormat(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                />
              </div>
            </div>

            {/* Spacer to push buttons to bottom */}
            <div className="flex-1"></div>

            {/* Actions */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <button
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => setShowTimeRangeModal(false)}
                >
                  取消
                </button>
                <button
                  className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  onClick={() => {
                    setIsCustomTimeRange(true);
                    setShowTimeRangeModal(false);
                  }}
                >
                  确认
                </button>
              </div>
              <button
                className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => {
                  setIsCustomTimeRange(false);
                  setStartTime(getDefaultStartTime());
                  setEndTime(getDefaultEndTime());
                  setShowTimeRangeModal(false);
                }}
              >
                重置为自动更新（最近1天）
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

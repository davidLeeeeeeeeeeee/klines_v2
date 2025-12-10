import { useState } from 'react';
import { ChevronDown, ChevronRight, Play, X } from 'lucide-react';

interface StrategyMonitorProps {
  onBack: () => void;
}

interface AIChatMessage {
  id: string;
  timestamp: string;
  strategyName: string;
  symbol: string;
  action: '开多' | '开空' | '平多' | '平空' | '观望';
  summary: string;
  prompt: string;
  reasoning: string;
  output: string;
}

export function StrategyMonitor({ onBack }: StrategyMonitorProps) {
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
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

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

  // Mock AI chat messages
  const aiChatMessages: AIChatMessage[] = [
    {
      id: '17334572801',
      timestamp: '2024-03-20 14:35:22',
      strategyName: '趋势追踪策略',
      symbol: 'BTC/USDT',
      action: '开多',
      summary: '分析当前BTC/USDT市场趋势，判断是否符合趋势追踪策略的入场条件。考虑以下因素：1) 价格是否突破20日均线；2) 成交量是否放大；3) RSI指标是否在合理区间；4) 市场整体情绪如何。',
      prompt: '分析当前BTC/USDT市场趋势，判断是否符合趋势追踪策略的入场条件。考虑以下因素：1) 价格是否突破20日均线；2) 成交量是否放大；3) RSI指标是否在合理区间；4) 市场整体情绪如何。',
      reasoning: '首先检查价格走势：BTC当前价格47,500 USDT，已成功突破20日均线（45,200 USDT），涨幅约5.1%。成交量分析：过去4小时成交量较前一日同期增长23%，显示市场参与度提升。技术指标：RSI当前为62，处于健康的上升趋势区间（未超买）。MACD柱状图由负转正，显示动能转换。市场情绪：恐慌与贪婪指数从35上升至48，市场情绪从恐慌转向中性偏乐观。资金流向：大额钱包（持币>1000 BTC）净流入增加15%，显示机构资金进场。综合判断：当前市场符合趋势追踪策略的入场条件，建议开仓。',
      output: '✅ 符合入场条件\n\n建议操作：开多仓 BTC/USDT\n入场价格：47,500 USDT\n建议仓位：30%（中等风险）\n止损价格：45,000 USDT（-5.3%）\n止盈目标：52,000 USDT（+9.5%）\n杠杆倍数：3x\n\n风险评估：中等\n预期盈亏比：1:1.8\n信号强度：85/100'
    },
    {
      id: '17334572501',
      timestamp: '2024-03-20 14:34:52',
      strategyName: '趋势追踪策略',
      symbol: 'BTC/USDT',
      action: '平多',
      summary: '监控当前持仓BTC/USDT多仓，价格已接近止盈目标。分析是否应该部分止盈或继续持有，并评估加仓可能性。',
      prompt: '监控当前持仓BTC/USDT多仓，价格已接近止盈目标。分析是否应该部分止盈或继续持有，并评估加仓可能性。',
      reasoning: '持仓分析：当前持仓成本42,500 USDT，现价47,500 USDT，浮盈11.8%。止盈目标为50,000 USDT，距离目标还有5.3%空间。趋势判断：短期均线（EMA7）继续上穿长期均线（EMA25），趋势依然向上。支撑位分析：46,800为关键支撑位，当前价格高于此位，趋势稳健。成交量：持续温和放量，未见顶部放量特征。技术形态：4小时K线呈现上升通道，未出现顶部反转信号。资金流向：持续净流入状态。风险因素：短期RSI达到68，接近超买区域，需警惕回调风险。建议采用分批止盈策略，锁定部分利润同时保留仓位捕捉上涨空间。',
      output: '💡 建议分批止盈\n\n操作方案：\n1. 平仓40%仓位于当前价格47,500 USDT\n   锁定利润：+11.8%\n2. 剩余60%仓位继续持有\n   移动止损至：46,800 USDT（盈亏平衡以上）\n   止盈目标：50,000 USDT\n\n理由：趋势依然向上，但RSI接近超买，先锁定部分利润降低风险。\n\n是否加仓：暂不建议\n需等待价格回调至支撑位46,800附近再考虑加仓。'
    },
    {
      id: '17334572201',
      timestamp: '2024-03-20 14:34:22',
      strategyName: '趋势追踪策略',
      symbol: 'ETH/USDT',
      action: '开空',
      summary: '检测到ETH/USDT价格快速下跌3%，判断是否触发止损条件，或者这是短期回调可以继续持有。',
      prompt: '检测到ETH/USDT价格快速下跌3%，判断是否触发止损条件，或者这是短期回调可以继续持有。',
      reasoning: '价格波动分析：ETH从2,950 USDT快速下跌至2,860 USDT，跌幅3.05%，用时约15分钟。成交量分析：下跌过程中成交量放大2倍，显示恐慌性抛售。支撑位检测：2,850为重要支撑位，当前价格接近此位。技术指标：RSI快速跌至38，进入超卖区；MACD出现死叉信号。消息面：检测到某大型交易所钱包异常转出ETH，可能引发市场恐慌。持仓情况：我们的空仓成本2,800，止损设定在3,000，当前价格2,860，未触发止损。风险判断：虽然短期下跌，但并未突破关键支撑，且我们持有的是空仓，当前下跌对我们有利。建议继续持有，观察2,850支撑位是否有效。',
      output: '✋ 继续持有空仓\n\n当前状态：\n持仓类型：ETH/USDT 空仓\n成本价格：2,800 USDT\n当前价格：2,860 USDT\n浮盈：-2.1%（空仓，价格下跌有利）\n止损价格：3,000 USDT\n止损距离：+4.9%\n\n分析结论：\n✓ 未触发止损条件\n✓ 价格正朝有利方向移动\n✓ 关键支撑位2,850即将测试\n\n操作建议：保持当前仓位，密切关注2,850支撑位。如果跌破支撑，考虑部分止盈。'
    },
    {
      id: '17334571901',
      timestamp: '2024-03-20 14:33:52',
      strategyName: '网格交易策略',
      symbol: 'SOL/USDT',
      action: '观望',
      summary: '分析SOL/USDT是否适合进行网格交易。评估价格波动率、交易量、以及合理的网格区间设置。',
      prompt: '分析SOL/USDT是否适合进行网格交易。评估价格波动率、交易量、以及合理的网格区间设置。',
      reasoning: '波动率分析：SOL近7日平均波动率4.2%，近30日平均波动率5.8%，波动性适中，符合网格交易要求。价格区间：过去30天价格在95-108 USDT之间震荡，当前价格103 USDT，处于区间中上部。交易量：日均交易量稳定在2.5亿USDT，流动性充足。趋势判断：无明显趋势，呈箱体震荡形态，非常适合网格交易。支撑阻力：强支撑位95，强阻力位108。深度分析：买卖盘深度良好，±2%价格范围内订单深度超过500万USDT。历史回测：使用相同参数在过去30天进行回测，收益率约12.3%，胜率76%。建议网格设置：区间96-107，分20格，每格间距约0.55%，预期年化收益35-45%。',
      output: '✅ 适合网格交易\n\n推荐网格参数：\n交易对：SOL/USDT\n价格区间：96 - 107 USDT\n网格数量：20格\n每格间距：0.55 USDT（约0.5%）\n入资金：建议5,000 - 10,000 USDT\n\n预期收益：\n日均收益：0.8% - 1.2%\n月收益：12% - 18%\n年化收益：35% - 45%\n\n提示：\n如果价格突破区间（向上或向下），建议暂停网格并重新评估。\n建设置区间外止损：低于92 USDT停止策略。'
    },
    {
      id: '17334571601',
      timestamp: '2024-03-20 14:33:22',
      strategyName: '高频交易策略',
      symbol: 'MATIC/USDT',
      action: '观望',
      summary: '全市场扫描，寻找符合高频做市策略的交易机会。重点关注价差、深、波动性。',
      prompt: '全市场扫描，寻找符合高频做市策略的交易机会。重点关注价差、深度、波动性。',
      reasoning: '市场扫描结果：共扫描156个交易对，筛选出8个潜在机会。买卖价差分析：ADA/USDT价差0.15%，ATOM/USDT价差0.18%，MATIC/USDT价差0.12%，均满足>0.1%的最低要求。订单深度：MATIC/USDT在±0.5%价格范围内深度最佳，买卖双向各有超过100万USDT挂单。波动率：MATIC小时波动率0.3%，适合高频做市（理想范围0.2-0.5%）。成交频率：平均每分钟成交42笔，频率高。滑点测试：10,000 USDT订单滑点<0.08%，可���受。竞争分析：做市商数量适中，不会过度拥挤。资金费率：当前费率接近0，持仓成本低。综合评分：MATIC/USDT 得分92/100，为当前最优标的。',
      output: '🎯 发现做市机会\n\n最优标的：MATIC/USDT\n\n关键指标：\n✓ 买卖价差：0.12%（良好）\n✓ 订单深度：优秀（双向各>100万USDT）\n✓ 小时波动率：0.3%（理想）\n✓ 成交频率：42笔/分钟（活跃）\n✓ 滑点：<0.08%（可接受）\n✓ 综合评分：92/100\n\n建议策略参数：\n做市价差：0.10%（买卖单间距）\n单笔订单：5,000 USDT\n刷新频率：每3秒\n库存管理：中性（不偏向多空）\n\n预期收益：日均0.8-1.5%\n风险等级：低'
    },
    {
      id: '17334571301',
      timestamp: '2024-03-20 14:32:52',
      strategyName: '趋势追踪策略',
      symbol: 'ADA/USDT',
      action: '平空',
      summary: '分析ADA/USDT空仓是否到达止盈目标，评估平仓时机。',
      prompt: '分析ADA/USDT空仓是否到达止盈目标，评估平仓时机。',
      reasoning: 'ADA空仓成本0.58，当前价格0.52，浮盈10.3%。技术分析：RSI已进入超卖区域(28)，可能面临反弹。支撑位0.50即将测试，若跌破可获得更多利润，但反弹风险增大。成交量分析：卖盘逐渐减少，买盘开始增加。综合判断：建议部分止盈，锁定利润。',
      output: '✅ 建议平仓止盈\n\n当前状态：\n空仓成本：0.58 USDT\n当前价格：0.52 USDT\n浮盈：+10.3%\n\n操作建议：\n平仓70%仓位，锁定利润\n剩余30%设置移动止盈\n\n理由：RSI超卖，反弹风险增加'
    }
  ];

  const selectedStrategyName = strategies.find(s => s.id === selectedStrategy)?.name || '';

  // Get unique symbols from messages
  const uniqueSymbols = Array.from(new Set(aiChatMessages.map(msg => msg.symbol)));

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

  // Filter messages by time range
  const filteredMessages = aiChatMessages.filter((message) => {
    // Filter by strategy
    if (selectedStrategy !== 'all') {
      const strategyName = strategies.find(s => s.id === selectedStrategy)?.name;
      if (message.strategyName !== strategyName) return false;
    }

    // Filter by symbol
    if (selectedSymbol !== 'all') {
      if (message.symbol !== selectedSymbol) return false;
    }

    // Filter by action
    if (selectedAction !== 'all') {
      if (message.action !== selectedAction) return false;
    }

    if (!startTime && !endTime) return true;
    
    // Convert message timestamp to Date object
    const messageDate = new Date(message.timestamp.replace(' ', 'T'));
    
    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      return messageDate >= start && messageDate <= end;
    } else if (startTime) {
      const start = new Date(startTime);
      return messageDate >= start;
    } else if (endTime) {
      const end = new Date(endTime);
      return messageDate <= end;
    }
    
    return true;
  });

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">策略监控</h1>
        <p className="text-sm text-gray-500">仅展示过去 1 天的AI交互信息</p>
      </div>

      {/* Filters - All in One Box */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
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
      </div>

      {/* Action Type Tabs with Symbol Filter */}
      <div className="mb-6 flex items-center gap-4">
        {/* Action Type Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowActionDropdown(!showActionDropdown)}
            className="flex items-center gap-1.5 text-base text-gray-700 hover:text-gray-900 transition-colors"
          >
            <span>{selectedAction === 'all' ? '全部类型' : selectedAction}</span>
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
                  setSelectedAction('平多');
                  setShowActionDropdown(false);
                }}
                className={`w-full px-4 py-2 text-left text-base hover:bg-gray-50 transition-colors ${
                  selectedAction === '平多' ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                }`}
              >
                平多
              </button>
              <button
                onClick={() => {
                  setSelectedAction('平空');
                  setShowActionDropdown(false);
                }}
                className={`w-full px-4 py-2 text-left text-base hover:bg-gray-50 transition-colors ${
                  selectedAction === '平空' ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                }`}
              >
                平空
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

        {/* Symbol Filter */}
        <div className="relative">
          <button
            onClick={() => setShowSymbolDropdown(!showSymbolDropdown)}
            className="flex items-center gap-1.5 text-base text-gray-700 hover:text-gray-900 transition-colors"
          >
            <span>{selectedSymbol === 'all' ? '全部商品' : selectedSymbol}</span>
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

        {/* Time Range Button */}
        <button
          onClick={() => setShowTimeRangeModal(true)}
          className="flex items-center gap-1.5 text-base text-gray-700 hover:text-gray-900 transition-colors"
        >
          <span>{startTime || endTime ? '已设时间' : '时间范围'}</span>
          <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor" className="text-gray-500">
            <path d="M5 6L0 0h10L5 6z" />
          </svg>
        </button>
      </div>

      {/* AI Chat Messages */}
      <div className="space-y-4">
        {filteredMessages.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 mb-2">暂无数据</div>
            <div className="text-sm text-gray-500">所选时间范围内没有AI对话记录</div>
          </div>
        ) : (
          filteredMessages.map((message) => (
          <div key={message.id} className="bg-white rounded-lg shadow-sm p-6">
            {/* Header: Strategy Name | Symbol + Action Badge on left, Timestamp on right */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-gray-700">{message.strategyName}</span>
                <span className="text-gray-400">｜</span>
                <span className="text-gray-900">{message.symbol}</span>
                <span className={`px-3 py-1 rounded-2xl text-sm ${getActionColor(message.action)}`}>
                  {message.action}
                </span>
              </div>
              <div className="text-sm text-gray-500 ml-4 whitespace-nowrap">{formatTime(message.timestamp)}</div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 mb-4"></div>

            {/* Summary - Always visible */}
            <div className="bg-gray-50 rounded-lg p-4 pb-8 border border-gray-200 mb-4 relative">
              <div className="text-gray-900 text-sm pr-12">
                {message.summary}
              </div>
              <div className="absolute bottom-2 right-3 text-xs text-gray-400">
                {message.id}  30秒
              </div>
            </div>

            {/* Prompt - Collapsible */}
            <div className="mb-4">
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
              
              {expandedPrompt[message.id] && (
                <div className="mt-2 bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <div className="text-gray-700 text-sm whitespace-pre-line">
                    {message.prompt}
                  </div>
                </div>
              )}
            </div>

            {/* Reasoning - Collapsible */}
            <div className="mb-4">
              <button
                onClick={() => toggleReasoning(message.id)}
                className="flex items-center gap-2 text-left text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                {expandedReasoning[message.id] ? (
                  <Play className="w-3 h-3 rotate-90 fill-current" />
                ) : (
                  <Play className="w-3 h-3 fill-current" />
                )}
                <span>CHAIN_OF_THOUGHT</span>
              </button>
              
              {expandedReasoning[message.id] && (
                <div className="mt-2 bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <div className="text-gray-700 text-sm whitespace-pre-line">
                    {message.reasoning}
                  </div>
                </div>
              )}
            </div>

            {/* Output Result - Collapsible */}
            <div>
              <button
                onClick={() => toggleOutput(message.id)}
                className="flex items-center gap-2 text-left text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                {expandedOutput[message.id] ? (
                  <Play className="w-3 h-3 rotate-90 fill-current" />
                ) : (
                  <Play className="w-3 h-3 fill-current" />
                )}
                <span>TRADING_DECISIONS</span>
              </button>
              
              {expandedOutput[message.id] && (
                <div className="mt-2 bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <div className="text-gray-700 text-sm whitespace-pre-line">
                    {message.output}
                  </div>
                </div>
              )}
            </div>
          </div>
          ))
        )}
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
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
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
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                />
              </div>
            </div>

            {/* Spacer to push buttons to bottom */}
            <div className="flex-1"></div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => setShowTimeRangeModal(false)}
              >
                取消
              </button>
              <button
                className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                onClick={() => setShowTimeRangeModal(false)}
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
    </div>
  );
}
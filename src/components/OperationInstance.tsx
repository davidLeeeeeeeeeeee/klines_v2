import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { getPositionStrategyInstance, getChatDetail, StrategyInstanceRes, ChatResponse, PositionInstanceRequest } from '../services/api';
import { getToken } from '../utils/storage';
import { AIChatModal } from './AIChatModal';

interface OperationInstanceProps {
  onBack: () => void;
  tradeData: {
    // 历史仓位模式：传 id（closePnlId）
    id?: number;
    // 当前仓位模式：传以下四个参数
    accountId?: number;
    side?: string;
    symbol?: string;
    // 共用字段
    strategyType: string;
    exchange: string;
    accountName: string;
  };
}

export function OperationInstance({ onBack, tradeData }: OperationInstanceProps) {
  const [instances, setInstances] = useState<StrategyInstanceRes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatData, setChatData] = useState<ChatResponse | null>(null);
  const [loadingChatId, setLoadingChatId] = useState<number | null>(null);
  const [isChatForClosing, setIsChatForClosing] = useState(false);

  // 获取操作标签颜色
  const getActionColor = (action: string) => {
    switch (action) {
      case 'Buy':
        return 'bg-green-100 text-green-600';
      case 'Sell':
        return 'bg-red-100 text-red-600';
      case 'Close':
        return 'bg-purple-100 text-purple-600';
      case 'PLMODIFY':
        return 'bg-blue-100 text-blue-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // 加载实例数据
  useEffect(() => {
    const fetchInstances = async () => {
      const token = getToken();
      if (!token) {
        setError('未登录');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // 根据传入参数决定调用方式
        let data: StrategyInstanceRes[];
        if (tradeData.id !== undefined) {
          // 历史仓位模式：传 closePnlId
          data = await getPositionStrategyInstance(token, tradeData.id);
        } else if (tradeData.accountId && tradeData.side && tradeData.symbol && tradeData.strategyType !== undefined) {
          // 当前仓位模式：传仓位参数（strategyType 可以为空字符串）
          const params: PositionInstanceRequest = {
            accountId: tradeData.accountId,
            side: tradeData.side,
            strategyType: tradeData.strategyType,
            symbol: tradeData.symbol,
          };
          data = await getPositionStrategyInstance(token, params);
        } else {
          throw new Error('缺少必要参数');
        }

        setInstances(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取操作实例失败');
      } finally {
        setLoading(false);
      }
    };

    fetchInstances();
  }, [tradeData.id, tradeData.accountId, tradeData.side, tradeData.symbol, tradeData.strategyType]);

  // 获取 CHAT 数据
  // side: PLMODIFY, CLOSE 显示平仓CHAT (AI-C)，BUY 显示开仓CHAT (AI-O)
  const fetchChat = async (chatId: number, side: string) => {
    const token = getToken();
    if (!token) return;

    try {
      setLoadingChatId(chatId);
      const data = await getChatDetail(token, chatId);
      setChatData(data);
      // 判断是否为平仓CHAT: Plmodify 或 Close 显示 AI-C 页面（不区分大小写）
      const sideLower = side.toLowerCase();
      const isClosingChat = sideLower === 'plmodify' || sideLower === 'close';
      setIsChatForClosing(isClosingChat);
      setShowChatModal(true);
      setExpandedReasoning(false);
      setExpandedPrompt(false);
      setExpandedOutput(false);
    } catch (err) {
      console.error('获取CHAT失败:', err);
    } finally {
      setLoadingChatId(null);
    }
  };

  // 格式化时间
  const formatTime = (timeStr: string) => {
    if (!timeStr) return '-';
    const date = new Date(timeStr);
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/\//g, '/');
  };

  // 格式化数值，没有值显示 -
  const formatValue = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '-';
    return value.toLocaleString();
  };

  // 页面标题
  const headerTitle = tradeData.strategyType || '策略';
  const headerSubtitle = `${tradeData.exchange} ${tradeData.accountName}`;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
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
            <div className="flex-1 flex items-end gap-2">
              <h1 className="text-2xl font-semibold text-gray-900">{headerTitle}</h1>
              <span className="text-sm text-gray-500 pb-0.5">{headerSubtitle}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {loading ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
              <div className="text-gray-600">加载操作实例中...</div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          ) : instances.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="text-gray-400">暂无操作实例</div>
            </div>
          ) : (
            <div className="space-y-4">
              {instances.map((instance) => (
                <InstanceCard
                  key={instance.id}
                  instance={instance}
                  getActionColor={getActionColor}
                  formatTime={formatTime}
                  formatValue={formatValue}
                  onChatClick={() => fetchChat(instance.chatId, instance.side)}
                  loadingChatId={loadingChatId}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Modal - 复用 AIChatModal 组件 */}
      {showChatModal && chatData && (
        <AIChatModal
          chatData={chatData}
          onClose={() => setShowChatModal(false)}
          isChatForClosing={isChatForClosing}
          selectedAccountId={tradeData.accountId}
        />
      )}
    </div>
  );
}

// 实例卡片组件
interface InstanceCardProps {
  instance: StrategyInstanceRes;
  getActionColor: (action: string) => string;
  formatTime: (time: string) => string;
  formatValue: (value: number | null | undefined) => string;
  onChatClick: () => void;
  loadingChatId: number | null;
}

function InstanceCard({ instance, getActionColor, formatTime, formatValue, onChatClick, loadingChatId }: InstanceCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header Area */}
      <div className="mb-4 pb-4 border-b border-gray-100">
        {/* 第一行: 币种 - 操作标签 - 数量 | CHAT */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className="text-gray-900 font-medium">{instance.symbol}</span>
            <span className={`px-3 py-1 text-sm rounded-2xl ${getActionColor(instance.side)}`}>
              {instance.side}
            </span>
            <span className="text-gray-600">{formatValue(instance.qty)}</span>
          </div>
          {/* CHAT Button */}
          <button
            onClick={onChatClick}
            disabled={loadingChatId === instance.chatId}
            className="flex items-center gap-0.5 text-gray-900 hover:text-gray-700 transition-colors disabled:opacity-50"
          >
            {loadingChatId === instance.chatId ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span className="text-sm">CHAT</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
        {/* 第二行: 置信度 | 时间 */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div>
            置信度：<span className="text-blue-600">{instance.confidence ? `${instance.confidence}%` : '-'}</span>
          </div>
          <div>{formatTime(instance.createTime)}</div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div>
          <div className="text-sm text-gray-500 mb-1">建议价格</div>
          <div className="text-gray-900">{formatValue(instance.suggestEntryPrice)}</div>
        </div>

        <div>
          <div className="text-sm text-gray-500 mb-1">入场价格</div>
          <div className="text-gray-900">{formatValue(instance.entryPrice)}</div>
        </div>

        <div>
          <div className="text-sm text-gray-500 mb-1">止盈/止损</div>
          <div className="flex items-center">
            {instance.takeProfit !== null || instance.stopLoss !== null ? (
              <>
                <span className="text-green-600">{formatValue(instance.takeProfit)}</span>
                <span className="text-gray-400">/</span>
                <span className="text-red-600">{formatValue(instance.stopLoss)}</span>
              </>
            ) : (
              <span className="text-gray-900">- / -</span>
            )}
          </div>
        </div>
      </div>

      {/* Failure Reason - Only show for failed status */}
      {!instance.isSuccess && instance.failureReason && (
        <>
          <div className="border-t border-gray-200 mt-4"></div>
          <div className="mt-4 text-sm text-red-400">
            {instance.failureReason}
          </div>
        </>
      )}
    </div>
  );
}

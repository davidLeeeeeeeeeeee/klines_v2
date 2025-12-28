import { useRef, useState } from 'react';
import { X, Play, Copy } from 'lucide-react';
import { ChatResponse } from '../services/api';
import { JsonViewer } from './JsonViewer';
import { useClickOutside } from '../hooks/useClickOutside';

export interface AIChatModalProps {
  chatData: ChatResponse;
  onClose: () => void;
  // 平仓相关的可选参数
  isChatForClosing?: boolean;
  selectedAccountId?: number | null;
  selectedClosePrice?: number | null;
  selectedPositionSide?: string | null;
  selectedEntryPrice?: number | null;
}

export function AIChatModal({
  chatData,
  onClose,
  isChatForClosing = false,
  selectedAccountId = null,
  selectedClosePrice = null,
  selectedPositionSide = null,
  selectedEntryPrice = null,
}: AIChatModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [expandedPrompt, setExpandedPrompt] = useState(false);
  const [expandedReasoning, setExpandedReasoning] = useState(true);
  const [expandedOutput, setExpandedOutput] = useState(true);

  useClickOutside(modalRef, onClose);

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

  const formatClipboardText = (data: unknown) => {
    if (data === null || data === undefined) return '';
    if (typeof data === 'string') return data;
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  // 解析response字段
  let parsedResponse: any = null;
  let simpleThought = '';
  let tradeSignalArgs: any = null;

  try {
    parsedResponse = JSON.parse(chatData.response);
    if (parsedResponse && typeof parsedResponse === 'object') {
      simpleThought = parsedResponse.simpleThought || '';
      tradeSignalArgs = parsedResponse;
    }
  } catch (e) {
    console.error('解析response失败:', e);
  }

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/30 flex items-end justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-t-3xl shadow-xl p-6 w-full max-w-4xl h-[85vh] flex flex-col animate-slide-up"
        style={{ animation: 'slideUp 0.3s ease-out' }}
      >
        {/* Modal Header */}
        <div className="mb-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-baseline gap-2">
              <h2 className="text-2xl font-semibold text-gray-900">{chatData.strategyType || '策略分析'}</h2>
              <span className="text-sm text-gray-500">{chatData.model || 'AI CHAT'}</span>
            </div>
            <button
              className="text-gray-400 hover:text-gray-600 transition-colors"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="border-t border-gray-200"></div>
        </div>

        {/* AI Chat Content - Scrollable */}
        <div className="flex-1 overflow-y-auto pr-2">
          {/* Symbol and Action */}
          {tradeSignalArgs && (
            <div className="mb-3">
              <div className="flex items-center justify-between gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <span>{tradeSignalArgs.symbol || tradeSignalArgs.coin || chatData.symbol}</span>
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
                <div className="text-sm text-gray-500 whitespace-nowrap">
                  {new Date(chatData.createTime).toLocaleString('zh-CN', {
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 mb-4"></div>

          {/* Summary - Trade Signal Info */}
          {tradeSignalArgs && (
            <div className="bg-gray-50 rounded-lg p-4 pb-8 border border-gray-200 mb-4 relative">
              <div className="text-gray-900 text-sm space-y-1">
                {/* 平仓CHAT: 显示操作类型和操作描述 */}
                {isChatForClosing ? (
                  <ClosingChatContent
                    tradeSignalArgs={tradeSignalArgs}
                    selectedAccountId={selectedAccountId}
                    selectedPositionSide={selectedPositionSide}
                    selectedEntryPrice={selectedEntryPrice}
                    selectedClosePrice={selectedClosePrice}
                  />
                ) : (
                  <OpeningChatContent tradeSignalArgs={tradeSignalArgs} />
                )}
              </div>
              {chatData.id && (
                <div className="absolute bottom-2 right-3 text-xs text-gray-400">
                  {chatData.id}
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
                    copyToClipboard(JSON.parse(chatData.prompt));
                  } catch {
                    copyToClipboard(chatData.prompt);
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
                    return JSON.parse(chatData.prompt);
                  } catch {
                    return chatData.prompt;
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
        </div>

        {/* Bottom Close Button */}
        <div className="mt-4 flex-shrink-0">
          <button
            className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={onClose}
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
  );
}

// 开仓CHAT内容
function OpeningChatContent({ tradeSignalArgs }: { tradeSignalArgs: any }) {
  return (
    <>
      {tradeSignalArgs.confidence !== undefined && (
        <div>置信度: <span className="font-semibold">{(tradeSignalArgs.confidence * 100).toFixed(0)}%</span></div>
      )}
      {tradeSignalArgs.invalidationCondition && (
        <div>失效条件: <span className="font-semibold text-orange-600">{tradeSignalArgs.invalidationCondition}</span></div>
      )}
      {tradeSignalArgs.entryPrice !== undefined && (
        <div>入场价格: <span className="font-semibold">{tradeSignalArgs.entryPrice}</span></div>
      )}
      {tradeSignalArgs.takeProfit !== undefined && (
        <div>止盈价格: <span className="font-semibold text-green-600">{tradeSignalArgs.takeProfit}</span></div>
      )}
      {tradeSignalArgs.stopLoss !== undefined && (
        <div>止损价格: <span className="font-semibold text-red-600">{tradeSignalArgs.stopLoss}</span></div>
      )}
      {tradeSignalArgs.riskUsd !== undefined && (
        <div>风险金额: <span className="font-semibold">{tradeSignalArgs.riskUsd}</span></div>
      )}
    </>
  );
}

// 平仓CHAT内容
interface ClosingChatContentProps {
  tradeSignalArgs: any;
  selectedAccountId: number | null;
  selectedPositionSide: string | null;
  selectedEntryPrice: number | null;
  selectedClosePrice: number | null;
}

function ClosingChatContent({
  tradeSignalArgs,
  selectedAccountId,
  selectedPositionSide,
  selectedEntryPrice,
  selectedClosePrice,
}: ClosingChatContentProps) {
  if (!tradeSignalArgs.accountActions || tradeSignalArgs.accountActions.length === 0) {
    return null;
  }

  const filteredActions = selectedAccountId
    ? tradeSignalArgs.accountActions.filter((action: any) => action.accountId === selectedAccountId)
    : tradeSignalArgs.accountActions;

  if (filteredActions.length === 0) return null;
  const action = filteredActions[0];

  return (
    <>
      {action.action && (
        <div>操作类型: <span className={`font-semibold ${
          action.action === 'close_long' || action.action === 'close_short'
            ? 'text-orange-600'
            : 'text-blue-600'
        }`}>{action.action}</span></div>
      )}
      {action.thought && (
        <div>操作描述: <span className="font-semibold text-green-600">{action.thought}</span></div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="font-medium mb-2">账户操作:</div>
        <div className="space-y-1.5 ml-2">
          <div>仓位方向: <span className={`font-semibold ${
            selectedPositionSide === 'Buy' ? 'text-green-600' : 'text-red-600'
          }`}>{selectedPositionSide || '-'}</span></div>
          <div>开仓价格: <span className="font-semibold">{selectedEntryPrice ?? '-'}</span></div>
          <div>平仓价格: <span className="font-semibold">{selectedClosePrice ?? '-'}</span></div>
          {action.takeProfit !== undefined && (
            <div>止盈: <span className="font-semibold text-green-600">{action.takeProfit}</span></div>
          )}
          {action.stopLoss !== undefined && (
            <div>止损: <span className="font-semibold text-red-600">{action.stopLoss}</span></div>
          )}
          {action.oldTakeProfit !== undefined && (
            <div>止盈(旧): <span className="font-semibold text-gray-500">{action.oldTakeProfit}</span></div>
          )}
          {action.oldStopLoss !== undefined && (
            <div>止损(旧): <span className="font-semibold text-gray-500">{action.oldStopLoss}</span></div>
          )}
        </div>
      </div>
    </>
  );
}


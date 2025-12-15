import { useState } from 'react';
import { ChevronLeft, ArrowLeftRight } from 'lucide-react';
import type { TradingAccount } from './TradingAccounts';

interface FundTransferProps {
  account: TradingAccount;
  parentAccount: TradingAccount | null;
  onBack: () => void;
}

export function FundTransfer({ account, parentAccount, onBack }: FundTransferProps) {
  const [isReversed, setIsReversed] = useState(false);
  const [amount, setAmount] = useState('');

  // Get source and target based on direction
  const getSourceTarget = () => {
    if (isReversed) {
      return {
        sourceAccount: account,
        targetAccount: parentAccount,
        sourceLabel: '子账户',
        targetLabel: '主账户'
      };
    } else {
      return {
        sourceAccount: parentAccount,
        targetAccount: account,
        sourceLabel: '主账户',
        targetLabel: '子账户'
      };
    }
  };

  const { sourceAccount, targetAccount, sourceLabel, targetLabel } = getSourceTarget();

  const handleSwitch = () => {
    setIsReversed(!isReversed);
  };

  const handleCancel = () => {
    onBack();
  };

  const handleConfirm = () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('请输入有效的划转金额');
      return;
    }
    alert(`成功从${sourceLabel} ${sourceAccount?.uid} 划转 ${amount} USDT 到${targetLabel} ${targetAccount?.uid}`);
    onBack();
  };

  const availableBalance = sourceAccount?.netValue || '0.00';

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-gray-900">资金划转</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Transfer Direction Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="space-y-4">
              {/* From Account */}
              <div>
                <label className="block text-sm text-gray-500 mb-2">
                  从 - {sourceLabel}
                </label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="text-gray-900 flex justify-between items-center">
                    <span>{sourceAccount?.accountName}</span>
                    <span>{sourceAccount?.uid}</span>
                  </div>
                </div>
              </div>

              {/* Switch Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleSwitch}
                  className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-500 rounded-full transition-colors"
                  title="切换方向"
                >
                  <ArrowLeftRight className="w-5 h-5" />
                </button>
              </div>

              {/* To Account */}
              <div>
                <label className="block text-sm text-gray-500 mb-2">
                  到 - {targetLabel}
                </label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="text-gray-900 flex justify-between items-center">
                    <span>{targetAccount?.accountName}</span>
                    <span>{targetAccount?.uid}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Amount Input Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="space-y-4">
              {/* Amount Label */}
              <label className="block text-sm text-gray-500">
                金额
              </label>

              {/* Amount Input with Currency */}
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="请输入划转金额"
                  className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                  USDT
                </div>
              </div>

              {/* Available Balance */}
              <div className="text-sm text-gray-500">
                可用余额 <span className="text-gray-900">{availableBalance} USDT</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="bg-white border-t border-gray-200 sticky bottom-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              确定
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

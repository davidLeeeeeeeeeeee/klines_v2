import { useState, useEffect } from 'react';
import { ChevronLeft, ArrowLeftRight, AlertCircle, X, CheckCircle } from 'lucide-react';
import type { TradingAccount } from './TradingAccounts';
import { transferAccount, AccountTransferReq, getAccountDetail, CommonIdRequest } from '../services/api';
import { getToken } from '../utils/storage';
import { formatNumber } from '../utils/format';

interface FundTransferProps {
  account: TradingAccount;
  parentAccount: TradingAccount | null;
  onBack: () => void;
}

export function FundTransfer({ account, parentAccount, onBack }: FundTransferProps) {
  const [isReversed, setIsReversed] = useState(false);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // 存储实时余额
  const [subAccountBalance, setSubAccountBalance] = useState<string>(account.netValue);
  const [mainAccountBalance, setMainAccountBalance] = useState<string>(parentAccount?.netValue || '0.00');

  // 构建主账户对象（优先使用传入的 parentAccount，否则从子账户数据中构建）
  const mainAccount: TradingAccount | null = parentAccount || (account.mainAccId ? {
    id: account.mainAccId,
    accountName: account.mainAccName || '主账户',
    uid: account.mainAccUid || '',
    exchange: account.exchange,
    apiKey: '',
    apiSecret: '',
    initStatus: '已初始化' as const,
    netValue: mainAccountBalance,
    initialNetValue: '0.00',
    createdAt: '',
    username: '',
    accountType: '主账户' as const
  } : null);

  // 获取账户余额的函数（可复用）
  const fetchBalances = async () => {
    try {
      const token = getToken();
      if (!token) {
        console.log('未登录，跳过获取余额');
        return;
      }

      console.log('=== 开始获取账户余额 ===');

      // 获取子账户余额
      console.log('获取子账户余额，ID:', account.id);
      const subAccountDetail = await getAccountDetail(token, { id: parseInt(account.id) });
      console.log('子账户详情响应:', subAccountDetail);
      if (subAccountDetail && typeof subAccountDetail.equity === 'number') {
        setSubAccountBalance(formatNumber(subAccountDetail.equity));
        console.log('子账户余额更新为:', subAccountDetail.equity);
      } else {
        console.warn('子账户equity字段无效:', subAccountDetail);
      }

      // 获取主账户余额 - 优先使用 parentAccount，否则使用 account.mainAccId
      const mainAccId = parentAccount?.id || account.mainAccId;
      if (mainAccId) {
        console.log('获取主账户余额，ID:', mainAccId);
        const mainAccountDetail = await getAccountDetail(token, { id: parseInt(mainAccId) });
        console.log('主账户详情响应:', mainAccountDetail);
        if (mainAccountDetail && typeof mainAccountDetail.equity === 'number') {
          setMainAccountBalance(formatNumber(mainAccountDetail.equity));
          console.log('主账户余额更新为:', mainAccountDetail.equity);
        } else {
          console.warn('主账户equity字段无效:', mainAccountDetail);
        }
      } else {
        console.log('主账户ID不存在，跳过获取主账户余额');
      }

      console.log('=== 账户余额获取完成 ===');
    } catch (err: any) {
      console.error('获取账户余额失败:', err);
      // 不显示错误，使用默认余额
    }
  };

  // 在组件加载时获取实时余额
  useEffect(() => {
    fetchBalances();
  }, [account.id, account.mainAccId, parentAccount?.id]);

  // Get source and target based on direction
  const getSourceTarget = () => {
    // 创建带有实时余额的账户对象
    const subAccountWithBalance = { ...account, netValue: subAccountBalance };
    const mainAccountWithBalance = mainAccount ? { ...mainAccount, netValue: mainAccountBalance } : null;

    if (isReversed) {
      return {
        sourceAccount: subAccountWithBalance,
        targetAccount: mainAccountWithBalance,
        sourceLabel: '子账户',
        targetLabel: '主账户'
      };
    } else {
      return {
        sourceAccount: mainAccountWithBalance,
        targetAccount: subAccountWithBalance,
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

  const handleConfirm = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('请输入有效的划转金额');
      return;
    }

    if (!sourceAccount || !targetAccount) {
      setError('账户信息不完整');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) {
        throw new Error('未登录，请先登录');
      }

      // 构建API请求参数
      const request: AccountTransferReq = {
        amount: parseFloat(amount),
        fromAccountId: parseInt(sourceAccount.id),
        toAccountId: parseInt(targetAccount.id),
      };

      console.log('准备资金划转，请求参数:', request);

      const result = await transferAccount(token, request);
      console.log('资金划转成功！返回结果:', result);

      // 划转成功后重新获取账户余额
      console.log('划转成功，重新获取账户余额...');
      await fetchBalances();

      // 显示成功提示框
      console.log('显示成功提示框');
      setShowSuccessModal(true);
    } catch (err: any) {
      setError(err.message || '资金划转失败');
      console.error('资金划转失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const availableBalance = sourceAccount?.netValue || '0.00';

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Error Message - Fixed at top */}
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800 mb-1">划转失败</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md mx-4">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">划转成功</h2>
              <p className="text-gray-600 mb-6">
                已成功从{sourceLabel}划转 {amount} USDT 到{targetLabel}
              </p>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  onBack();
                }}
                className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

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
                <div className="mt-2 text-sm text-gray-500">
                  可用余额: <span className="text-gray-900">{sourceAccount?.netValue || '0.00'} USDT</span>
                </div>
              </div>

              {/* Switch Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleSwitch}
                  disabled={loading}
                  className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-500 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                <div className="mt-2 text-sm text-gray-500">
                  可用余额: <span className="text-gray-900">{targetAccount?.netValue || '0.00'} USDT</span>
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
                <div className="absolute top-1/2 -translate-y-1/2 text-gray-500" style={{ right: '30px' }}>
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
              disabled={loading}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              取消
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>划转中...</span>
                </>
              ) : (
                '确定'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

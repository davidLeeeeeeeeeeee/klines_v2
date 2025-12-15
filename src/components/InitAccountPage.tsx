import { useState, useEffect } from 'react';
import { ChevronLeft, User, Settings, AlertCircle, X } from 'lucide-react';
import { createBybitSubAccounts, BybitAccountInitReq } from '../services/api';
import { getToken } from '../utils/storage';

interface InitAccountPageProps {
  account: {
    id: string;
    exchange: string;
    accountName: string;
    uid: string;
    netValue: string;
  };
  onBack: () => void;
  onSave?: (data: any) => void; // 改为可选
  subAccountCount?: number;
}

export function InitAccountPage({ account, onBack, onSave, subAccountCount }: InitAccountPageProps) {
  const [formData, setFormData] = useState({
    subAccountPrefix: '',
    subAccountCount: '',
    subAccountValue: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdCount, setCreatedCount] = useState(0);

  // 调试：监听 error 状态变化
  useEffect(() => {
    console.log('InitAccountPage - error 状态变化:', error);
    if (error) {
      console.log('错误提示框应该显示了！');
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) {
        throw new Error('未登录，请先登录');
      }

      // 验证前缀长度
      if (formData.subAccountPrefix.length < 4) {
        throw new Error('子账户前缀需要4个字符以上');
      }

      // 构建API请求参数
      const request: BybitAccountInitReq = {
        mainAccId: Number(account.id), // 主账号数据库ID
        num: Number(formData.subAccountCount), // 子账户数量
        subBalance: Number(formData.subAccountValue), // 子账户余额(整数)
        subPrefix: formData.subAccountPrefix // 子账户前缀
      };

      console.log('准备创建子账户，请求参数:', request);

      const count = await createBybitSubAccounts(token, request);
      console.log(`成功创建 ${count} 个子账户`);

      // 调用父组件的保存回调（如果提供）
      if (onSave) {
        onSave(formData);
      }

      // 保存创建数量并显示成功提示框
      console.log('显示成功提示框，创建数量:', count);
      setCreatedCount(count);
      setShowSuccessModal(true);
    } catch (err: any) {
      const errorMessage = err.message || '创建子账户失败';
      console.error('创建子账户失败:', err);
      console.error('错误信息:', errorMessage);
      console.error('设置错误状态...');
      setError(errorMessage);
      console.error('错误状态已设置');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Error Message - Fixed at top */}
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800 mb-1">创建失败</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                console.log('关闭错误提示框');
                setError(null);
              }}
              className="text-red-400 hover:text-red-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
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
              <h1 className="text-2xl font-semibold text-gray-900">创建子账户</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">

          <form onSubmit={handleSubmit}>
            {/* Main Account Info */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                <User className="w-5 h-5 text-blue-600" />
                <h2 className="text-gray-900">主账户</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-2">
                    主账户
                  </label>
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 flex justify-between items-center">
                    <span>{account.accountName}</span>
                    <span>{account.uid}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-2">
                    主账户净值
                  </label>
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 flex justify-between items-center">
                    <span>{account.netValue}</span>
                    <span className="text-gray-500">USDT</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-2">
                    当前子账户数量
                  </label>
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 flex justify-between items-center">
                    <span>{subAccountCount || 0}</span>
                    <span className="text-gray-500">个</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sub Account Creation */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                <Settings className="w-5 h-5 text-blue-600" />
                <h2 className="text-gray-900">子账户创建</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-2">
                    名称前缀 * <span className="text-xs text-gray-400">(至少4个字符)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.subAccountPrefix}
                    onChange={(e) => setFormData({ ...formData, subAccountPrefix: e.target.value })}
                    placeholder="请输入名称前缀（至少4个字符）"
                    minLength={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                  <p className="mt-1.5 text-xs text-gray-400">
                    系统将自动设置子账户名称：名称前缀_序号
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-2">
                    账户数 *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.subAccountCount}
                    onChange={(e) => setFormData({ ...formData, subAccountCount: e.target.value })}
                    placeholder="请输入账户数"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                  <p className="mt-1.5 text-xs text-gray-400">
                    您要新增的子账户数量
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-2">
                    账户净值 *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.subAccountValue}
                      onChange={(e) => setFormData({ ...formData, subAccountValue: e.target.value })}
                      placeholder="请输入每个子账户的净值"
                      className="w-full px-4 py-2 pr-20 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                      required
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                      USDT
                    </div>
                  </div>
                  <p className="mt-1.5 text-xs text-gray-400">
                    系统将自动从主账户划转资金到每个子账户
                  </p>
                </div>
              </div>
            </div>

            {/* Creation Instructions */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                <h2 className="text-gray-900">创建说明</h2>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>请确认主账户可创建的最大子账户数量</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>请确认主账户有足够资金划转到每个子账户</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>本着保利润、控风险的原则，本系统主账户不做任何交易，只用子账户进行交易</span>
                  </li>
                </ul>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="bg-white border-t border-gray-200 sticky bottom-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onBack}
              disabled={loading}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              取消
            </button>
            <button
              type="button"
              onClick={(e) => {
                const form = document.querySelector('form');
                if (form && form.checkValidity()) {
                  handleSubmit(e as any);
                } else {
                  form?.reportValidity();
                }
              }}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '创建中...' : '确定'}
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={(e) => {
          // 点击背景关闭
          if (e.target === e.currentTarget) {
            setShowSuccessModal(false);
            onBack();
          }
        }}>
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">创建成功</h3>
              <p className="text-sm text-gray-600 mb-6">
                成功创建 {createdCount} 个子账户
              </p>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  onBack();
                }}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


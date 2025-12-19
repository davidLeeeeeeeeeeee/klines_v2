import { useState } from 'react';
import { ChevronLeft, ChevronDown, Building2, User, Key, Eye, EyeOff, AlertCircle, Shield, X, CheckCircle } from 'lucide-react';
import { modifyAccount, AccountModifyReq } from '../services/api';
import { getToken } from '../utils/storage';

type InitStatus = '已初始化' | '未初始化' | '初始化失败';

interface EditTradingAccountPageProps {
  account: {
    id: string;
    exchange: string;
    uid: string;
    accountName: string;
    apiKey: string;
    apiSecret: string;
    apiPassphrase?: string;
    initStatus: InitStatus;
    accountType?: '主账户' | '子账户';
  };
  onBack: () => void;
  onSave: (data: any) => void;
}

export function EditTradingAccountPage({ account, onBack, onSave }: EditTradingAccountPageProps) {
  const [formData, setFormData] = useState({
    exchange: account.exchange,
    uid: account.uid,
    accountName: account.accountName,
    apiKey: account.apiKey,
    apiSecret: account.apiSecret,
    apiPassphrase: account.apiPassphrase || '',
    initStatus: account.initStatus
  });

  const [showApiSecret, setShowApiSecret] = useState(false);
  const [showApiPassphrase, setShowApiPassphrase] = useState(false);
  const [showExchangeDropdown, setShowExchangeDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const exchanges = [
    'Binance',
    'OKX',
    'Bybit',
    'Bitget',
    'Gate.io',
    'Huobi',
    'KuCoin',
    'Coinbase'
  ];

  const statuses: InitStatus[] = ['已初始化', '未初始化', '初始化失败'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) {
        throw new Error('未登录，请先登录');
      }

      // 构建API请求参数
      const request: AccountModifyReq = {
        id: parseInt(account.id),
        name: formData.accountName,
      };

      console.log('准备编辑账号，请求参数:', request);

      const result = await modifyAccount(token, request);
      console.log('账号编辑成功！返回结果:', result);

      // 调用父组件的保存回调（如果提供）
      if (onSave) {
        onSave(formData);
      }

      // 显示成功提示框
      console.log('显示成功提示框');
      setShowSuccessModal(true);
    } catch (err: any) {
      setError(err.message || '编辑账户失败');
      console.error('编辑账号失败:', err);
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
              <h3 className="text-sm font-medium text-red-800 mb-1">编辑失败</h3>
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
              <h2 className="text-xl font-semibold text-gray-900 mb-2">编辑成功</h2>
              <p className="text-gray-600 mb-6">账户信息已成功更新</p>
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
              <h1 className="text-2xl font-semibold text-gray-900">
                {account.accountType === '子账户' ? '编辑子账户' : '编辑主账户'}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <form onSubmit={handleSubmit}>
            {/* Exchange Info */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h2 className="text-gray-900">交易所信息</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-2">
                    选择交易所 *
                  </label>
                  <div className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed">
                    {formData.exchange}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-2">
                    UID *
                  </label>
                  <input
                    type="text"
                    value={formData.uid}
                    readOnly
                    className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                <User className="w-5 h-5 text-blue-600" />
                <h2 className="text-gray-900">账户信息</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-2">
                    账户名称 *
                  </label>
                  <input
                    type="text"
                    value={formData.accountName}
                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>
              </div>
            </div>

            {/* API Configuration */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                <Key className="w-5 h-5 text-blue-600" />
                <h2 className="text-gray-900">API配置</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-2">
                    API Key
                  </label>
                  <input
                    type="text"
                    value={formData.apiKey}
                    readOnly
                    className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-2">
                    API Secret
                  </label>
                  <div className="relative">
                    <input
                      type={showApiSecret ? 'text' : 'password'}
                      value={formData.apiSecret}
                      readOnly
                      className="w-full px-4 py-2 pr-12 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiSecret(!showApiSecret)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showApiSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-2">
                    API Passphrase
                  </label>
                  <div className="relative">
                    <input
                      type={showApiPassphrase ? 'text' : 'password'}
                      value={formData.apiPassphrase}
                      readOnly
                      className="w-full px-4 py-2 pr-12 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiPassphrase(!showApiPassphrase)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showApiPassphrase ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Configuration */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                <Shield className="w-5 h-5 text-blue-600" />
                <h2 className="text-gray-900">状态管理</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-2">
                    初始化状态
                  </label>
                  <div className="relative">
                    <div className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed">
                      {formData.initStatus}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                <h2 className="text-gray-900">安全提示</h2>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>请确保 API Key 具有必要的权限</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>API Secret 和 Passphrase 将被安全存储</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>不要将API Secret分享给他人</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>定期更换API密钥以提高安全性</span>
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
              className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>保存中...</span>
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
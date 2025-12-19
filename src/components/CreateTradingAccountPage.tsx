import { useState } from 'react';
import { ChevronLeft, ChevronDown, Building2, User, Key, Eye, EyeOff, AlertCircle, X } from 'lucide-react';
import { createMainAccount, AccountCreateReq } from '../services/api';
import { getToken } from '../utils/storage';

interface CreateTradingAccountPageProps {
  onBack: () => void;
  onSave?: (data: any) => void; // 改为可选
}

export function CreateTradingAccountPage({ onBack, onSave }: CreateTradingAccountPageProps) {
  const [formData, setFormData] = useState({
    exchange: 'Binance',
    uid: '',
    accountName: '',
    apiKey: '',
    apiSecret: '',
    apiPassphrase: ''
  });

  const [showApiSecret, setShowApiSecret] = useState(false);
  const [showApiPassphrase, setShowApiPassphrase] = useState(false);
  const [showExchangeDropdown, setShowExchangeDropdown] = useState(false);
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
      // 处理交易所名称：移除 .io 后缀并转换为大写
      let exchangeName = formData.exchange;
      if (exchangeName === 'Gate.io') {
        exchangeName = 'GATE';
      } else {
        exchangeName = exchangeName.toUpperCase();
      }

      const request: AccountCreateReq = {
        accType: 0, // 主账号
        apiKey: formData.apiKey,
        apiPassphrase: formData.apiPassphrase || '',
        apiSecret: formData.apiSecret,
        exchange: exchangeName,
        mainAccId: -1, // 主账号该值为-1
        name: formData.accountName,
        strategyType: '' // 可选，暂时为空
      };

      console.log('准备创建主账号，请求参数:', request);

      await createMainAccount(token, request);
      console.log('主账号创建成功！');

      // 调用父组件的保存回调（如果提供）
      if (onSave) {
        onSave(formData);
      }

      // 显示成功提示框
      console.log('显示成功提示框');
      setShowSuccessModal(true);
    } catch (err: any) {
      setError(err.message || '创建账户失败');
      console.error('创建主账号失败:', err);
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
              onClick={() => setError(null)}
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
              <h1 className="text-2xl font-semibold text-gray-900">绑定交易账户</h1>
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
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowExchangeDropdown(!showExchangeDropdown)}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-left flex items-center justify-between hover:border-gray-400 transition-colors"
                    >
                      <span className="text-gray-900">{formData.exchange}</span>
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    </button>

                    {showExchangeDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-20">
                        {exchanges.map((exchange) => (
                          <button
                            type="button"
                            key={exchange}
                            onClick={() => {
                              setFormData({ ...formData, exchange });
                              setShowExchangeDropdown(false);
                            }}
                            className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                              formData.exchange === exchange ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                            }`}
                          >
                            {exchange}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-2">
                    UID
                  </label>
                  <input
                    type="text"
                    value={formData.uid}
                    onChange={(e) => setFormData({ ...formData, uid: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="请输入交易所UID（可选）"
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
                    placeholder="例如：主交易账户"
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
                    API Key *
                  </label>
                  <input
                    type="text"
                    value={formData.apiKey}
                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono text-sm"
                    placeholder="请输入API Key"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-2">
                    API Secret *
                  </label>
                  <div className="relative">
                    <input
                      type={showApiSecret ? 'text' : 'password'}
                      value={formData.apiSecret}
                      onChange={(e) => setFormData({ ...formData, apiSecret: e.target.value })}
                      className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono text-sm"
                      placeholder="请输入API Secret"
                      required
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
                      onChange={(e) => setFormData({ ...formData, apiPassphrase: e.target.value })}
                      className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono text-sm"
                      placeholder="请输入API Passphrase"
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
              className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '创建中...' : '添加账户'}
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
              <p className="text-sm text-gray-600 mb-6">主账户已成功创建</p>
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
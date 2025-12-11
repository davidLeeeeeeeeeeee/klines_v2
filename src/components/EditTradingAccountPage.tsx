import { useState } from 'react';
import { ChevronLeft, ChevronDown, Building2, User, Key, Eye, EyeOff, AlertCircle, Shield } from 'lucide-react';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onBack();
  };

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
              <h1 className="text-2xl font-semibold text-gray-900">编辑交易账户</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <form onSubmit={handleSubmit}>
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
                    UID *
                  </label>
                  <input
                    type="text"
                    value={formData.uid}
                    onChange={(e) => setFormData({ ...formData, uid: e.target.value })}
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
                    API Key *
                  </label>
                  <input
                    type="text"
                    value={formData.apiKey}
                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono text-sm"
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
                    <button
                      type="button"
                      onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-left flex items-center justify-between hover:border-gray-400 transition-colors"
                    >
                      <span className="text-gray-900">{formData.initStatus}</span>
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    </button>

                    {showStatusDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-20">
                        {statuses.map((status) => (
                          <button
                            type="button"
                            key={status}
                            onClick={() => {
                              setFormData({ ...formData, initStatus: status });
                              setShowStatusDropdown(false);
                            }}
                            className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                              formData.initStatus === status ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    )}
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
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
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
              className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              保存修改
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}